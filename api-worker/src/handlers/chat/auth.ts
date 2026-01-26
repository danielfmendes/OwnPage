import { Env } from "../../types";
import { createJWT } from "../../utils/jwt";
import bcrypt from "bcryptjs";

export async function chatAuthHandler(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/api\/chat\/auth/, "");

    if (path === "/register" && request.method === "POST") {
        const { email, password, ai_mode } = await request.json() as any;
        if (!email || !password) return new Response("Missing fields", { status: 400 });

        const hashedPassword = await bcrypt.hash(password, 10);
        try {
            await env.CHAT_DB.prepare(
                "INSERT INTO chat_users (email, password, ai_mode) VALUES (?, ?, ?)"
            ).bind(email, hashedPassword, ai_mode || 'balanced').run();

            const token = await createJWT(email);
            return new Response(JSON.stringify({ token }), { status: 201 });
        } catch (e) {
            return new Response("User already exists", { status: 409 });
        }
    }

    if (path === "/login" && request.method === "POST") {
        const { email, password } = await request.json() as any;

        const user = await env.CHAT_DB.prepare(
            "SELECT email, password FROM chat_users WHERE email = ?"
        ).bind(email).first() as any;

        if (!user) return new Response("Invalid credentials", { status: 401 });

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return new Response("Invalid credentials", { status: 401 });

        const token = await createJWT(user.email);
        return new Response(JSON.stringify({ token }), { status: 200 });
    }

    return new Response("Method Not Allowed", { status: 405 });
}