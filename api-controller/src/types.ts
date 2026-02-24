import { D1Database, Ai } from "@cloudflare/workers-types";
export interface Env {
    DB: D1Database;
    CHAT_DB: D1Database;
    AI: Ai;
    JWT_SECRET: string;
}