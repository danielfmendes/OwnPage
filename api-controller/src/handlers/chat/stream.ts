import {Env} from "../../types";
import {verifyJWT} from "../../utils/jwt";

export async function streamHandler(request: Request, env: Env): Promise<Response> {
    try {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader) return new Response("Unauthorized", {status: 401});
        const {email} = await verifyJWT(authHeader.split(" ")[1]);

        const {sessionId, message} = await request.json() as { sessionId: string; message: string };

        // Validate session ownership and get user settings
        const sessionInfo = await env.CHAT_DB.prepare(
            `SELECT u.ai_mode, u.max_messages
             FROM chat_sessions s
                      JOIN chat_users u ON s.user_email = u.email
             WHERE s.id = ?
               AND s.user_email = ?`
        ).bind(sessionId, email).first() as { ai_mode: string, max_messages: number } | null;

        if (!sessionInfo) return new Response("Forbidden", {status: 403});

        // Check message limit (Assistant replies)
        const msgCount = await env.CHAT_DB.prepare(
            "SELECT COUNT(*) as count FROM chat_messages WHERE session_id = ? AND role = 'assistant'"
        ).bind(sessionId).first() as { count: number };

        if (msgCount.count >= sessionInfo.max_messages) {
            return new Response(JSON.stringify({error: "Message limit reached"}), {status: 403});
        }

        // Fetch history for AI context
        const history = await env.CHAT_DB.prepare(
            "SELECT role, content FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC"
        ).bind(sessionId).all();

        const systemPrompts: Record<string, string> = {
            creative: "You are a creative and poetic AI expert for the Nebuladw system.",
            precise: "You are a concise AI expert. Give only short, factual answers.",
            technical: "You are a technical lead. Provide code snippets and architecture insights.",
            balanced: "You are a helpful and balanced AI expert."
        };

        const messages = [
            {role: "system", content: systemPrompts[sessionInfo.ai_mode] || systemPrompts.balanced},
            ...history.results.map(r => ({role: r.role, content: r.content})),
            {role: "user", content: message}
        ];

        // Start AI Stream
        const aiStream = await env.AI.run("@cf/meta/llama-3.1-8b-instruct" as any, {
            messages,
            stream: true
        });

        let fullAiResponse = "";
        const {readable, writable} = new TransformStream({
            transform(chunk, controller) {
                const text = new TextDecoder().decode(chunk);
                text.split("\n").forEach(line => {
                    if (line.startsWith("data: ") && line !== "data: [DONE]") {
                        try {
                            const parsed = JSON.parse(line.substring(6));
                            if (parsed.response) fullAiResponse += parsed.response;
                        } catch (e) {
                        }
                    }
                });
                controller.enqueue(chunk);
            },
            async flush() {
                // Persist to D1 and Update Title if it's the first message
                if (fullAiResponse.trim()) {
                    await env.CHAT_DB.batch([
                        env.CHAT_DB.prepare("INSERT INTO chat_messages (session_id, role, content) VALUES (?, 'user', ?)").bind(sessionId, message),
                        env.CHAT_DB.prepare("INSERT INTO chat_messages (session_id, role, content) VALUES (?, 'assistant', ?)").bind(sessionId, fullAiResponse),
                        env.CHAT_DB.prepare("UPDATE chat_sessions SET title = ? WHERE id = ? AND title = 'New Conversation'").bind(message.substring(0, 35), sessionId)
                    ]);
                }
            }
        });

        (aiStream as ReadableStream).pipeTo(writable);

        return new Response(readable, {
            headers: {"Content-Type": "text/event-stream", "Cache-Control": "no-cache"}
        });

    } catch (err) {
        return new Response("Internal Server Error", {status: 500});
    }
}