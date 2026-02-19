import { Env } from "../../types";
import { queryWithPagination } from "./pagination";

// Helper for error responses
const errorResponse = (msg: string, status = 400) => new Response(msg, { status });

// GET /bikes
export const getBikes = async (req: Request, env: Env) => {
    const baseQuery = `
        SELECT b.id,
               b.model_id,
               b.serial_number,
               b.production_date,
               b.quantity,
               b.warehouse_location,
               b.project_id,
               bm.name as model_name
        FROM bikes b
        JOIN bike_models bm ON b.model_id = bm.id
    `;
    const countQuery = `
        SELECT COUNT(*)
        FROM bikes b
        JOIN bike_models bm ON b.model_id = bm.id
    `;
    return await queryWithPagination(req, env, baseQuery, countQuery);
};

// POST /bikes
export const insertBike = async (req: Request, env: Env) => {
    try {
        const bike: any = await req.json();
        const query = `
            INSERT INTO bikes (project_id, model_id, serial_number, production_date, quantity, warehouse_location) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        await env.DB.prepare(query)
            .bind(bike.project_id, bike.model_id, bike.serial_number, bike.production_date, bike.quantity, bike.warehouse_location)
            .run();
        return new Response("Bike created", { status: 201 });
    } catch (e) {
        return errorResponse("Error processing request: " + e);
    }
};

// PUT /bikes
export const updateBike = async (req: Request, env: Env) => {
    try {
        const bike: any = await req.json();
        if (!bike.id) return errorResponse("ID missing");

        const query = `
            UPDATE bikes 
            SET model_id = ?, serial_number = ?, production_date = ?, quantity = ?, warehouse_location = ?, project_id = ? 
            WHERE id = ?
        `;
        await env.DB.prepare(query)
            .bind(bike.model_id, bike.serial_number, bike.production_date, bike.quantity, bike.warehouse_location, bike.project_id, bike.id)
            .run();
        return new Response("Bike updated", { status: 200 });
    } catch (e) {
        return errorResponse("Error processing request: " + e);
    }
};

// DELETE /bikes?id=...&cascade=true/false
export const deleteBike = async (req: Request, env: Env) => {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const cascade = url.searchParams.get("cascade") === "true";

    if (!id) return errorResponse("Bad request – missing or invalid ID");

    try {
        if (cascade) {
            await env.DB.batch([
                env.DB.prepare("DELETE FROM order_items WHERE bike_id = ?").bind(id),
                env.DB.prepare("DELETE FROM orders WHERE id NOT IN (SELECT DISTINCT order_id FROM order_items)"),
                env.DB.prepare("DELETE FROM bikes WHERE id = ?").bind(id)
            ]);
        } else {
            await env.DB.prepare("DELETE FROM bikes WHERE id = ?").bind(id).run();
        }
        return new Response("Bike deleted", { status: 200 });
    } catch (e: any) {
        const msg = String(e);
        if (msg.includes("FOREIGN KEY") || msg.includes("FOREIGN_KEY") || msg.includes("SQLITE_CONSTRAINT")) {
            return new Response("Conflict – related data exists; use cascade=true to force delete", { status: 409 });
        }
        return new Response("Error: " + msg, { status: 500 });
    }
};

export const bikeHandler = async (req: Request, env: Env) => {
    switch (req.method) {
        case "GET": return getBikes(req, env);
        case "POST": return insertBike(req, env);
        case "PUT": return updateBike(req, env);
        case "DELETE": return deleteBike(req, env);
        default: return errorResponse("Method not allowed", 405);
    }
};
