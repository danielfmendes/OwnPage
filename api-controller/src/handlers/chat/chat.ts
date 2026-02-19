import {Env} from "../../types";
import {streamHandler} from "./stream";
import {chatAuthHandler} from "./auth";
import {
    getSessionsHandler,
    createSessionHandler,
    getHistoryHandler
} from "./sessions";

export async function chatHandler(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/api\/chat/, "");

    // 1. Authentication (Matches /api/chat/auth/login and /api/chat/auth/register)
    if (path.startsWith("/auth/")) {
        return await chatAuthHandler(request, env);
    }

    // 2. AI Streaming (POST /api/chat/stream)
    if (path === "/stream" && request.method === "POST") {
        return await streamHandler(request, env);
    }

    // 3. Session Management (GET & POST /api/chat/sessions)
    if (path === "/sessions") {
        if (request.method === "GET") return await getSessionsHandler(request, env);
        if (request.method === "POST") return await createSessionHandler(request, env);
    }

    // 4. Message History (GET /api/chat/history?sessionId=...)
    if (path === "/history" && request.method === "GET") {
        return await getHistoryHandler(request, env);
    }

    return new Response(`Chat Path "${path}" Not Found`, {status: 404});
}