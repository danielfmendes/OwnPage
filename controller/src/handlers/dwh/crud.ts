import { Env } from "../../types";
import { queryWithPagination } from "./pagination";
import {
    getAllowedProjectIds,
    readJson,
    requireProjectRole,
    requireUser,
    resolveProjectId,
} from "../../utils/auth";

interface CrudOptions {
    // Column on this table that holds the owning project_id. When set, writes require
    // admin on that project (mirrors Go's HandleInsert/Update/Delete + ValidateProjectAccess).
    projectColumn?: string;
    // When true the table is read-only (GET only) — writes return 405. Matches the Go
    // controller, where bike_models / components / users have no insert/update/delete handlers.
    readOnly?: boolean;
}

const methodNotAllowed = () => new Response("Method not allowed", { status: 405 });

// Generic CRUD helper
const createCrudHandlers = (table: string, columns: string[], options: CrudOptions = {}) => {
    return {
        getAll: async (req: Request, env: Env) => {
            const baseQuery = `SELECT * FROM ${table}`;
            const countQuery = `SELECT COUNT(*) FROM ${table}`;
            return await queryWithPagination(req, env, baseQuery, countQuery);
        },
        insert: async (req: Request, env: Env) => {
            if (options.readOnly) return methodNotAllowed();
            const data: any = await readJson(req);
            if (options.projectColumn) {
                await requireProjectRole(req, env, data[options.projectColumn], "admin");
            }
            try {
                const placeholders = columns.map(() => "?").join(", ");
                const values = columns.map(col => data[col]);
                await env.DB.prepare(`INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`)
                    .bind(...values)
                    .run();
                return new Response("Created", { status: 201 });
            } catch (e) {
                console.error(`insert ${table} failed:`, e);
                return new Response("Could not create record", { status: 500 });
            }
        },
        update: async (req: Request, env: Env) => {
            if (options.readOnly) return methodNotAllowed();
            const data: any = await readJson(req);
            if (!data.id) return new Response("ID missing", { status: 400 });
            if (options.projectColumn) {
                await requireProjectRole(req, env, data[options.projectColumn], "admin");
            }
            try {
                const setClause = columns.map(col => `${col} = ?`).join(", ");
                const values = columns.map(col => data[col]);
                await env.DB.prepare(`UPDATE ${table} SET ${setClause} WHERE id = ?`)
                    .bind(...values, data.id)
                    .run();
                return new Response("Updated", { status: 200 });
            } catch (e) {
                console.error(`update ${table} failed:`, e);
                return new Response("Could not update record", { status: 500 });
            }
        },
        delete: async (req: Request, env: Env) => {
            if (options.readOnly) return methodNotAllowed();
            const url = new URL(req.url);
            const id = url.searchParams.get("id");
            const cascade = url.searchParams.get("cascade") === "true";
            if (!id) return new Response("Bad request – missing or invalid ID", { status: 400 });

            if (options.projectColumn) {
                const projectId = await resolveProjectId(
                    env,
                    `SELECT ${options.projectColumn} AS project_id FROM ${table} WHERE id = ?`,
                    id
                );
                await requireProjectRole(req, env, projectId, "admin");
            }

            try {
                if (cascade) {
                    // Define cascade dependencies per table
                    const cascadeSteps: Record<string, string[]> = {
                        customers: [
                            "DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE customer_id = ?)",
                            "DELETE FROM orders WHERE customer_id = ?",
                        ],
                        bike_models: [
                            "DELETE FROM order_items WHERE bike_id IN (SELECT id FROM bikes WHERE model_id = ?)",
                            "DELETE FROM orders WHERE id NOT IN (SELECT DISTINCT order_id FROM order_items)",
                            "DELETE FROM bikes WHERE model_id = ?",
                        ],
                        warehouse_parts: [], // no children
                        projects: [
                            "DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE project_id = ?)",
                            "DELETE FROM orders WHERE project_id = ?",
                            "DELETE FROM bikes WHERE project_id = ?",
                            "DELETE FROM customers WHERE project_id = ?",
                            "DELETE FROM warehouse_parts WHERE project_id = ?",
                            "DELETE FROM role_management WHERE project_id = ?",
                        ],
                    };
                    const steps = cascadeSteps[table] || [];
                    const stmts = [
                        ...steps.map(sql => env.DB.prepare(sql).bind(id)),
                        env.DB.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id),
                    ];
                    await env.DB.batch(stmts);
                } else {
                    await env.DB.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id).run();
                }
                return new Response("Deleted", { status: 200 });
            } catch (e: any) {
                const msg = String(e);
                if (msg.includes("FOREIGN KEY") || msg.includes("FOREIGN_KEY") || msg.includes("SQLITE_CONSTRAINT")) {
                    return new Response("Conflict – related data exists; use cascade=true to force delete", { status: 409 });
                }
                console.error(`delete ${table} failed:`, e);
                return new Response("Could not delete record", { status: 500 });
            }
        },
        handler: async (req: Request, env: Env) => {
            const handlers = createCrudHandlers(table, columns, options);
            switch (req.method) {
                case "GET": return handlers.getAll(req, env);
                case "POST": return handlers.insert(req, env);
                case "PUT": return handlers.update(req, env);
                case "DELETE": return handlers.delete(req, env);
                default: return methodNotAllowed();
            }
        }
    };
};

