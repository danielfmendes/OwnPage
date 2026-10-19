// Schema-level dashboard config (shared by all projects on the schema):
//   GET /dwh/dashboards?schema_id=  → { config }   (read: schema read)
//   PUT /dwh/dashboards?schema_id=  body { config } (write: schema write)
// config is opaque JSON (widgets + grid layout) owned by the frontend.

import { Env } from "../../types";
import { HttpError, readJson, requireSchemaRead, requireSchemaWrite } from "../../utils/auth";

const methodNotAllowed = () => new Response("Method not allowed", { status: 405 });

export const dashboardsHandler = async (req: Request, env: Env): Promise<Response> => {
    const schemaId = Number(new URL(req.url).searchParams.get("schema_id"));
    if (!schemaId) throw new HttpError(400, "schema_id is required");

    if (req.method === "GET") {
        await requireSchemaRead(req, env, schemaId);
        const row = await env.DB.prepare("SELECT config FROM dwh_dashboards WHERE schema_id = ?")
            .bind(schemaId).first<{ config: string | null }>();
        const config = row?.config ? JSON.parse(row.config) : null;
        return Response.json({ config });
    }

    if (req.method === "PUT") {
        await requireSchemaWrite(req, env, schemaId);
        const body = await readJson<{ config: unknown }>(req);
        const json = JSON.stringify(body.config ?? null);
        const existing = await env.DB.prepare("SELECT id FROM dwh_dashboards WHERE schema_id = ?").bind(schemaId).first<{ id: number }>();
        if (existing) {
            await env.DB.prepare("UPDATE dwh_dashboards SET config = ?, updated_at = CURRENT_TIMESTAMP WHERE schema_id = ?").bind(json, schemaId).run();
        } else {
            await env.DB.prepare("INSERT INTO dwh_dashboards (schema_id, config) VALUES (?, ?)").bind(schemaId, json).run();
        }
        return new Response("Saved", { status: 200 });
    }

    return methodNotAllowed();
};
