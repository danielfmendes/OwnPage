import { Env } from "../../types";
import { createJWT } from "../../utils/jwt";
import bcrypt from "bcryptjs";
import { generateVerificationToken, getVerificationExpiry } from "../../utils/verification";

interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    dob: string; // yyyy-mm-dd
}

interface LoginRequest {
    email: string;
    password: string;
}

export async function authHandler(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method !== "POST") {
        return new Response("POST only", { status: 405 });
    }

    if (path === "/auth/register") {
        const body: RegisterRequest = await request.json();
        const hashedPassword = await bcrypt.hash(body.password, 10);

        const verificationToken = generateVerificationToken();
        const verificationExpires = getVerificationExpiry();

        await env.DB.prepare(
            `INSERT INTO users (username, email, password, dob, is_verified, verification_token, verification_expires)
             VALUES (?, ?, ?, ?, 0, ?, ?)`
        )
            .bind(body.username, body.email, hashedPassword, body.dob, verificationToken, verificationExpires)
            .run();

        // Optional: E-Mail senden
        // sendVerificationEmail(body.email, verificationToken);

        return new Response(
            JSON.stringify({
                message: "Registration successful. Please verify your email.",
                verificationToken // für Testing / ohne E-Mail
            }),
            { headers: { "Content-Type": "application/json" }, status: 201 }
        );
    }

    if (path === "/auth/login") {
        const body: LoginRequest = await request.json();

        const queryResult = await env.DB
            .prepare("SELECT username, email, password, is_verified FROM users WHERE email = ?")
            .bind(body.email)
            .all();

        const results = queryResult.results as Array<{ username: string; email: string; password: string; is_verified: number }>;

        if (results.length === 0) {
            return new Response("User not found", { status: 401 });
        }

        const user = results[0];

        // Passwort prüfen
        const valid = await bcrypt.compare(body.password, user.password);
        if (!valid) return new Response("Incorrect password", { status: 401 });

        // Optional: Überprüfen ob verified
        if (!user.is_verified) {
            return new Response("Please verify your email before logging in.", { status: 403 });
        }

        const token = createJWT(user.email);
        return new Response(
            JSON.stringify({ message: "Login successful", token }),
            { headers: { "Content-Type": "application/json" } }
        );
    }

    return new Response("Not Found", { status: 404 });
}
