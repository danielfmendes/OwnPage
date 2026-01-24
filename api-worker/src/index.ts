import { Env } from "./types"
import { authHandler } from "./handlers/auth";
import { chatHandler } from "./handlers/chat";
import { dwhHandler } from "./handlers/dwh";
import { addCorsHeaders } from "./utils/cors";

async function handleRequest(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname.replace(/^\/api/, "");

    // 1. Authentication
    if (path.startsWith("/auth/")) return await authHandler(request, env);

    // 2. KI Chatbot
    if (path.startsWith("/chat")) return await chatHandler(request, env);

    // 3. Data Warehouse
    return await dwhHandler(path, env, request);
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        if (request.method === "OPTIONS") {
            return addCorsHeaders(request, new Response(null, { status: 204 }));
        }

        const response = await handleRequest(request, env);
        return addCorsHeaders(request, response);
    },
}