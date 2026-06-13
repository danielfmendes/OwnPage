import { Env } from "../../types";
import { User } from "../../models";
import * as bcrypt from "bcryptjs";
import * as jose from "jose";

// Helper for error responses
const errorResponse = (msg: string, status = 400) => new Response(msg, { status });

// Helper to extract a cookie value
export const getCookie = (request: Request, name: string) => {
    const cookieString = request.headers.get("Cookie");
    if (!cookieString) return null;
    const match = cookieString.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
    return null;
};

import { createJWT, getValidUserEmail } from "../../utils/jwt";

// Helper for dynamic cookie security attributes based on environment
const getCookieOptions = (req: Request) => {
    const isSecure = new URL(req.url).protocol === "https:";
    // If running in production (https), use SameSite=None and Secure for cross-origin frontend-backend requests.
    // If running locally (http), use SameSite=Lax and omit Secure, as browsers reject Secure over HTTP.
    return `HttpOnly; Path=/; Max-Age=900; SameSite=${isSecure ? 'None' : 'Lax'}${isSecure ? '; Secure' : ''}`;
};

// Sends the verification email via the Resend HTTP API (Workers have no SMTP, unlike the Go code's
// smtp.gmail.com). Skipped when DISABLE_EMAILS=true or when no provider is configured (local/dev),
// so registration still works without an email account — parity with Go's DISABLE_EMAILS gate.
const sendVerificationEmail = async (env: Env, toEmail: string, token: string) => {
    if (env.DISABLE_EMAILS === "true") return;
    if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
        console.warn("Verification email not sent: RESEND_API_KEY / EMAIL_FROM not configured");
        return;
    }
    const base = (env.APP_BASE_URL || "").replace(/\/$/, "");
    const link = `${base}/dwh/auth/verify?token=${token}`;
    try {
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${env.RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: env.EMAIL_FROM,
                to: toEmail,
                subject: "Please confirm your e-mail address for NebulaDW",
                html: `<p>Welcome to NebulaDW!</p><p>Please confirm your e-mail address by clicking <a href="${link}">this link</a>.</p>`,
            }),
        });
        if (!res.ok) {
            console.error("Verification email failed:", res.status, await res.text());
        }
    } catch (e) {
        console.error("Verification email error:", e);
    }
};

// POST /auth/register
export const handleRegister = async (req: Request, env: Env) => {
    try {
        const user: User = await req.json();

        // Hash password
        const hashedPassword = await bcrypt.hash(user.password || "", 10);

        // Generate tokens
        const verificationToken = crypto.randomUUID();
        const verificationExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

        // Insert user
        const query = `
            INSERT INTO users (username, email, password, dob, is_verified, verification_expires, verification_token)
            VALUES (?, ?, ?, ?, FALSE, ?, ?)
        `;

        // Note: D1 handles booleans as integers (0/1) usually, but we pass FALSE which is valid SQL
        await env.DB.prepare(query)
            .bind(user.username, user.email, hashedPassword, user.dob, verificationExpires, verificationToken)
            .run();

        // Send the verification email (no-op when emails are disabled / unconfigured).
        await sendVerificationEmail(env, user.email, verificationToken);

        const token = await createJWT(user.email, env.JWT_SECRET);

        return new Response(JSON.stringify({ message: "Registration successful" }), {
            status: 201,
            headers: {
                "Content-Type": "application/json",
                "Set-Cookie": `authToken=${token}; ${getCookieOptions(req)}`
            }
        });

    } catch (e) {
        return errorResponse("Error processing request: " + e);
    }
};

