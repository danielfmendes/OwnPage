import { Env } from "../types";

export async function runQuery<T>(db: D1Database, query: string, ...args: any[]): Promise<T[]> {
    const statement = db.prepare(query);
    const { results } = await statement.bind(...args).all();
    return results as T[];
}

export function jsonResponse<T>(data: T, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

export function errorResponse(message: string, status = 400): Response {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}
