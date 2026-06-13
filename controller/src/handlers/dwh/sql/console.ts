// SQL console endpoint: POST /dwh/sql { projectId, sql }. Runs a scoped, read-only query against
// the caller's project tables (see guard.ts). On Postgres it additionally executes inside a
// read-only transaction; on D1 the guard (single SELECT + table allowlist + LIMIT) is the control.

import { Env } from "../../../types";
import { HttpError, readJson, requireProjectRole } from "../../../utils/auth";
import { resolveDialect } from "../schema/ddl";
import { physicalTablesForProject } from "../schema/catalog";
import { assertTablesAllowed, validateReadOnly, wrapWithLimit } from "./guard";

const methodNotAllowed = () => new Response("Method not allowed", { status: 405 });

export const sqlConsoleHandler = async (req: Request, env: Env): Promise<Response> => {
    if (req.method !== "POST") return methodNotAllowed();

    const body = await readJson<{ projectId: number; sql: string }>(req);
    if (!body.projectId) throw new HttpError(400, "projectId is required");
    await requireProjectRole(req, env, body.projectId, "user");

    const clean = validateReadOnly(body.sql || "");
    const allowed = await physicalTablesForProject(env, body.projectId);
    assertTablesAllowed(clean, allowed);
    const finalSql = wrapWithLimit(clean);

    const dialect = resolveDialect(env.DB_DIALECT);
    let rows: Record<string, any>[];
    const db = env.DB as any;
    if (dialect === "postgres" && typeof db.queryReadOnly === "function") {
        rows = await db.queryReadOnly(finalSql);
    } else {
        const r = await env.DB.prepare(finalSql).all<Record<string, any>>();
        rows = r.results;
    }

    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
    return Response.json({ columns, rows });
};
