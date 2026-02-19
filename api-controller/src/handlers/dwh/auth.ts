import { Env } from "../../types";
import { User } from "../../models";
import * as bcrypt from "bcryptjs";
import * as jose from "jose";

// Helper for error responses
const errorResponse = (msg: string, status = 400) => new Response(msg, { status });

// Generate JWT
const createJWT = async (email: string, secret: string) => {
    const secretKey = new TextEncoder().encode(secret);
    return await new jose.SignJWT({ email })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(email)
        .setExpirationTime("24h")
        .sign(secretKey);
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

        const token = await createJWT(user.email, "YOUR_SECRET_KEY_HERE"); // TODO: Use env var

        return Response.json({
            message: "Registration successful",
            token: token
        }, { status: 201 });

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

        const token = await createJWT(user.email, "YOUR_SECRET_KEY_HERE"); // TODO: Use env var

        return Response.json({
            message: "Login successful",
            token: token
        });

    } catch (e) {
        return errorResponse("Error processing request: " + e);
    }
}

export const authHandler = async (subPath: string, req: Request, env: Env) => {
    // subPath is expected to be "/auth/register" or "/auth/login"
    if (subPath === "/auth/register") return handleRegister(req, env);
    if (subPath === "/auth/login") return handleLogin(req, env);

    return errorResponse(`Auth method "${subPath}" not found`, 404);
};
