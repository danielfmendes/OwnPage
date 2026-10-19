// Entity (= user-defined table) endpoints, SCHEMA-scoped: GET/POST/DELETE /dwh/entities and
// GET /dwh/entities/ddl, GET /dwh/entities/impact. Creating an entity generates a real physical
// table s{schemaId}_{name} with a project_id discriminator column. Auth: read needs schema read,
// write needs schema write.

import { Env } from "../../../types";
import {
    HttpError,
    readJson,
    requireSchemaRead,
    requireSchemaWrite,
} from "../../../utils/auth";
import {
    ColumnSpec,
    createTableSQL,
    dropTableSQL,
    physicalTableName,
    resolveDialect,
    safeColumnName,
    DataType,
    DATA_TYPES,
} from "./ddl";
import {
    getColumns,
    getEntityById,
    getEntityByName,
    listEntities,
    EntityRow,
} from "./catalog";

const methodNotAllowed = () => new Response("Method not allowed", { status: 405 });

export interface IncomingColumn {
    name: string;
    display_name?: string;
    data_type: DataType;
    is_nullable?: boolean;
    is_unique?: boolean;
    default_value?: string | null;
    ref_entity_id?: number | null;
    on_delete?: string | null;
}

async function entityWithColumns(env: Env, entity: EntityRow) {
    const columns = await getColumns(env, entity.id);
    return { ...entity, is_managed: !!entity.is_managed, columns };
}

