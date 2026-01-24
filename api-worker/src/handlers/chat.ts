import { Env } from "../types";

export async function chatHandler(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

    try {
        const { sessionId, message } = await request.json() as { sessionId: string; message: string };
        if (!sessionId || !message) return new Response("Missing Data", { status: 400 });

        // 1. Limit-Check
        const countRes = await env.CHAT_DB.prepare(
            "SELECT COUNT(*) as count FROM chat_messages WHERE session_id = ? AND role = 'assistant'"
        ).bind(sessionId).first();

        if (countRes && (countRes.count as number) >= 10) {
            return new Response(JSON.stringify({ error: "Limit erreicht (10 Antworten)." }), { status: 403 });
        }

        // 2. Kontext & Llama Call
        const history = await env.CHAT_DB.prepare(
            "SELECT role, content FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC"
        ).bind(sessionId).all();

        const messages = [
            { role: "system", content: "Du bist ein KI-Experte für das Nebuladw-Datenbanksystem." },
            ...history.results.map(r => ({ role: r.role, content: r.content })),
            { role: "user", content: message }
        ];

        const aiResponse = await env.AI.run("@cf/meta/llama-3.1-8b-instruct" as any, {
            messages
        });
        const botAnswer = (aiResponse as any).response;

        // 3. Batch-Insert in D1
        await env.CHAT_DB.batch([
            env.CHAT_DB.prepare("INSERT INTO chat_messages (session_id, role, content) VALUES (?, 'user', ?)").bind(sessionId, message),
            env.CHAT_DB.prepare("INSERT INTO chat_messages (session_id, role, content) VALUES (?, 'assistant', ?)").bind(sessionId, botAnswer)
        ]);

        return new Response(JSON.stringify({ answer: botAnswer }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        return new Response("Internal Server Error", { status: 500 });
    }
}