import { Env } from "../../types";
import { queryWithPagination } from "./pagination";
import {
    canModifyRole,
    getAllowedProjectIds,
    hasProjectRole,
    readJson,
    requireUser,
} from "../../utils/auth";

// Helper for error responses
const errorResponse = (msg: string, status = 400) => new Response(msg, { status });

// GET /rolemanagements
// GET /rolemanagements/{id}
// DELETE /rolemanagements?email=...&project_id=...
// PUT /rolemanagements
// POST /rolemanagements

export const getRoleManagement = async (req: Request, env: Env) => {
    const url = new URL(req.url);
    const path = url.pathname;

    // Handle /rolemanagements/{id} — returns ALL roles for a specific project_id (used by Manage dialog).
    // Only a member of that project may view its roster.
    const idMatch = path.match(/\/rolemanagements\/(\d+)$/);
    if (idMatch) {
        const projectId = idMatch[1];
        const email = await requireUser(req, env);
        if (!(await hasProjectRole(env, email, projectId, "user"))) {
            return errorResponse("You don't have access to this project", 403);
        }
        const { results } = await env.DB.prepare(`
            SELECT useremail AS user_email, project_id, role, p.name as project_name
            FROM role_management
            JOIN projects p ON p.id = role_management.project_id
            WHERE role_management.project_id = ?
        `).bind(projectId).all();
        return Response.json(results);
    }

    // Default listing: only show roles for the currently authenticated user
    const userEmail = await requireUser(req, env);

    const baseQuery = `
        SELECT useremail AS user_email, project_id, role, p.name as project_name
        FROM role_management
        JOIN projects p ON p.id = role_management.project_id
        WHERE useremail = ?
    `;
    const countQuery = `
        SELECT COUNT(*)
        FROM role_management
        JOIN projects p ON p.id = role_management.project_id
        WHERE useremail = ?
    `;

    return await queryWithPagination(req, env, baseQuery, countQuery, [userEmail]);
}

export const roleManagementHandler = async (req: Request, env: Env) => {
    if (req.method === "GET") {
        return getRoleManagement(req, env);
    }

    if (req.method === "POST") {
        const data: any = await readJson(req);
        if (!data.user_email || !data.project_id || !data.role) {
            return errorResponse("Missing required fields: user_email, project_id, role");
        }
        if (data.role === "creator") {
            return errorResponse("Cannot manually assign the creator role.", 403);
        }

        const actor = await requireUser(req, env);
        // Permission check (port of CanModifyRole; oldRole is "" because the assignment is new).
        const denied = await canModifyRole(env, actor, data.project_id, data.user_email, "", data.role);
        if (denied) return errorResponse(denied, 403);

        // Target user must exist.
        const userExists = await env.DB.prepare("SELECT 1 FROM users WHERE email = ?")
            .bind(data.user_email).first();
        if (!userExists) return errorResponse("User does not exist.", 400);

        // Must not already be assigned to the project.
        const already = await env.DB.prepare(
            "SELECT 1 FROM role_management WHERE useremail = ? AND project_id = ?"
        ).bind(data.user_email, data.project_id).first();
        if (already) return errorResponse("User is already assigned to this project.", 409);

        try {
            await env.DB.prepare(
                "INSERT INTO role_management (useremail, project_id, role) VALUES (?, ?, ?)"
            ).bind(data.user_email, data.project_id, data.role).run();
            return new Response("Created", { status: 201 });
        } catch (e: any) {
            const msg = String(e);
            if (msg.includes("UNIQUE") || msg.includes("SQLITE_CONSTRAINT")) {
                return errorResponse("Conflict – this user already has a role in this project", 409);
            }
            console.error("insert role failed:", e);
            return errorResponse("Could not assign role", 500);
        }
    }

    if (req.method === "PUT") {
        const data: any = await readJson(req);
        if (!data.user_email || !data.project_id || !data.role) {
            return errorResponse("Missing required fields: user_email, project_id, role");
        }
        if (data.role === "creator") {
            return errorResponse("Cannot reassign a user to the creator role.", 403);
        }

        const actor = await requireUser(req, env);

        const existing: any = await env.DB.prepare(
            "SELECT role FROM role_management WHERE useremail = ? AND project_id = ?"
        ).bind(data.user_email, data.project_id).first();
        if (!existing) return errorResponse("Entry not found.", 404);
        if (existing.role === "creator") {
            return errorResponse("Cannot change the role of the project creator.", 403);
        }

        const denied = await canModifyRole(env, actor, data.project_id, data.user_email, existing.role, data.role);
        if (denied) return errorResponse(denied, 403);

        // No-op update.
        if (existing.role === data.role) return new Response(null, { status: 204 });

        try {
            await env.DB.prepare(
                "UPDATE role_management SET role = ? WHERE useremail = ? AND project_id = ?"
            ).bind(data.role, data.user_email, data.project_id).run();
            return new Response("Updated", { status: 200 });
        } catch (e) {
            console.error("update role failed:", e);
            return errorResponse("Could not update role", 500);
        }
    }

    if (req.method === "DELETE") {
        const url = new URL(req.url);
        const email = url.searchParams.get("email");
        const projectId = url.searchParams.get("project_id");
        if (!email || !projectId) {
            return errorResponse("Missing required query params: email, project_id");
        }

        const actor = await requireUser(req, env);

        const existing: any = await env.DB.prepare(
            "SELECT role FROM role_management WHERE useremail = ? AND project_id = ?"
        ).bind(email, projectId).first();
        if (!existing) return errorResponse("Entry not found.", 404);
        if (existing.role === "creator") {
            return errorResponse("Cannot remove the project creator.", 403);
        }

        const denied = await canModifyRole(env, actor, projectId, email, existing.role, "");
        if (denied) return errorResponse(denied, 403);

        try {
            await env.DB.prepare(
                "DELETE FROM role_management WHERE useremail = ? AND project_id = ?"
            ).bind(email, projectId).run();
            return new Response("Deleted", { status: 200 });
        } catch (e) {
            console.error("delete role failed:", e);
            return errorResponse("Could not remove role", 500);
        }
    }

    return errorResponse("Method not allowed", 405);
};

// --- Part Costs ---
// Scoped to the caller's projects (port of Go's HandleGetWithProjectIDs).
export const partCostsHandler = async (req: Request, env: Env) => {
    const email = await requireUser(req, env);
    const allowed = await getAllowedProjectIds(env, email, "user");
    if (allowed.length === 0) {
        return Response.json({ items: [], totalCount: 0 });
    }
    const placeholders = allowed.map(() => "?").join(", ");
    const baseQuery = `SELECT * FROM part_costs WHERE project_id IN (${placeholders})`;
    const countQuery = `SELECT COUNT(*) FROM part_costs WHERE project_id IN (${placeholders})`;
    return await queryWithPagination(req, env, baseQuery, countQuery, allowed);
};