// Shared creator (also used by schemas.ts when building a whole schema). Generates the physical
// table (id PK + user columns + project_id discriminator) and the catalog rows. References must point
// at entities that already exist in this schema; cross-new-table refs are added in a second pass by
// the caller (see schemas.ts).
export async function createEntityInSchema(
    env: Env,
    schemaId: number,
    name: string,
    displayName: string | undefined,
    columns: IncomingColumn[],
): Promise<number> {
    const safeName = safeColumnName(name.toLowerCase());
    if (await getEntityByName(env, schemaId, safeName)) {
        throw new HttpError(409, `An entity named "${safeName}" already exists in this schema`);
    }
    const dialect = resolveDialect(env.DB_DIALECT);
    const physical = physicalTableName(schemaId, safeName);

    const refTargets: Record<string, number> = {};
    const specs: ColumnSpec[] = [];
    for (const col of columns) {
        if (!DATA_TYPES.includes(col.data_type)) throw new HttpError(400, `Invalid data_type "${col.data_type}"`);
        const colName = safeColumnName((col.name || "").toLowerCase());
        let refPhysical: string | null = null;
        if (col.data_type === "reference") {
            if (!col.ref_entity_id) throw new HttpError(400, `Reference column "${colName}" needs ref_entity_id`);
            const target = await getEntityById(env, col.ref_entity_id);
            if (!target || target.schema_id !== schemaId) {
                throw new HttpError(400, `Reference target ${col.ref_entity_id} not found in this schema`);
            }
            refPhysical = target.physical_table;
            refTargets[colName] = col.ref_entity_id;
        }
        specs.push({
            name: colName,
            data_type: col.data_type,
            is_nullable: col.is_nullable !== false,
            is_unique: !!col.is_unique,
            default_value: col.default_value ?? null,
            ref_physical_table: refPhysical,
        });
    }
    // project_id discriminator (so projects sharing this schema compile via project_id IN (...)).
    specs.push({ name: "project_id", data_type: "integer", is_nullable: true });

    await env.DB.prepare(createTableSQL(physical, specs, dialect)).run();

    try {
        const entityRes = await env.DB.prepare(
            `INSERT INTO dwh_entities (schema_id, name, display_name, physical_table, project_column, is_managed)
             VALUES (?, ?, ?, ?, 'project_id', ?)`
        ).bind(schemaId, safeName, displayName ?? safeName, physical, true).run();
        const entityId = entityRes.meta?.last_row_id as number;

        await env.DB.prepare(
            `INSERT INTO dwh_columns (entity_id, name, display_name, data_type, is_nullable, is_unique, position, is_system)
             VALUES (?, 'id', 'ID', 'integer', ?, ?, 0, ?)`
        ).bind(entityId, false, true, true).run();

        let pos = 1;
        for (const col of columns) {
            const colName = safeColumnName((col.name || "").toLowerCase());
            await env.DB.prepare(
                `INSERT INTO dwh_columns
                     (entity_id, name, display_name, data_type, is_nullable, is_unique, default_value, position, ref_entity_id, on_delete, is_system)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            ).bind(
                entityId, colName, col.display_name ?? colName, col.data_type,
                col.is_nullable !== false, !!col.is_unique, col.default_value ?? null,
                pos++, refTargets[colName] ?? null,
                col.data_type === "reference" ? (col.on_delete ?? "restrict") : null, false,
            ).run();
        }

        await env.DB.prepare(
            `INSERT INTO dwh_columns (entity_id, name, display_name, data_type, position, is_system)
             VALUES (?, 'project_id', 'Project', 'integer', ?, ?)`
        ).bind(entityId, pos, true).run();

        return entityId;
    } catch (e) {
        try { await env.DB.prepare(dropTableSQL(physical)).run(); } catch { /* best effort */ }
        throw e;
    }
}

// GET /dwh/entities?schema_id=N
const handleList = async (req: Request, env: Env) => {
    const schemaId = Number(new URL(req.url).searchParams.get("schema_id"));
    if (!schemaId) throw new HttpError(400, "schema_id is required");
    await requireSchemaRead(req, env, schemaId);
    const entities = await listEntities(env, schemaId);
    const withCols = await Promise.all(entities.map((e) => entityWithColumns(env, e)));
    return Response.json(withCols);
};

// POST /dwh/entities { schema_id, name, display_name?, columns?[] }
const handleCreate = async (req: Request, env: Env) => {
    const data = await readJson<{ schema_id: number; name: string; display_name?: string; columns?: IncomingColumn[] }>(req);
    if (!data.schema_id) throw new HttpError(400, "schema_id is required");
    await requireSchemaWrite(req, env, data.schema_id);
    const entityId = await createEntityInSchema(env, data.schema_id, data.name, data.display_name, data.columns ?? []);
    const entity = await getEntityById(env, entityId);
    return Response.json(await entityWithColumns(env, entity as EntityRow), { status: 201 });
};

// DELETE /dwh/entities?id=N
const handleDelete = async (req: Request, env: Env) => {
    const id = Number(new URL(req.url).searchParams.get("id"));
    if (!id) throw new HttpError(400, "id is required");
    const entity = await getEntityById(env, id);
    if (!entity) throw new HttpError(404, "Entity not found");
    await requireSchemaWrite(req, env, entity.schema_id);

    await env.DB.prepare("UPDATE dwh_columns SET ref_entity_id = NULL, on_delete = NULL WHERE ref_entity_id = ?").bind(id).run();
    await env.DB.prepare("DELETE FROM dwh_columns WHERE entity_id = ?").bind(id).run();
    await env.DB.prepare("DELETE FROM dwh_entities WHERE id = ?").bind(id).run();
    if (entity.is_managed) {
        await env.DB.prepare(dropTableSQL(entity.physical_table)).run();
    }
    return new Response("Deleted", { status: 200 });
};

// GET /dwh/entities/ddl?id=N
const handleDdl = async (req: Request, env: Env) => {
    const id = Number(new URL(req.url).searchParams.get("id"));
    if (!id) throw new HttpError(400, "id is required");
    const entity = await getEntityById(env, id);
    if (!entity) throw new HttpError(404, "Entity not found");
    await requireSchemaRead(req, env, entity.schema_id);

    const dialect = resolveDialect(env.DB_DIALECT);
    const columns = await getColumns(env, entity.id);
    const specs: ColumnSpec[] = [];
    for (const c of columns) {
        if (c.is_system && c.name === "id") continue;
        let refPhysical: string | null = null;
        if (c.data_type === "reference" && c.ref_entity_id) {
            const target = await getEntityById(env, c.ref_entity_id);
            refPhysical = target?.physical_table ?? null;
        }
        specs.push({
            name: c.name, data_type: c.data_type, is_nullable: !!c.is_nullable,
            is_unique: !!c.is_unique, default_value: c.default_value, ref_physical_table: refPhysical,
        });
    }
    return Response.json({ ddl: createTableSQL(entity.physical_table, specs, dialect) });
};

// GET /dwh/entities/impact?id=N → row count across the schema's projects (for the destructive warning).
const handleEntityImpact = async (req: Request, env: Env) => {
    const id = Number(new URL(req.url).searchParams.get("id"));
    if (!id) throw new HttpError(400, "id is required");
    const entity = await getEntityById(env, id);
    if (!entity) throw new HttpError(404, "Entity not found");
    await requireSchemaWrite(req, env, entity.schema_id);

    const row = await env.DB.prepare(`SELECT COUNT(*) AS n FROM ${safeTable(entity.physical_table)}`).first<{ n: number }>();
    const rows = Number(row?.n ?? 0);
    return Response.json({
        destructive: rows > 0,
        affectedRows: rows,
        reason: `Dropping "${entity.name}" permanently deletes the table and its ${rows} row(s).`,
    });
};

// local safe-table (avoid importing safeIdent twice; identifiers come from our catalog)
function safeTable(t: string): string {
    if (!/^[a-z][a-z0-9_]*$/.test(t)) throw new HttpError(400, "bad table");
    return t;
}

export const entitiesHandler = async (req: Request, env: Env) => {
    const pathname = new URL(req.url).pathname;
    if (pathname.endsWith("/entities/ddl")) return handleDdl(req, env);
    if (pathname.endsWith("/entities/impact")) return handleEntityImpact(req, env);
    switch (req.method) {
        case "GET": return handleList(req, env);
        case "POST": return handleCreate(req, env);
        case "DELETE": return handleDelete(req, env);
        default: return methodNotAllowed();
    }
};
