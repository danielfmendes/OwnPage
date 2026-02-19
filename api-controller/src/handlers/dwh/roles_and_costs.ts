import { Env } from "../../types";
import { queryWithPagination } from "./pagination";

// Helper for error responses
const errorResponse = (msg: string, status = 400) => new Response(msg, { status });

// GET /rolemanagements
// GET /rolemanagements?project_id=...&useremail=...
// DELETE /rolemanagements?email=...&project_id=...
// PUT /rolemanagements
// POST /rolemanagements

// Helper to extract user email from JWT Authorization header
function getUserEmail(req: Request): string {
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
        try {
            const token = authHeader.slice(7);
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.sub || payload.email || "";
        } catch { /* ignore */ }
    }
    return "";
}

export const getRoleManagement = async (req: Request, env: Env) => {
    const url = new URL(req.url);
    const path = url.pathname;

    // Handle /rolemanagements/{id} — returns ALL roles for a specific project_id (used by Manage dialog)
    const idMatch = path.match(/\/rolemanagements\/(\d+)$/);
    if (idMatch) {
        const projectId = idMatch[1];
        const { results } = await env.DB.prepare(`
            SELECT useremail AS user_email, project_id, role, p.name as project_name
            FROM role_management
            JOIN projects p ON p.id = role_management.project_id
            WHERE role_management.project_id = ?
        `).bind(projectId).all();
        return Response.json(results);
    }

    // Default listing: only show roles for the currently authenticated user
    const userEmail = getUserEmail(req);
    if (!userEmail) {
        return errorResponse("Unauthorized – missing or invalid token", 401);
    }

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
        try {
            const data: any = await req.json();
            if (!data.user_email || !data.project_id || !data.role) {
                return errorResponse("Missing required fields: user_email, project_id, role");
            }
            await env.DB.prepare(
                "INSERT INTO role_management (useremail, project_id, role) VALUES (?, ?, ?)"
            ).bind(data.user_email, data.project_id, data.role).run();
            return new Response("Created", { status: 201 });
        } catch (e: any) {
            const msg = String(e);
            if (msg.includes("UNIQUE") || msg.includes("SQLITE_CONSTRAINT")) {
                return new Response("Conflict – this user already has a role in this project", { status: 409 });
            }
            return new Response("Error: " + msg, { status: 500 });
        }
    }

    if (req.method === "PUT") {
        try {
            const data: any = await req.json();
            if (!data.user_email || !data.project_id || !data.role) {
                return errorResponse("Missing required fields: user_email, project_id, role");
            }
            await env.DB.prepare(
                "UPDATE role_management SET role = ? WHERE useremail = ? AND project_id = ?"
            ).bind(data.role, data.user_email, data.project_id).run();
            return new Response("Updated", { status: 200 });
        } catch (e) {
            return new Response("Error: " + e, { status: 500 });
        }
    }

    if (req.method === "DELETE") {
        const url = new URL(req.url);
        const email = url.searchParams.get("email");
        const projectId = url.searchParams.get("project_id");
        if (!email || !projectId) {
            return errorResponse("Missing required query params: email, project_id");
        }
        try {
            await env.DB.prepare(
                "DELETE FROM role_management WHERE useremail = ? AND project_id = ?"
            ).bind(email, projectId).run();
            return new Response("Deleted", { status: 200 });
        } catch (e) {
            return new Response("Error: " + e, { status: 500 });
        }
    }

    return errorResponse("Method not allowed", 405);
};

// --- Part Costs ---

export const partCostsHandler = async (req: Request, env: Env) => {
    const baseQuery = "SELECT * FROM part_costs";
    const countQuery = "SELECT COUNT(*) FROM part_costs";
    return await queryWithPagination(req, env, baseQuery, countQuery);
};
