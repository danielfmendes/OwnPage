import { SignJWT, jwtVerify } from "jose";

export interface JwtPayload {
    email: string;
}

/**
 * Globales Binding für das Secret.
 * wenn es unter "Settings -> Variables" als Secret definiert ist.
 */
const getSecretKey = () => {
    const secret = (globalThis as any).JWT_SECRET as string || "supersecret";
    return new TextEncoder().encode(secret);
};

const alg = "HS256";
const issuer = "NebulaDW";

export async function createJWT(email: string): Promise<string> {
    const payload: JwtPayload = { email };

    return await new SignJWT({ ...payload })
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setIssuer(issuer)
        .setExpirationTime("30m")
        .sign(getSecretKey());
}

export async function verifyJWT(token: string): Promise<JwtPayload> {
    try {
        const { payload } = await jwtVerify(token, getSecretKey(), {
            issuer: issuer,
            algorithms: [alg],
        });

        if (!payload || typeof payload !== "object" || !("email" in payload)) {
            throw new Error("Invalid token payload");
        }

        return { email: payload.email as string };
    } catch (err) {
        throw new Error("Invalid or expired token");
    }
}