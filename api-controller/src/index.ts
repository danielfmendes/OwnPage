import {Env} from "./types"
import {chatHandler} from "./handlers/chat/chat";
import {dwhHandler} from "./handlers/dwh";
import {addCorsHeaders} from "./utils/cors";

async function handleRequest(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/api/, "");

    // 1. KI Chatbot
    if (path.startsWith("/chat")) return await chatHandler(request, env);

    // 2. Data Warehouse
    if (path.startsWith("/dwh")) return await dwhHandler(path, env, request);

    return new Response("Not Found", {status: 404});
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        if (request.method === "OPTIONS") {
            return addCorsHeaders(request, new Response(null, {status: 204}));
        }

        const response = await handleRequest(request, env);
        return addCorsHeaders(request, response);
    },
}