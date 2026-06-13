// Column endpoints: POST /dwh/columns (add a column to an entity via ALTER TABLE ADD COLUMN) and
// DELETE /dwh/columns?id= (drop a column). Reference-typed columns are the FK mechanism and are
// usually created via /dwh/relationships, but POST here also accepts them.

import { Env } from "../../../types";
import { HttpError, readJson, requireProjectRole } from "../../../utils/auth";
import {
    addColumnSQL,
    addReferenceColumnSQLNoConstraint,
    resolveDialect,
    safeColumnName,
    safeIdent,
    ColumnSpec,
    DataType,
    DATA_TYPES,
} from "./ddl";
import { getColumns, getEntityById } from "./catalog";

const methodNotAllowed = () => new Response("Method not allowed", { status: 405 });

interface AddColumnBody {
    entity_id: number;
    name: string;
    display_name?: string;
    data_type: DataType;
    is_nullable?: boolean;
    is_unique?: boolean;
    default_value?: string | null;
    ref_entity_id?: number | null;
    on_delete?: string | null;
}

// Shared by columns.ts and relationships.ts: validate, ALTER the physical table, record metadata.
// Auth (admin on the entity's project) is the CALLER's responsibility — it has the Request.
export async function addColumnToEntity(env: Env, body: AddColumnBody): Promise<Response> {
    const entity = await getEntityById(env, body.entity_id);
    if (!entity) throw new HttpError(404, "Entity not found");

    if (!DATA_TYPES.includes(body.data_type)) throw new HttpError(400, `Invalid data_type "${body.data_type}"`);
    const name = safeColumnName((body.name || "").toLowerCase());

    const existing = await getColumns(env, entity.id);
    if (existing.some((c) => c.name === name)) {
        throw new HttpError(409, `Column "${name}" already exists on this entity`);
    }
    const nextPos = existing.reduce((m, c) => Math.max(m, c.position), 0) + 1;

    let refPhysical: string | null = null;
    let refEntityId: number | null = null;
    if (body.data_type === "reference") {
        if (!body.ref_entity_id) throw new HttpError(400, "Reference column needs ref_entity_id");
        const target = await getEntityById(env, body.ref_entity_id);
        if (!target || target.project_id !== entity.project_id) {
            throw new HttpError(400, "Reference target not found in this project");
        }
        refPhysical = target.physical_table;
        refEntityId = target.id;
    }

    const dialect = resolveDialect(env.DB_DIALECT);
    const spec: ColumnSpec = {
        name,
        data_type: body.data_type,
        is_nullable: body.is_nullable !== false,
        is_unique: !!body.is_unique,
        default_value: body.default_value ?? null,
        ref_physical_table: refPhysical,
    };

    // Apply DDL. For reference columns, fall back to a constraint-less integer column if the engine
    // rejects the inline REFERENCES (some D1 cases) — the FK then lives only in the catalog.
    try {
        await env.DB.prepare(addColumnSQL(entity.physical_table, spec, dialect)).run();
    } catch (e) {
        if (body.data_type === "reference") {
            await env.DB.prepare(addReferenceColumnSQLNoConstraint(entity.physical_table, name)).run();
        } else {
            throw e;
        }
    }

    await env.DB.prepare(
        `INSERT INTO dwh_columns
             (entity_id, name, display_name, data_type, is_nullable, is_unique, default_value, position, ref_entity_id, on_delete, is_system)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
        entity.id, name, body.display_name ?? name, body.data_type,
        body.is_nullable !== false, !!body.is_unique, body.default_value ?? null,
        nextPos, refEntityId, body.data_type === "reference" ? (body.on_delete ?? "restrict") : null, false,
    ).run();

    return new Response("Created", { status: 201 });
}

const handleAdd = async (req: Request, env: Env) => {
    const body = await readJson<AddColumnBody>(req);
    const entity = await getEntityById(env, body.entity_id);
    if (!entity) throw new HttpError(404, "Entity not found");
    await requireProjectRole(req, env, entity.project_id, "admin");
    return addColumnToEntity(env, body);
};

const handleDelete = async (req: Request, env: Env) => {
    const id = Number(new URL(req.url).searchParams.get("id"));
    if (!id) throw new HttpError(400, "id is required");
    const col = await env.DB.prepare("SELECT * FROM dwh_columns WHERE id = ?").bind(id).first<any>();
    if (!col) throw new HttpError(404, "Column not found");
    if (col.is_system) throw new HttpError(400, "System columns cannot be deleted");
    const entity = await getEntityById(env, col.entity_id);
    if (!entity) throw new HttpError(404, "Entity not found");
    await requireProjectRole(req, env, entity.project_id, "admin");

    // Drop the physical column (SQLite 3.35+/D1 and Postgres both support DROP COLUMN). If it fails
    // we still remove the catalog row so the UI stays consistent.
    try {
        await env.DB.prepare(
            `ALTER TABLE ${safeIdent(entity.physical_table)} DROP COLUMN ${safeIdent(col.name)}`
        ).run();
    } catch (e) {
        console.error("drop column failed (removing catalog row anyway):", e);
    }
    await env.DB.prepare("DELETE FROM dwh_columns WHERE id = ?").bind(id).run();
    return new Response("Deleted", { status: 200 });
};

export const columnsHandler = async (req: Request, env: Env) => {
    switch (req.method) {
        case "POST": return handleAdd(req, env);
        case "DELETE": return handleDelete(req, env);
        default: return methodNotAllowed();
    }
};
