// Schema endpoints: GET /dwh/schemas (accessible, with canWrite), GET /dwh/schemas/:id (entities),
// and the shared createSchemaWithEntities() used by project creation. A schema is built in two passes
// so inter-table references resolve once all tables exist.

import { Env } from "../../../types";
import { HttpError, getSchemaAccess, requireSchemaRead, requireUser } from "../../../utils/auth";
import { getColumns, getEntityById, getEntityByName, getSchemaById, listEntities } from "./catalog";
import { createEntityInSchema } from "./entities";
import { addColumnToEntity } from "./columns";
import { parseCreateTables } from "./sqlParse";
import { DataType } from "./ddl";

const methodNotAllowed = () => new Response("Method not allowed", { status: 405 });

export interface SchemaInputColumn {
    name: string;
    display_name?: string;
    data_type: DataType;
    is_nullable?: boolean;
    is_unique?: boolean;
    ref_table?: string;       // reference target by entity name (form or parsed SQL)
    ref_entity_id?: number;   // or by id
    on_delete?: string;
}
export interface SchemaInputEntity {
    name: string;
    display_name?: string;
    columns: SchemaInputColumn[];
}
export interface CreateSchemaInput {
    name: string;
    entities?: SchemaInputEntity[];
    sql?: string;
}

// Create a schema + its tables. Returns the new schema id. Caller handles auth (any authed user may
// create a schema; they gain write access by creating a project on it).
export async function createSchemaWithEntities(env: Env, createdBy: string, input: CreateSchemaInput): Promise<number> {
    const name = (input.name || "").trim();
    if (!name) throw new HttpError(400, "Schema name is required");

    let entities: SchemaInputEntity[] = input.entities ?? [];
    if (input.sql && input.sql.trim()) {
        entities = parseCreateTables(input.sql).map((e) => ({
            name: e.name,
            columns: e.columns.map((c) => ({
                name: c.name, data_type: c.data_type, is_nullable: c.is_nullable,
                is_unique: c.is_unique, ref_table: c.ref_table,
            })),
        }));
    }

    const res = await env.DB.prepare("INSERT INTO dwh_schemas (name, created_by) VALUES (?, ?)").bind(name, createdBy).run();
    const schemaId = res.meta?.last_row_id as number;

    // Pass 1 — scalar columns only.
    for (const e of entities) {
        const scalar = (e.columns || [])
            .filter((c) => c.data_type !== "reference")
            .map((c) => ({ name: c.name, display_name: c.display_name, data_type: c.data_type, is_nullable: c.is_nullable, is_unique: c.is_unique }));
        await createEntityInSchema(env, schemaId, e.name, e.display_name, scalar);
    }

    // Pass 2 — reference columns (targets now exist).
    for (const e of entities) {
        const fromEntity = await getEntityByName(env, schemaId, e.name.toLowerCase());
        if (!fromEntity) continue;
        for (const c of e.columns || []) {
            if (c.data_type !== "reference") continue;
            const target = c.ref_table
                ? await getEntityByName(env, schemaId, c.ref_table.toLowerCase())
                : (c.ref_entity_id ? await getEntityById(env, c.ref_entity_id) : null);
            if (!target) throw new HttpError(400, `Reference target for ${e.name}.${c.name} not found`);
            await addColumnToEntity(env, {
                entity_id: fromEntity.id, name: c.name, data_type: "reference",
                ref_entity_id: target.id, on_delete: c.on_delete ?? "restrict",
            });
        }
    }
    return schemaId;
}

const handleList = async (req: Request, env: Env) => {
    const email = await requireUser(req, env);
    const access = await getSchemaAccess(env, email);
    const out: Array<{ id: number; name: string; canWrite: boolean }> = [];
    for (const [schemaId, a] of access.entries()) {
        const s = await getSchemaById(env, schemaId);
        if (s) out.push({ id: s.id, name: s.name, canWrite: a.canWrite });
    }
    return Response.json(out);
};

const handleGet = async (req: Request, env: Env) => {
    const id = Number(new URL(req.url).pathname.split("/").pop());
    if (!id) throw new HttpError(400, "schema id required");
    await requireSchemaRead(req, env, id);
    const schema = await getSchemaById(env, id);
    if (!schema) throw new HttpError(404, "Schema not found");
    const entities = await listEntities(env, id);
    const withCols = await Promise.all(entities.map(async (e) => ({ ...e, is_managed: !!e.is_managed, columns: await getColumns(env, e.id) })));
    return Response.json({ ...schema, entities: withCols });
};

export const schemasHandler = async (req: Request, env: Env) => {
    const pathname = new URL(req.url).pathname;
    // /dwh/schemas/:id
    if (/\/schemas\/\d+$/.test(pathname)) return handleGet(req, env);
    if (req.method === "GET") return handleList(req, env);
    return methodNotAllowed();
};
