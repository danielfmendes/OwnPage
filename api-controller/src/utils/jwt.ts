import { jwtVerify, SignJWT } from "jose";
import { Env } from "../types";

export interface JwtPayload {
    email: string;
}

// Generate JWT
export async function createJWT(email: string, secret: string) {
    const secretKey = new TextEncoder().encode(secret);
    return await new SignJWT({ email })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(email)
        .setExpirationTime("15m")
        .sign(secretKey);
}

export async function verifyJWT(token: string, secret: string): Promise<JwtPayload> {
    try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
            algorithms: ["HS256"],
        });

        const email = payload.sub || payload.email;
        if (!payload || !email) {
            throw new Error("Invalid token payload");
        }

        return { email: email as string };
    } catch (err) {
        throw new Error("Invalid or expired token");
    }
}

export async function getValidUserEmail(req: Request, env: Env): Promise<string | null> {
    let token = "";
    const cookieString = req.headers.get("Cookie");
    if (cookieString) {
        const match = cookieString.match(new RegExp('(^| )authToken=([^;]+)'));
        if (match) token = match[2];
    }
    if (!token) {
        const authHeader = req.headers.get("Authorization");
        if (authHeader?.startsWith("Bearer ")) {
            token = authHeader.slice(7);
        }
    }

    if (!token) return null;

    try {
        const payload = await verifyJWT(token, env.JWT_SECRET);
        return payload.email;
    } catch {
        return null;
    }
}