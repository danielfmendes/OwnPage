// Local-development entrypoint. Runs the SAME Worker request handler (src/index.ts) under Node
// instead of workerd, with env.DB / env.CHAT_DB backed by a local Postgres on :5433. This is the
// supported way to run the API locally on macOS where `wrangler dev` (workerd) is unavailable.
//
//   npm run dev:local      # this file, via tsx — talks to Postgres
//   npm run dev            # wrangler dev — talks to a local D1 (SQLite)
//
// Production is unaffected: `npm run deploy` bundles only src/index.ts (which never imports this).

import { config } from "dotenv";
// `.dev.vars` (shared with wrangler) first, then optional `.env.local` overrides.
config({ path: ".dev.vars" });
config({ path: ".env.local" });

import { createServer } from "node:http";
import { createServerAdapter } from "@whatwg-node/server";
import pg from "pg";
import { Pool } from "pg";
import worker from "../index";
import type { Env } from "../types";
import { PgD1Database } from "./pg-d1-adapter";

// Parse Postgres NUMERIC/BIGINT as JS numbers so analytics sums match D1's numeric output
// (node-postgres returns these as strings by default, which would break the charts).
pg.types.setTypeParser(1700, (v) => (v === null ? null : parseFloat(v))); // numeric
pg.types.setTypeParser(20, (v) => (v === null ? null : parseInt(v, 10))); // int8 / bigint

// Defaults match backend/docker-compose.yml. We deliberately do NOT read the individual libpq
// PG* vars (PGHOST/PGDATABASE/...) — they are commonly set in a developer's shell (e.g.
// PGDATABASE=postgres) and would silently misroute the connection. Override the whole thing with
// DATABASE_URL if needed.
const DATABASE_URL = process.env.DATABASE_URL;
const pool = DATABASE_URL
    ? new Pool({ connectionString: DATABASE_URL })
    : new Pool({
          host: "localhost",
          port: 5433,
          user: "fahrrad_user",
          password: "geheim",
          database: "fahrrad_db",
      });

const db = new PgD1Database(pool);

// Workers AI is Cloudflare-only — stub it so the DWH app runs. AI chat (/chat) and CHAT_DB
// tables are not provisioned locally and will return errors; that is a known local limitation.
const aiStub = {
    run: async () => ({ response: "AI chat is not available in local mode." }),
};

const env = {
    DB: db,
    CHAT_DB: db,
    AI: aiStub,
    JWT_SECRET: process.env.JWT_SECRET || "local_development_super_secret_key",
    DISABLE_EMAILS: process.env.DISABLE_EMAILS || "true",
    APP_BASE_URL: process.env.APP_BASE_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
} as unknown as Env;

const adapter = createServerAdapter((request: Request) => worker.fetch(request, env));
const server = createServer(adapter);

const port = Number(process.env.PORT || 8080);
const dbLabel = DATABASE_URL ? "DATABASE_URL" : "localhost:5433/fahrrad_db";
server.listen(port, () => {
    console.log(`Local API (Postgres @ ${dbLabel}) → http://localhost:${port}`);
});

const shutdown = () => {
    server.close();
    pool.end().finally(() => process.exit(0));
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
