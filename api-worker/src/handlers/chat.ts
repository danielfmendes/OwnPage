import { Env } from "../types";

export async function chatHandler(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

    try {
        const { sessionId, message } = await request.json() as { sessionId: string; message: string };
        if (!sessionId || !message) return new Response("Missing Data", { status: 400 });

        // 1. Check response limit (max 10 assistant messages)
        const countRes = await env.CHAT_DB.prepare(
            "SELECT COUNT(*) as count FROM chat_messages WHERE session_id = ? AND role = 'assistant'"
        ).bind(sessionId).first();

        if (countRes && (countRes.count as number) >= 10) {
            return new Response(JSON.stringify({ error: "Limit reached (10 answers)." }), {
                status: 403,
                headers: { "Content-Type": "application/json" }
            });
        }

        // 2. Fetch history for context
        const history = await env.CHAT_DB.prepare(
            "SELECT role, content FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC"
        ).bind(sessionId).all();

        const messages = [
            { role: "system", content: "You are an AI expert for the Nebuladw database system." },
            ...history.results.map(r => ({ role: r.role, content: r.content })),
            { role: "user", content: message }
        ];

        // 3. Request streaming response from Cloudflare Workers AI
        const stream = await env.AI.run("@cf/meta/llama-3.1-8b-instruct" as any, {
            messages,
            stream: true
        });

        // 4. Create a TransformStream to capture the full response for D1 while streaming
        let fullResponse = "";
        const { readable, writable } = new TransformStream({
            async transform(chunk, controller) {
                const text = new TextDecoder().decode(chunk);
                // Cloudflare streams chunks as "data: {...}"
                const lines = text.split("\n");
                for (const line of lines) {
                    if (line.startsWith("data: ") && line !== "data: [DONE]") {
                        try {
                            const parsed = JSON.parse(line.substring(6));
                            fullResponse += parsed.response;
                        } catch (e) {
                            console.error("Error parsing stream chunk", e);
                        }
                    }
                }
                controller.enqueue(chunk);
            },
            async flush() {
                // 5. Save both user message and full AI response to D1 after streaming finishes
                await env.CHAT_DB.batch([
                    env.CHAT_DB.prepare("INSERT INTO chat_messages (session_id, role, content) VALUES (?, 'user', ?)").bind(sessionId, message),
                    env.CHAT_DB.prepare("INSERT INTO chat_messages (session_id, role, content) VALUES (?, 'assistant', ?)").bind(sessionId, fullResponse)
                ]);
            }
        });

        // Pipe the AI stream through our transformer to the client
        (stream as ReadableStream).pipeTo(writable);

        return new Response(readable, {
            headers: { "Content-Type": "text/event-stream" }
        });

    } catch (err) {
        console.error(err);
        return new Response("Internal Server Error", { status: 500 });
    }
}