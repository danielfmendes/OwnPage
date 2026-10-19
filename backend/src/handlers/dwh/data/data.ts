// Generic data CRUD for user-defined entities, schema + project aware:
//   GET    /dwh/data/:entity?schema_id=&project_ids=1|2|3   → compiled read (WHERE project_id IN ...)
//   POST   /dwh/data/:entity?schema_id=&project_id=N         → insert into one project
//   PUT    /dwh/data/:entity?schema_id=&project_id=N         → update a row of one project
//   DELETE /dwh/data/:entity?schema_id=&id=N[&cascade=true]  → delete (auth on the row's project)
// Reads need schema read; writes need admin on the single target project.

import { Env } from "../../../types";
import { HttpError, readJson, requireProjectRole, requireSchemaRead } from "../../../utils/auth";
import { queryWithPagination } from "../pagination";
import { getColumns, getEntityByName, projectsForSchema, ColumnRow, EntityRow } from "../schema/catalog";
import { safeIdent } from "../schema/ddl";
import { deleteRowWithPolicy } from "./cascade";

const methodNotAllowed = () => new Response("Method not allowed", { status: 405 });

function entityName(subPath: string): string {
    const name = subPath.replace(/^\/data\//, "").split("/")[0].split("?")[0];
    if (!name) throw new HttpError(400, "Entity name missing in path");
    return name;
}

function parseProjectIds(raw: string | null): number[] {
    if (!raw) return [];
    return raw.split("|").map(Number).filter((n) => !Number.isNaN(n));
}

const writableColumns = (columns: ColumnRow[]): ColumnRow[] => columns.filter((c) => !c.is_system);

export const dataHandler = async (req: Request, env: Env, subPath: string): Promise<Response> => {
    const url = new URL(req.url);
    const schemaId = Number(url.searchParams.get("schema_id"));
    if (!schemaId) throw new HttpError(400, "schema_id is required");
    const name = entityName(subPath);
    const entity = await getEntityByName(env, schemaId, name);
    if (!entity) throw new HttpError(404, `Entity "${name}" not found in this schema`);

    const table = safeIdent(entity.physical_table);
    const projCol = entity.project_column ? safeIdent(entity.project_column) : null;

    if (req.method === "GET") {
        await requireSchemaRead(req, env, schemaId);
        // Restrict requested projects to those that actually belong to this schema.
        const schemaProjects = new Set(await projectsForSchema(env, schemaId));
        const ids = parseProjectIds(url.searchParams.get("project_ids")).filter((id) => schemaProjects.has(id));

        let where = "";
        if (projCol) where = ids.length ? `WHERE ${projCol} IN (${ids.join(", ")})` : "WHERE 1 = 0";
        const base = `SELECT * FROM ${table} ${where}`;
        const count = `SELECT COUNT(*) AS count FROM ${table} ${where}`;
        return queryWithPagination(req, env, base, count);
    }

    // Writes: a single target project (the discriminator), admin required on it.
    if (req.method === "POST" || req.method === "PUT") {
        const projectId = Number(url.searchParams.get("project_id"));
        if (!projectId) throw new HttpError(400, "project_id is required for writes (select a single project)");
        const schemaProjects = new Set(await projectsForSchema(env, schemaId));
        if (projCol && !schemaProjects.has(projectId)) throw new HttpError(400, "project_id does not belong to this schema");
        await requireProjectRole(req, env, projectId, "admin");

        const columns = await getColumns(env, entity.id);
        const data = await readJson<Record<string, any>>(req);
        const cols = writableColumns(columns).filter((c) => data[c.name] !== undefined);

        if (req.method === "POST") {
            const names = cols.map((c) => safeIdent(c.name));
            const values = cols.map((c) => data[c.name]);
            if (projCol) { names.push(projCol); values.push(projectId); }
            if (names.length === 0) throw new HttpError(400, "No known columns provided");
            await env.DB.prepare(
                `INSERT INTO ${table} (${names.join(", ")}) VALUES (${names.map(() => "?").join(", ")})`
            ).bind(...values).run();
            return new Response("Created", { status: 201 });
        }

        // PUT — update by id, scoped to the target project so you can't edit another project's row.
        if (data.id === undefined || data.id === null) throw new HttpError(400, "id is required");
        if (cols.length === 0) throw new HttpError(400, "No known columns provided");
        const setClause = cols.map((c) => `${safeIdent(c.name)} = ?`).join(", ");
        const values = cols.map((c) => data[c.name]);
        const scope = projCol ? ` AND ${projCol} = ?` : "";
        const binds = projCol ? [...values, data.id, projectId] : [...values, data.id];
        await env.DB.prepare(`UPDATE ${table} SET ${setClause} WHERE id = ?${scope}`).bind(...binds).run();
        return new Response("Updated", { status: 200 });
    }

    if (req.method === "DELETE") {
        const id = url.searchParams.get("id");
        if (!id) throw new HttpError(400, "id is required");
        const cascade = url.searchParams.get("cascade") === "true";
        // Resolve the row's owning project for auth (per-project tables); global tables need schema write.
        if (projCol) {
            const row = await env.DB.prepare(`SELECT ${projCol} AS pid FROM ${table} WHERE id = ?`).bind(id).first<{ pid: number }>();
            if (!row) throw new HttpError(404, "Row not found");
            await requireProjectRole(req, env, row.pid, "admin");
        } else {
            await requireSchemaRead(req, env, schemaId); // global ref table; schema membership suffices
        }
        await deleteRowWithPolicy(env, entity as EntityRow, id, cascade);
        return new Response("Deleted", { status: 200 });
    }

    return methodNotAllowed();
};