// POST /auth/login
export const handleLogin = async (req: Request, env: Env) => {
    try {
        const { email, password } = await req.json() as any;

        const query = `SELECT * FROM users WHERE email = ?`;
        const user = await env.DB.prepare(query).bind(email).first<User>();

        if (!user) {
            return errorResponse("User not found", 401);
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password || "");
        if (!isValid) {
            return errorResponse("Incorrect password", 401);
        }

        if (!user.is_verified) {
            // In a real app we would check expiration here too
            // For now we just return forbidden matching Go logic partly
            return errorResponse("Please confirm your e-mail address", 403);
        }

        const token = await createJWT(user.email, env.JWT_SECRET);

        return new Response(JSON.stringify({ message: "Login successful" }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Set-Cookie": `authToken=${token}; ${getCookieOptions(req)}`
            }
        });

    } catch (e) {
        return errorResponse("Error processing request: " + e);
    }
}

// POST /auth/refresh
export const handleRefresh = async (req: Request, env: Env) => {
    try {
        let token = getCookie(req, "authToken");

        if (!token) {
            const authHeader = req.headers.get("Authorization");
            if (authHeader && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            return errorResponse("Missing or invalid authorization", 401);
        }

        const secretKey = new TextEncoder().encode(env.JWT_SECRET);

        // Verify the existing token
        const { payload } = await jose.jwtVerify(token, secretKey, {
            algorithms: ["HS256"]
        });

        if (!payload || !payload.sub) {
            return errorResponse("Invalid token payload", 401);
        }

        const newToken = await createJWT(payload.sub, env.JWT_SECRET);

        return new Response(JSON.stringify({ message: "Token refreshed" }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Set-Cookie": `authToken=${newToken}; ${getCookieOptions(req)}`
            }
        });

    } catch (e) {
        // If the token is already expired or invalid, jose.jwtVerify throws an error
        return errorResponse("Invalid or expired token", 401);
    }
}

// POST /auth/logout
export const handleLogout = async (req: Request, env: Env) => {
    return new Response(JSON.stringify({ message: "Logout successful" }), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
            "Set-Cookie": `authToken=; ${getCookieOptions(req).replace('Max-Age=900', 'Max-Age=0')}`
        }
    });
}

// GET /auth/me
export const handleMe = async (req: Request, env: Env) => {
    try {
        const email = await getValidUserEmail(req, env);
        if (!email) {
            return errorResponse("Unauthorized", 401);
        }

        const query = `SELECT username, email, dob, is_verified FROM users WHERE email = ?`;
        const user = await env.DB.prepare(query).bind(email).first<User>();

        if (!user) {
            return errorResponse("User not found", 404);
        }

        return new Response(JSON.stringify(user), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Credentials": "true"
            }
        });
    } catch (e) {
        return errorResponse("Error processing request: " + e);
    }
}

// GET /auth/verify?token=...  (port of Go's HandleEmailVerification)
export const handleVerify = async (req: Request, env: Env) => {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    if (!token) return errorResponse("Verification token missing", 400);

    const user = await env.DB.prepare(
        "SELECT email, verification_expires FROM users WHERE verification_token = ?"
    ).bind(token).first<{ email: string; verification_expires: string | null }>();

    if (!user) return errorResponse("Invalid or expired verification token", 400);

    if (user.verification_expires && new Date(user.verification_expires).getTime() < Date.now()) {
        return errorResponse("Verification token has expired", 400);
    }

    await env.DB.prepare(
        "UPDATE users SET is_verified = TRUE, verification_token = NULL, verification_expires = NULL WHERE verification_token = ?"
    ).bind(token).run();

    return new Response("Email successfully confirmed! You can now log in.", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
    });
};

export const authHandler = async (subPath: string, req: Request, env: Env) => {
    // subPath is expected to be "/auth/register" or "/auth/login" or "/auth/refresh" or "/auth/me"
    if (subPath.startsWith("/auth/register")) return handleRegister(req, env);
    if (subPath.startsWith("/auth/login")) return handleLogin(req, env);
    if (subPath.startsWith("/auth/refresh")) return handleRefresh(req, env);
    if (subPath.startsWith("/auth/logout")) return handleLogout(req, env);
    if (subPath.startsWith("/auth/verify")) return handleVerify(req, env);
    if (subPath.startsWith("/auth/me")) return handleMe(req, env);

    return errorResponse(`Auth method "${subPath}" not found`, 404);
};
