// Generic aggregation for the configurable dashboard:
//   GET /dwh/aggregate/:entity?project_id=&groupBy=&measure=&fn=count|sum|avg
// Returns [{ value, total }] grouped by a column. groupBy/measure are validated against the
// entity's real columns (safe-identifier + membership) before being put into SQL.

import { Env } from "../../types";
import { HttpError, requireProjectRole } from "../../utils/auth";
import { getColumns, getEntityByName } from "./schema/catalog";
import { safeIdent } from "./schema/ddl";

const FUNCTIONS = new Set(["count", "sum", "avg"]);

export const aggregateHandler = async (req: Request, env: Env, subPath: string): Promise<Response> => {
    const entityName = subPath.replace(/^\/aggregate\//, "").split("/")[0].split("?")[0];
    const url = new URL(req.url);
    const projectId = Number(url.searchParams.get("project_id"));
    if (!entityName) throw new HttpError(400, "Entity name missing in path");
    if (!projectId) throw new HttpError(400, "project_id is required");

    await requireProjectRole(req, env, projectId, "user");
    const entity = await getEntityByName(env, projectId, entityName);
    if (!entity) throw new HttpError(404, `Entity "${entityName}" not found in this project`);

    const columns = await getColumns(env, entity.id);
    const colNames = new Set(columns.map((c) => c.name));

    const groupBy = url.searchParams.get("groupBy") || "";
    const fn = (url.searchParams.get("fn") || "count").toLowerCase();
    const measure = url.searchParams.get("measure") || "";

    if (!colNames.has(groupBy)) throw new HttpError(400, `Unknown groupBy column "${groupBy}"`);
    if (!FUNCTIONS.has(fn)) throw new HttpError(400, `Unknown function "${fn}"`);
    if ((fn === "sum" || fn === "avg") && !colNames.has(measure)) {
        throw new HttpError(400, `${fn} needs a valid measure column`);
    }

    const table = safeIdent(entity.physical_table);
    const groupCol = safeIdent(groupBy);
    const agg = fn === "count" ? "COUNT(*)" : `${fn.toUpperCase()}(${safeIdent(measure)})`;
    const projCol = entity.project_column ? safeIdent(entity.project_column) : null;
    const where = projCol ? `WHERE ${projCol} = ${Number(projectId)}` : "";

    const sql = `SELECT ${groupCol} AS value, ${agg} AS total
                 FROM ${table} ${where}
                 GROUP BY ${groupCol}
                 ORDER BY total DESC
                 LIMIT 50`;

    const { results } = await env.DB.prepare(sql).all<{ value: any; total: number }>();
    return Response.json(results);
};
