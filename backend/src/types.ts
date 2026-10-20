import { D1Database, Ai, VectorizeIndex, Workflow } from "@cloudflare/workers-types";
export interface Env {
    // DWH (warehouse + platform users)
    DB: D1Database;
    CHAT_DB: D1Database;
    AI: Ai;
    JWT_SECRET: string;

    // Feedback Pulse
    FEEDBACK_DB: D1Database;
    VECTOR_INDEX: VectorizeIndex;
    INGESTION_WORKFLOW: Workflow;

    // Lisbon House Prices (Avalia)
    AVALIA_DB: D1Database;

    // Causality Survey
    SURVEY_DB: D1Database;

    // Origin allowed to call the API from a browser (CORS in the project routers)
    ALLOWED_ORIGIN: string;

    // Email verification (optional — see handlers/dwh/auth.ts).
    // Base URL the verification link points back at, e.g. https://danielfreiremendes.com/api
    APP_BASE_URL?: string;
    // When "true", registration skips sending the email (parity with Go's DISABLE_EMAILS).
    DISABLE_EMAILS?: string;
    // Resend HTTP API key + sender address used to deliver the verification email.
    RESEND_API_KEY?: string;
    EMAIL_FROM?: string;
}