// Bike Models — read-only in the Go controller (GetBikeModels only)
export const bikeModelsHandler = (req: Request, env: Env) =>
    createCrudHandlers("bike_models", ["name", "saddle_id", "frame_id", "fork_id"], { readOnly: true }).handler(req, env);

// Components – queries saddles, frames, or forks based on ?filter=type:$eq.{type}. Read-only (matches Go).
export const componentsHandler = async (req: Request, env: Env) => {
    const url = new URL(req.url);
    const filter = url.searchParams.get("filter") || "";

    // Parse type from filter string like "type:$eq.forks"
    let tableName = "";
    const typeMatch = filter.match(/type:\$eq\.(\w+)/);
    if (typeMatch) {
        const type = typeMatch[1].toLowerCase();
        if (type === "saddles" || type === "saddle") tableName = "saddles";
        else if (type === "frames" || type === "frame") tableName = "frames";
        else if (type === "forks" || type === "fork") tableName = "forks";
    }

    if (!tableName) {
        return new Response("Missing or invalid type filter. Use ?filter=type:$eq.saddles|frames|forks", { status: 400 });
    }

    if (req.method === "GET") {
        const { results } = await env.DB.prepare(`SELECT * FROM ${tableName}`).all();
        return Response.json(results);
    }

    return methodNotAllowed();
}

// Customers — writes require admin on the row's project_id
export const customersHandler = (req: Request, env: Env) =>
    createCrudHandlers(
        "customers",
        ["email", "first_name", "name", "dob", "city", "project_id"],
        { projectColumn: "project_id" }
    ).handler(req, env);

// Projects — GET is scoped to the caller's projects; POST auto-assigns creator; PUT/DELETE
// require the creator role on the target project.
export const projectsHandler = async (req: Request, env: Env) => {
    if (req.method === "GET") {
        // Mirrors Go's GetProjectsForUserByRole: only projects where the caller has >= requiredRole.
        const email = await requireUser(req, env);
        const url = new URL(req.url);
        const requiredRole = url.searchParams.get("requiredRole") || "user";
        const ids = await getAllowedProjectIds(env, email, requiredRole);
        if (ids.length === 0) return Response.json([]);
        const placeholders = ids.map(() => "?").join(", ");
        const { results } = await env.DB.prepare(
            `SELECT id, name FROM projects WHERE id IN (${placeholders})`
        ).bind(...ids).all();
        return Response.json(results);
    }

    if (req.method === "POST") {
        // Creating a project is allowed for any authenticated user; they become its creator.
        const email = await requireUser(req, env);
        const data: any = await readJson(req);
        try {
            const result = await env.DB.prepare("INSERT INTO projects (name) VALUES (?)").bind(data.name).run();
            const projectId = result.meta?.last_row_id;
            if (projectId) {
                await env.DB.prepare(
                    "INSERT INTO role_management (useremail, project_id, role) VALUES (?, ?, 'creator')"
                ).bind(email, projectId).run();
            }
            return new Response("Created", { status: 201 });
        } catch (e) {
            console.error("create project failed:", e);
            return new Response("Could not create project", { status: 500 });
        }
    }

    if (req.method === "PUT") {
        const data: any = await readJson(req);
        if (!data.id) return new Response("ID missing", { status: 400 });
        // The project IS the resource — require creator on it.
        await requireProjectRole(req, env, data.id, "creator");
        return createCrudHandlers("projects", ["name"]).update(req, env);
    }

    if (req.method === "DELETE") {
        const url = new URL(req.url);
        const id = url.searchParams.get("id");
        if (!id) return new Response("Bad request – missing or invalid ID", { status: 400 });
        await requireProjectRole(req, env, id, "creator");
        return createCrudHandlers("projects", ["name"]).delete(req, env);
    }

    return methodNotAllowed();
};

// Users — read-only here (registration/auth is handled by /auth). Matches Go's GetUsers/GetUser.
export const usersHandler = (req: Request, env: Env) =>
    createCrudHandlers("users", ["username", "email", "dob", "is_verified"], { readOnly: true }).handler(req, env);

export const userHandler = async (req: Request, env: Env) => {
    if (req.method !== "GET") return methodNotAllowed();

    const url = new URL(req.url);
    const filter = url.searchParams.get("filter");

    if (filter && filter.startsWith("email:$eq.")) {
        const email = filter.split("email:$eq.")[1];
        const query = `SELECT username, email, dob, is_verified FROM users WHERE email = ?`;
        const { results } = await env.DB.prepare(query).bind(email).all();
        return Response.json(results);
    }

    return new Response("Filter missing or invalid", { status: 400 });
};

// Warehouse Parts — writes require admin on the row's project_id
export const warehousePartsHandler = (req: Request, env: Env) =>
    createCrudHandlers(
        "warehouse_parts",
        ["part_type", "part_id", "quantity", "storage_location", "project_id"],
        { projectColumn: "project_id" }
    ).handler(req, env);
