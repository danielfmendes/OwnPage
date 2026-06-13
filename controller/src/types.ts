import { D1Database, Ai } from "@cloudflare/workers-types";
export interface Env {
    DB: D1Database;
    CHAT_DB: D1Database;
    AI: Ai;
    JWT_SECRET: string;

    // Which SQL dialect env.DB speaks. "sqlite" for Cloudflare D1 (prod, set in wrangler.toml),
    // "postgres" for the local Node server (src/local/server.ts). The Worker can't tell whether
    // env.DB is real D1 or the Postgres adapter, so the DDL generator keys off this explicit flag.
    DB_DIALECT?: "sqlite" | "postgres";

    // Email verification (optional — see handlers/dwh/auth.ts).
    // Base URL the verification link points back at, e.g. https://danielfreiremendes.com/api
    APP_BASE_URL?: string;
    // When "true", registration skips sending the email (parity with Go's DISABLE_EMAILS).
    DISABLE_EMAILS?: string;
    // Resend HTTP API key + sender address used to deliver the verification email.
    RESEND_API_KEY?: string;
    EMAIL_FROM?: string;
}
