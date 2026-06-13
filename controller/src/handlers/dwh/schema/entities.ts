// Entity (= user-defined table) endpoints: GET/POST/DELETE /dwh/entities.
// Creating an entity generates a real physical table (d_{projectId}_{name}) from the catalog via
// the dialect-aware DDL generator. Auth reuses the project/role model: read needs "user", write
// needs "admin" on the entity's project.

import { Env } from "../../../types";
import {
    HttpError,
    readJson,
    requireProjectRole,
    requireUser,
    getAllowedProjectIds,
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
    ColumnRow,
    EntityRow,
} from "./catalog";

const methodNotAllowed = () => new Response("Method not allowed", { status: 405 });

interface IncomingColumn {
    name: string;
    display_name?: string;
    data_type: DataType;
    is_nullable?: boolean;
    is_unique?: boolean;
    default_value?: string | null;
    ref_entity_id?: number | null;
    on_delete?: string | null;
}

// Serialize an entity together with its columns — the shape consumed by the sidebar, schema
// builder, ER playground and generic data page.
async function entityWithColumns(env: Env, entity: EntityRow) {
    const columns = await getColumns(env, entity.id);
    return { ...entity, is_managed: !!entity.is_managed, columns };
}

// GET /dwh/entities?project_id=N  → entities (+columns) for one project the caller can read.
const handleList = async (req: Request, env: Env) => {
    const url = new URL(req.url);
    const projectIdRaw = url.searchParams.get("project_id");
    if (!projectIdRaw) throw new HttpError(400, "project_id is required");
    const projectId = Number(projectIdRaw);
    if (Number.isNaN(projectId)) throw new HttpError(400, "project_id must be a number");

    await requireProjectRole(req, env, projectId, "user");
    const entities = await listEntities(env, projectId);
    const withCols = await Promise.all(entities.map((e) => entityWithColumns(env, e)));
    return Response.json(withCols);
};

// POST /dwh/entities  { project_id, name, display_name?, columns?[] }
const handleCreate = async (req: Request, env: Env) => {
    const data = await readJson<{
        project_id: number;
        name: string;
        display_name?: string;
        columns?: IncomingColumn[];
    }>(req);

    if (!data.project_id) throw new HttpError(400, "project_id is required");
    await requireProjectRole(req, env, data.project_id, "admin");

    const name = safeColumnName((data.name || "").toLowerCase());
    if (await getEntityByName(env, data.project_id, name)) {
        throw new HttpError(409, `An entity named "${name}" already exists in this project`);
    }

    const dialect = resolveDialect(env.DB_DIALECT);
    const physical = physicalTableName(data.project_id, name);

    // Resolve incoming columns into ColumnSpec for DDL + validate references belong to this project.
    const incoming = data.columns ?? [];
    const specs: ColumnSpec[] = [];
    const refTargets: Record<string, number> = {}; // colName -> ref_entity_id
    for (const col of incoming) {
        if (!DATA_TYPES.includes(col.data_type)) throw new HttpError(400, `Invalid data_type "${col.data_type}"`);
        const colName = safeColumnName((col.name || "").toLowerCase());
        let refPhysical: string | null = null;
        if (col.data_type === "reference") {
            if (!col.ref_entity_id) throw new HttpError(400, `Reference column "${colName}" needs ref_entity_id`);
            const target = await getEntityById(env, col.ref_entity_id);
            if (!target || target.project_id !== data.project_id) {
                throw new HttpError(400, `Reference target ${col.ref_entity_id} not found in this project`);
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

    // 1. Create the physical table first; if catalog inserts then fail, we can DROP it.
    await env.DB.prepare(createTableSQL(physical, specs, dialect)).run();

    try {
        const entityRes = await env.DB.prepare(
            `INSERT INTO dwh_entities (project_id, name, display_name, physical_table, project_column, is_managed)
             VALUES (?, ?, ?, ?, NULL, ?)`
        ).bind(data.project_id, name, data.display_name ?? name, physical, true).run();
        const entityId = entityRes.meta?.last_row_id as number;

        // Surrogate id column (system), then the user columns in order.
        await env.DB.prepare(
            `INSERT INTO dwh_columns (entity_id, name, display_name, data_type, is_nullable, is_unique, position, is_system)
             VALUES (?, 'id', 'ID', 'integer', ?, ?, 0, ?)`
        ).bind(entityId, false, true, true).run();

        let pos = 1;
        for (const col of incoming) {
            const colName = safeColumnName((col.name || "").toLowerCase());
            await env.DB.prepare(
                `INSERT INTO dwh_columns
                     (entity_id, name, display_name, data_type, is_nullable, is_unique, default_value, position, ref_entity_id, on_delete, is_system)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            ).bind(
                entityId,
                colName,
                col.display_name ?? colName,
                col.data_type,
                col.is_nullable !== false,
                !!col.is_unique,
                col.default_value ?? null,
                pos++,
                refTargets[colName] ?? null,
                col.data_type === "reference" ? (col.on_delete ?? "restrict") : null,
                false,
            ).run();
        }

        const entity = await getEntityById(env, entityId);
        return Response.json(await entityWithColumns(env, entity as EntityRow), { status: 201 });
    } catch (e) {
        // Roll back the physical table so we don't orphan it.
        try { await env.DB.prepare(dropTableSQL(physical)).run(); } catch { /* best effort */ }
        if (e instanceof HttpError) throw e;
        console.error("create entity failed:", e);
        throw new HttpError(500, "Could not create entity");
    }
};

// DELETE /dwh/entities?id=N  → drop the physical table (only if managed) + remove catalog rows.
const handleDelete = async (req: Request, env: Env) => {
    const url = new URL(req.url);
    const id = Number(url.searchParams.get("id"));
    if (!id) throw new HttpError(400, "id is required");

    const entity = await getEntityById(env, id);
    if (!entity) throw new HttpError(404, "Entity not found");
    await requireProjectRole(req, env, entity.project_id, "admin");

    // Detach catalog references that point at this entity (physical columns are left in place — a
    // SQLite column drop needs a table rebuild; the logical link is removed).
    await env.DB.prepare("UPDATE dwh_columns SET ref_entity_id = NULL, on_delete = NULL WHERE ref_entity_id = ?")
        .bind(id).run();
    await env.DB.prepare("DELETE FROM dwh_columns WHERE entity_id = ?").bind(id).run();
    await env.DB.prepare("DELETE FROM dwh_entities WHERE id = ?").bind(id).run();

    if (entity.is_managed) {
        await env.DB.prepare(dropTableSQL(entity.physical_table)).run();
    }
    return new Response("Deleted", { status: 200 });
};

export const entitiesHandler = async (req: Request, env: Env) => {
    switch (req.method) {
        case "GET": return handleList(req, env);
        case "POST": return handleCreate(req, env);
        case "DELETE": return handleDelete(req, env);
        default: return methodNotAllowed();
    }
};
