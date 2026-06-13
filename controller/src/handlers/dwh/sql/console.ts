// SQL console endpoint: POST /dwh/sql { schemaId, sql }. Runs a scoped, read-only query against the
// schema's tables (see guard.ts). On Postgres it additionally runs in a read-only transaction.

import { Env } from "../../../types";
import { HttpError, readJson, requireSchemaRead } from "../../../utils/auth";
import { resolveDialect } from "../schema/ddl";
import { physicalTablesForSchema } from "../schema/catalog";
import { assertTablesAllowed, validateReadOnly, wrapWithLimit } from "./guard";

const methodNotAllowed = () => new Response("Method not allowed", { status: 405 });

export const sqlConsoleHandler = async (req: Request, env: Env): Promise<Response> => {
    if (req.method !== "POST") return methodNotAllowed();

    const body = await readJson<{ schemaId: number; sql: string }>(req);
    if (!body.schemaId) throw new HttpError(400, "schemaId is required");
    await requireSchemaRead(req, env, body.schemaId);

    const clean = validateReadOnly(body.sql || "");
    const allowed = await physicalTablesForSchema(env, body.schemaId);
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
