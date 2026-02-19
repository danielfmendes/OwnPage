import { Env } from "../../types";
import { queryWithPagination } from "./pagination";

// Generic CRUD helper
const createCrudHandlers = (table: string, columns: string[]) => {
    return {
        getAll: async (req: Request, env: Env) => {
            const baseQuery = `SELECT * FROM ${table}`;
            const countQuery = `SELECT COUNT(*) FROM ${table}`;
            return await queryWithPagination(req, env, baseQuery, countQuery);
        },
        insert: async (req: Request, env: Env) => {
            try {
                const data: any = await req.json();
                const placeholders = columns.map(() => "?").join(", ");
                const values = columns.map(col => data[col]);
                await env.DB.prepare(`INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`)
                    .bind(...values)
                    .run();
                return new Response("Created", { status: 201 });
            } catch (e) {
                return new Response("Error: " + e, { status: 400 });
            }
        },
        update: async (req: Request, env: Env) => {
            try {
                const data: any = await req.json();
                if (!data.id) return new Response("ID missing", { status: 400 });
                const setClause = columns.map(col => `${col} = ?`).join(", ");
                const values = columns.map(col => data[col]);
                await env.DB.prepare(`UPDATE ${table} SET ${setClause} WHERE id = ?`)
                    .bind(...values, data.id)
                    .run();
                return new Response("Updated", { status: 200 });
            } catch (e) {
                return new Response("Error: " + e, { status: 400 });
            }
        },
        delete: async (req: Request, env: Env) => {
            const url = new URL(req.url);
            const id = url.searchParams.get("id");
            const cascade = url.searchParams.get("cascade") === "true";
            if (!id) return new Response("Bad request – missing or invalid ID", { status: 400 });
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
                return new Response("Error: " + msg, { status: 500 });
            }
        },
        handler: async (req: Request, env: Env) => {
            const handlers = createCrudHandlers(table, columns);
            switch (req.method) {
                case "GET": return handlers.getAll(req, env);
                case "POST": return handlers.insert(req, env);
                case "PUT": return handlers.update(req, env);
                case "DELETE": return handlers.delete(req, env);
                default: return new Response("Method not allowed", { status: 405 });
            }
        }
    };
};

// Bike Models
export const bikeModelsHandler = (req: Request, env: Env) =>
    createCrudHandlers("bike_models", ["name", "saddle_id", "frame_id", "fork_id"]).handler(req, env);

// Components – queries saddles, frames, or forks based on ?filter=type:$eq.{type}
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

    return createCrudHandlers(tableName, ["name"]).handler(req, env);
}

// Customers
export const customersHandler = (req: Request, env: Env) =>
    createCrudHandlers("customers", ["email", "first_name", "name", "dob", "city", "project_id"]).handler(req, env);

// Projects — custom handler to auto-assign creator role on creation
export const projectsHandler = async (req: Request, env: Env) => {
    if (req.method === "POST") {
        try {
            const data: any = await req.json();

            // Extract user email from JWT
            const authHeader = req.headers.get("Authorization");
            let userEmail = "";
            if (authHeader?.startsWith("Bearer ")) {
                const token = authHeader.slice(7);
                try {
                    const payload = JSON.parse(atob(token.split(".")[1]));
                    userEmail = payload.sub || payload.email || "";
                } catch { /* ignore decode errors */ }
            }

            // Insert project
            const result = await env.DB.prepare("INSERT INTO projects (name) VALUES (?)").bind(data.name).run();
            const projectId = result.meta?.last_row_id;

            // Auto-assign creator role if we have the user email and project ID
            if (userEmail && projectId) {
                await env.DB.prepare(
                    "INSERT INTO role_management (useremail, project_id, role) VALUES (?, ?, 'creator')"
                ).bind(userEmail, projectId).run();
            }

            return new Response("Created", { status: 201 });
        } catch (e) {
            return new Response("Error: " + e, { status: 400 });
        }
    }

    // Delegate all other methods to the generic CRUD handler
    return createCrudHandlers("projects", ["name"]).handler(req, env);
};

// Users (Simplified - use Auth for real logic)
export const usersHandler = (req: Request, env: Env) =>
    createCrudHandlers("users", ["username", "email", "dob", "is_verified"]).handler(req, env);

export const userHandler = async (req: Request, env: Env) => {
    if (req.method !== "GET") return new Response("Method Not Allowed", { status: 405 });

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

// Warehouse Parts
export const warehousePartsHandler = (req: Request, env: Env) =>
    createCrudHandlers("warehouse_parts", ["part_type", "part_id", "quantity", "storage_location", "project_id"]).handler(req, env);

