import { Env } from "../types";
import { getValidUserEmail } from "./jwt";

// Role hierarchy: creator > admin > user (port of controller/utils/project_id.go)
const ROLE_PRIORITY: Record<string, number> = { user: 1, admin: 2, creator: 3 };

/**
 * Lightweight error carrying an HTTP status. Handlers throw it (e.g. from
 * requireUser / requireProjectRole) and the top-level dwhHandler converts it to a
 * Response via toResponse(). This mirrors the way the Go handlers short-circuit with
 * http.Error(...).
 */
export class HttpError extends Error {
    status: number;
    constructor(status: number, message: string) {
        super(message);
        this.status = status;
        this.name = "HttpError";
    }
}

/** Convert a thrown value into a Response. HttpError keeps its status; anything else is a 500. */
export function toResponse(e: unknown): Response {
    if (e instanceof HttpError) {
        return new Response(e.message, { status: e.status });
    }
    console.error("Unexpected error:", e);
    return new Response("Internal Server Error", { status: 500 });
}

/** Parse a JSON body, throwing a 400 HttpError on malformed input (instead of leaking a 500). */
export async function readJson<T = any>(req: Request): Promise<T> {
    try {
        return (await req.json()) as T;
    } catch {
        throw new HttpError(400, "Invalid JSON body");
    }
}

/** = Go ValidateToken: returns the caller's email or throws 401. */
export async function requireUser(req: Request, env: Env): Promise<string> {
    const email = await getValidUserEmail(req, env);
    if (!email) throw new HttpError(401, "Unauthorized – missing or invalid token");
    return email;
}

function hasSufficientRole(current: string, required: string): boolean {
    return (ROLE_PRIORITY[current] ?? 0) >= (ROLE_PRIORITY[required] ?? 0);
}

/** = Go GetUserRole: the caller's role on a project, or null if they have none. */
export async function getUserRole(
    env: Env,
    email: string,
    projectId: number | string
): Promise<string | null> {
    const row = await env.DB.prepare(
        "SELECT role FROM role_management WHERE useremail = ? AND project_id = ?"
    )
        .bind(email, projectId)
        .first<{ role: string }>();
    return row?.role ?? null;
}

/** = Go GetProjectIDForUser: does the user hold at least requiredRole on this project? */
export async function hasProjectRole(
    env: Env,
    email: string,
    projectId: number | string,
    requiredRole: string
): Promise<boolean> {
    const role = await getUserRole(env, email, projectId);
    if (!role) return false;
    return hasSufficientRole(role, requiredRole);
}

/** = Go GetAllProjectsIDsForUser: every project where the user has at least requiredRole. */
export async function getAllowedProjectIds(
    env: Env,
    email: string,
    requiredRole: string
): Promise<number[]> {
    const requiredLevel = ROLE_PRIORITY[requiredRole];
    if (!requiredLevel) throw new HttpError(400, `Invalid role: ${requiredRole}`);

    const allowedRoles = Object.entries(ROLE_PRIORITY)
        .filter(([, level]) => level >= requiredLevel)
        .map(([role]) => role);

    const placeholders = allowedRoles.map(() => "?").join(", ");
    const { results } = await env.DB.prepare(
        `SELECT project_id FROM role_management WHERE useremail = ? AND role IN (${placeholders})`
    )
        .bind(email, ...allowedRoles)
        .all<{ project_id: number }>();

    return results.map((r) => r.project_id);
}

/**
 * = Go ValidateProjectAccess: 401 if no token, 403 if the caller lacks requiredRole on the
 * project. Returns the caller's email so handlers can reuse it.
 */
export async function requireProjectRole(
    req: Request,
    env: Env,
    projectId: number | string | undefined | null,
    requiredRole: string
): Promise<string> {
    const email = await requireUser(req, env);
    if (projectId === undefined || projectId === null || projectId === "") {
        throw new HttpError(400, "Missing project identifier");
    }
    const ok = await hasProjectRole(env, email, projectId, requiredRole);
    if (!ok) throw new HttpError(403, "You don't have sufficient permissions for this project");
    return email;
}

/**
 * Resolve a project_id from a one-row SELECT, used by deletes and order_items where the
 * project isn't in the request body (mirrors Go's projectIdQuery pattern).
 */
export async function resolveProjectId(
    env: Env,
    sql: string,
    ...binds: any[]
): Promise<number> {
    const row = await env.DB.prepare(sql)
        .bind(...binds)
        .first<{ project_id: number }>();
    if (!row || row.project_id === undefined || row.project_id === null) {
        throw new HttpError(400, "Could not determine the project for this resource");
    }
    return row.project_id;
}

/**
 * = Go CanModifyRole: returns an error message if the action is forbidden, or null if allowed.
 * Creator may do anything; admin may not grant/revoke creator or downgrade another admin; a
 * plain user may not modify roles; nobody may modify their own role.
 */
export async function canModifyRole(
    env: Env,
    actorEmail: string,
    projectId: number | string,
    targetEmail: string,
    oldRole: string,
    newRole: string
): Promise<string | null> {
    if (actorEmail === targetEmail) return "You cannot change your own role";

    const actorRole = await getUserRole(env, actorEmail, projectId);
    if (!actorRole) return "You don't have permission to modify roles in this project";
    if (actorRole === "user") return "You don't have permission to modify roles";

    if (actorRole === "admin") {
        if (oldRole === "admin" && newRole !== "admin" && newRole !== "")
            return "An admin cannot be downgraded by another admin";
        if (newRole === "creator") return "An admin cannot grant the creator role";
        if (oldRole === "admin" && newRole === "")
            return "An admin cannot be removed by another admin";
    }

    return null; // creator can do anything
}

// --- Schema access (derived from per-project roles) ------------------------------------
// Roles stay per-project; schema access is inferred: you can READ a schema if you hold any role on a
// project using it, and WRITE it if you hold admin/creator on such a project. Editing a schema
// affects every project that shares it.

export async function getSchemaAccess(
    env: Env,
    email: string,
): Promise<Map<number, { canRead: boolean; canWrite: boolean }>> {
    const { results } = await env.DB.prepare(
        `SELECT p.schema_id AS schema_id, rm.role AS role
         FROM role_management rm
                  JOIN projects p ON rm.project_id = p.id
         WHERE rm.useremail = ? AND p.schema_id IS NOT NULL`
    ).bind(email).all<{ schema_id: number; role: string }>();

    const map = new Map<number, { canRead: boolean; canWrite: boolean }>();
    for (const r of results) {
        const cur = map.get(r.schema_id) ?? { canRead: false, canWrite: false };
        cur.canRead = true;
        if (r.role === "admin" || r.role === "creator") cur.canWrite = true;
        map.set(r.schema_id, cur);
    }
    return map;
}

export async function getWritableSchemaIds(env: Env, email: string): Promise<number[]> {
    const access = await getSchemaAccess(env, email);
    return [...access.entries()].filter(([, a]) => a.canWrite).map(([id]) => id);
}

export async function requireSchemaRead(req: Request, env: Env, schemaId: number | string): Promise<string> {
    const email = await requireUser(req, env);
    const access = await getSchemaAccess(env, email);
    if (!access.get(Number(schemaId))?.canRead) {
        throw new HttpError(403, "You don't have access to this schema");
    }
    return email;
}

export async function requireSchemaWrite(req: Request, env: Env, schemaId: number | string): Promise<string> {
    const email = await requireUser(req, env);
    const access = await getSchemaAccess(env, email);
    if (!access.get(Number(schemaId))?.canWrite) {
        throw new HttpError(403, "You need write access to this schema");
    }
    return email;
}
