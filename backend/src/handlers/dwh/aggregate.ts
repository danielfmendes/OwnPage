// Generic aggregation for the schema-level dashboard:
//   GET /dwh/aggregate/:entity?schema_id=&project_ids=1|2&groupBy=&measure=&fn=count|sum|avg
// Compiles across the selected projects (WHERE project_id IN ...). groupBy/measure are validated
// against the entity's real columns before being interpolated.

import { Env } from "../../types";
import { HttpError, requireSchemaRead } from "../../utils/auth";
import { getColumns, getEntityByName, projectsForSchema } from "./schema/catalog";
import { safeIdent } from "./schema/ddl";

const FUNCTIONS = new Set(["count", "sum", "avg"]);

export const aggregateHandler = async (req: Request, env: Env, subPath: string): Promise<Response> => {
    const url = new URL(req.url);
    const name = subPath.replace(/^\/aggregate\//, "").split("/")[0].split("?")[0];
    const schemaId = Number(url.searchParams.get("schema_id"));
    if (!name) throw new HttpError(400, "Entity name missing in path");
    if (!schemaId) throw new HttpError(400, "schema_id is required");

    await requireSchemaRead(req, env, schemaId);
    const entity = await getEntityByName(env, schemaId, name);
    if (!entity) throw new HttpError(404, `Entity "${name}" not found in this schema`);

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
    let where = "";
    if (projCol) {
        const schemaProjects = new Set(await projectsForSchema(env, schemaId));
        const ids = (url.searchParams.get("project_ids") || "").split("|").map(Number).filter((n) => !Number.isNaN(n) && schemaProjects.has(n));
        where = ids.length ? `WHERE ${projCol} IN (${ids.join(", ")})` : "WHERE 1 = 0";
    }

    const sql = `SELECT ${groupCol} AS value, ${agg} AS total
                 FROM ${table} ${where}
                 GROUP BY ${groupCol}
                 ORDER BY total DESC
                 LIMIT 50`;
    const { results } = await env.DB.prepare(sql).all<{ value: any; total: number }>();
    return Response.json(results);
};
