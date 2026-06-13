// Generic data CRUD for user-defined entities: GET/POST/PUT/DELETE /dwh/data/:entity?project_id=N.
// Resolves the entity from the catalog, then reads/writes its physical table. GET reuses
// queryWithPagination (so the {items,totalCount} shape is identical to the legacy endpoints).
// Auth: read needs "user", write needs "admin" on the entity's project.

import { Env } from "../../../types";
import { HttpError, readJson, requireProjectRole } from "../../../utils/auth";
import { queryWithPagination } from "../pagination";
import { getColumns, getEntityByName, ColumnRow } from "../schema/catalog";
import { safeIdent } from "../schema/ddl";
import { deleteRowWithPolicy } from "./cascade";

const methodNotAllowed = () => new Response("Method not allowed", { status: 405 });

// Parse "/data/<entity>" → entity name; project from ?project_id.
function parseTarget(req: Request, subPath: string): { entityName: string; projectId: number } {
    const entityName = subPath.replace(/^\/data\//, "").split("/")[0].split("?")[0];
    if (!entityName) throw new HttpError(400, "Entity name missing in path");
    const projectId = Number(new URL(req.url).searchParams.get("project_id"));
    if (!projectId) throw new HttpError(400, "project_id is required");
    return { entityName, projectId };
}

// Non-system, writable columns for this entity.
function writableColumns(columns: ColumnRow[]): ColumnRow[] {
    return columns.filter((c) => !c.is_system);
}

export const dataHandler = async (req: Request, env: Env, subPath: string): Promise<Response> => {
    const { entityName, projectId } = parseTarget(req, subPath);
    const entity = await getEntityByName(env, projectId, entityName);
    if (!entity) throw new HttpError(404, `Entity "${entityName}" not found in this project`);

    const table = safeIdent(entity.physical_table);
    // Demo entities can share a physical table across projects (project_column set); managed tables
    // belong wholly to one project, so no row filter is needed.
    const projCol = entity.project_column ? safeIdent(entity.project_column) : null;

    if (req.method === "GET") {
        await requireProjectRole(req, env, projectId, "user");
        const base = projCol
            ? `SELECT * FROM ${table} WHERE ${projCol} = ${Number(projectId)}`
            : `SELECT * FROM ${table}`;
        const count = projCol
            ? `SELECT COUNT(*) AS count FROM ${table} WHERE ${projCol} = ${Number(projectId)}`
            : `SELECT COUNT(*) AS count FROM ${table}`;
        return queryWithPagination(req, env, base, count);
    }

    // All writes require admin on the project.
    await requireProjectRole(req, env, projectId, "admin");
    const columns = await getColumns(env, entity.id);

    if (req.method === "POST") {
        const data = await readJson<Record<string, any>>(req);
        const cols = writableColumns(columns).filter((c) => data[c.name] !== undefined);
        const names = cols.map((c) => safeIdent(c.name));
        const values = cols.map((c) => data[c.name]);
        if (projCol) { names.push(projCol); values.push(projectId); }
        if (names.length === 0) throw new HttpError(400, "No known columns provided");
        const placeholders = names.map(() => "?").join(", ");
        await env.DB.prepare(
            `INSERT INTO ${table} (${names.join(", ")}) VALUES (${placeholders})`
        ).bind(...values).run();
        return new Response("Created", { status: 201 });
    }

    if (req.method === "PUT") {
        const data = await readJson<Record<string, any>>(req);
        if (data.id === undefined || data.id === null) throw new HttpError(400, "id is required");
        const cols = writableColumns(columns).filter((c) => data[c.name] !== undefined);
        if (cols.length === 0) throw new HttpError(400, "No known columns provided");
        const setClause = cols.map((c) => `${safeIdent(c.name)} = ?`).join(", ");
        const values = cols.map((c) => data[c.name]);
        await env.DB.prepare(`UPDATE ${table} SET ${setClause} WHERE id = ?`).bind(...values, data.id).run();
        return new Response("Updated", { status: 200 });
    }

    if (req.method === "DELETE") {
        const url = new URL(req.url);
        const id = url.searchParams.get("id");
        if (!id) throw new HttpError(400, "id is required");
        const cascade = url.searchParams.get("cascade") === "true";
        await deleteRowWithPolicy(env, entity, id, cascade);
        return new Response("Deleted", { status: 200 });
    }

    return methodNotAllowed();
};
