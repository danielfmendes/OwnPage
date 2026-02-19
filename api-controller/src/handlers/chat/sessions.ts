import {Env} from "../../types";
import {verifyJWT} from "../../utils/jwt";

async function getUserEmail(request: Request) {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) throw new Error("Unauthorized");
    const token = authHeader.split(" ")[1];
    const payload = await verifyJWT(token);
    return payload.email;
}

// GET /api/chat/sessions - Fetch all user chats
export async function getSessionsHandler(request: Request, env: Env): Promise<Response> {
    try {
        const email = await getUserEmail(request);
        const {results} = await env.CHAT_DB.prepare(
            "SELECT id, title, created_at FROM chat_sessions WHERE user_email = ? ORDER BY created_at DESC"
        ).bind(email).all();

        return new Response(JSON.stringify(results), {
            headers: {"Content-Type": "application/json"}
        });
    } catch {
        return new Response("Unauthorized", {status: 401});
    }
}

// POST /api/chat/sessions - Create a new chat (Limit check 5)
export async function createSessionHandler(request: Request, env: Env): Promise<Response> {
    try {
        const email = await getUserEmail(request);

        // Get user-specific limits
        const user = await env.CHAT_DB.prepare("SELECT max_chats FROM chat_users WHERE email = ?").bind(email).first() as {
            max_chats: number
        };
        const {count} = await env.CHAT_DB.prepare("SELECT COUNT(*) as count FROM chat_sessions WHERE user_email = ?").bind(email).first() as {
            count: number
        };

        if (count >= (user?.max_chats || 5)) {
            return new Response(JSON.stringify({error: "Chat limit reached"}), {status: 403});
        }

        const newId = crypto.randomUUID();
        await env.CHAT_DB.prepare("INSERT INTO chat_sessions (id, user_email) VALUES (?, ?)")
            .bind(newId, email)
            .run();

        return new Response(JSON.stringify({id: newId}), {status: 201});
    } catch {
        return new Response("Internal Server Error", {status: 500});
    }
}

// GET /api/chat/history?sessionId=... - Load messages for a chat
export async function getHistoryHandler(request: Request, env: Env): Promise<Response> {
    const {searchParams} = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) return new Response("Missing sessionId", {status: 400});

    const {results} = await env.CHAT_DB.prepare(
        "SELECT role, content FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC"
    ).bind(sessionId).all();

    return new Response(JSON.stringify(results), {
        headers: {"Content-Type": "application/json"}
    });
}