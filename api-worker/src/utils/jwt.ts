import jwt, { SignOptions, JwtPayload as JwtLibPayload } from "jsonwebtoken";

export interface JwtPayload {
    email: string;
}

// Secret intern (via global Binding)
// In Cloudflare Worker: https://dash.cloudflare.com → Worker → Settings → Add Secret → JWT_SECRET
const JWT_SECRET = (globalThis as any).JWT_SECRET as string || "supersecret";

export function createJWT(email: string): string {
    const payload: JwtPayload = { email };

    const options: SignOptions = {
        algorithm: "HS256",
        expiresIn: "30m", // 30 Minuten
        issuer: "NebulaDW",
    };

    return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyJWT(token: string): JwtPayload {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtLibPayload;

        if (!decoded || typeof decoded !== "object" || !("email" in decoded)) {
            throw new Error("Invalid token payload");
        }

        return { email: decoded.email as string };
    } catch (err) {
        throw new Error("Invalid or expired token");
    }
}
