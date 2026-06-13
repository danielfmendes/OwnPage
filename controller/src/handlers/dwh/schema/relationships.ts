// Relationship endpoint: POST /dwh/relationships — the ER-playground "create connection". It adds a
// nullable reference column on the source entity pointing at the target entity (the only FK form
// SQLite/D1 allows post-creation). Deleting a relationship = deleting that column via /dwh/columns.

import { Env } from "../../../types";
import { HttpError, readJson, requireProjectRole } from "../../../utils/auth";
import { getEntityById } from "./catalog";
import { addColumnToEntity } from "./columns";
import { safeColumnName } from "./ddl";

const methodNotAllowed = () => new Response("Method not allowed", { status: 405 });

interface RelationshipBody {
    from_entity_id: number;
    to_entity_id: number;
    column_name?: string;
    on_delete?: string;
}

const handleCreate = async (req: Request, env: Env) => {
    const body = await readJson<RelationshipBody>(req);
    if (!body.from_entity_id || !body.to_entity_id) {
        throw new HttpError(400, "from_entity_id and to_entity_id are required");
    }

    const from = await getEntityById(env, body.from_entity_id);
    const to = await getEntityById(env, body.to_entity_id);
    if (!from || !to) throw new HttpError(404, "Source or target entity not found");
    if (from.project_id !== to.project_id) {
        throw new HttpError(400, "Both entities must belong to the same project");
    }
    await requireProjectRole(req, env, from.project_id, "admin");

    // Default FK column name: <target>_id (e.g. owner_id). Validated like any column name.
    const columnName = safeColumnName((body.column_name || `${to.name}_id`).toLowerCase());

    return addColumnToEntity(env, {
        entity_id: from.id,
        name: columnName,
        display_name: columnName,
        data_type: "reference",
        is_nullable: true,
        ref_entity_id: to.id,
        on_delete: body.on_delete ?? "restrict",
    });
};

export const relationshipsHandler = async (req: Request, env: Env) => {
    switch (req.method) {
        case "POST": return handleCreate(req, env);
        default: return methodNotAllowed();
    }
};
