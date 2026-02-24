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

        // TODO: Send verification email (requires external service like SendGrid/MailChannels in Worker)

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

export const authHandler = async (subPath: string, req: Request, env: Env) => {
    // subPath is expected to be "/auth/register" or "/auth/login" or "/auth/refresh" or "/auth/me"
    if (subPath.startsWith("/auth/register")) return handleRegister(req, env);
    if (subPath.startsWith("/auth/login")) return handleLogin(req, env);
    if (subPath.startsWith("/auth/refresh")) return handleRefresh(req, env);
    if (subPath.startsWith("/auth/logout")) return handleLogout(req, env);
    if (subPath.startsWith("/auth/me")) return handleMe(req, env);

    return errorResponse(`Auth method "${subPath}" not found`, 404);
};
