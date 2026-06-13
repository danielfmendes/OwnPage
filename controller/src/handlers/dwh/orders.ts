import { Env } from "../../types";
import { queryWithPagination } from "./pagination";
import { getAllowedProjectIds, readJson, requireProjectRole, requireUser, resolveProjectId } from "../../utils/auth";

// Helper for error responses
const errorResponse = (msg: string, status = 400) => new Response(msg, { status });

// GET /orders
export const getOrders = async (req: Request, env: Env) => {
    const url = new URL(req.url);
    const filter = url.searchParams.get("filter");

    if (filter && filter.includes("email:$eq.")) {
        // Ported from select/orderbycustomerselect.sql — scoped to the caller's projects
        // (the Go query filtered by `o.project_id = ANY($2)`).
        const userEmail = await requireUser(req, env);
        const allowed = await getAllowedProjectIds(env, userEmail, "user");
        if (allowed.length === 0) return Response.json({ items: [], totalCount: 0 });
        const placeholders = allowed.map(() => "?").join(", ");
        const baseQuery = `
            SELECT
                oi.id, oi.order_id, oi.bike_id, oi.number, oi.price,
                bm.name as model_name, o.order_date,
                o.project_id, c.email as email
            FROM orders o
            JOIN customers c ON o.customer_id = c.id
            JOIN order_items oi ON o.id = oi.order_id
            JOIN bikes b ON oi.bike_id = b.id
            JOIN bike_models bm ON b.model_id = bm.id
            WHERE o.project_id IN (${placeholders})
        `;
        const countQuery = `
            SELECT COUNT(*)
            FROM orders o
            JOIN customers c ON o.customer_id = c.id
            JOIN order_items oi ON o.id = oi.order_id
            JOIN bikes b ON oi.bike_id = b.id
            JOIN bike_models bm ON b.model_id = bm.id
            WHERE o.project_id IN (${placeholders})
        `;
        return await queryWithPagination(req, env, baseQuery, countQuery, allowed);
    }

    // Default GET
    const baseQuery = `
        SELECT o.id, o.order_date, o.project_id, o.customer_id, 
               c.name as customer_name, c.email as email
        FROM orders o
        JOIN customers c ON o.customer_id = c.id
    `;
    const countQuery = `
        SELECT COUNT(*)
        FROM orders o
        JOIN customers c ON o.customer_id = c.id
    `;
    return await queryWithPagination(req, env, baseQuery, countQuery);
};

// POST /orders
export const insertOrder = async (req: Request, env: Env) => {
    const order: any = await readJson(req);
    await requireProjectRole(req, env, order.project_id, "admin");
    try {
        await env.DB.prepare(`INSERT INTO orders (customer_id, order_date, project_id) VALUES (?, ?, ?)`)
            .bind(order.customer_id, order.order_date, order.project_id)
            .run();
        return new Response("Order created", { status: 201 });
    } catch (e) {
        console.error("insertOrder failed:", e);
        return errorResponse("Could not create order", 500);
    }
};

// PUT /orders
export const updateOrder = async (req: Request, env: Env) => {
    const order: any = await readJson(req);
    if (!order.id) return errorResponse("ID missing");
    await requireProjectRole(req, env, order.project_id, "admin");
    try {
        await env.DB.prepare(`UPDATE orders SET order_date = ?, customer_id = ?, project_id = ? WHERE id = ?`)
            .bind(order.order_date, order.customer_id, order.project_id, order.id)
            .run();
        return new Response("Order updated", { status: 200 });
    } catch (e) {
        console.error("updateOrder failed:", e);
        return errorResponse("Could not update order", 500);
    }
};

// DELETE /orders
export const deleteOrder = async (req: Request, env: Env) => {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const cascade = url.searchParams.get("cascade") === "true";

    if (!id) return errorResponse("ID missing");

    const projectId = await resolveProjectId(env, "SELECT project_id FROM orders WHERE id = ?", id);
    await requireProjectRole(req, env, projectId, "admin");

    try {
        if (cascade) {
            await env.DB.batch([
                env.DB.prepare("DELETE FROM order_items WHERE order_id = ?").bind(id),
                env.DB.prepare("DELETE FROM orders WHERE id = ?").bind(id)
            ]);
        } else {
            await env.DB.prepare("DELETE FROM orders WHERE id = ?").bind(id).run();
        }
        return new Response("Order deleted", { status: 200 });
    } catch (e: any) {
        const msg = String(e);
        if (msg.includes("FOREIGN KEY") || msg.includes("FOREIGN_KEY") || msg.includes("SQLITE_CONSTRAINT")) {
            return new Response("Conflict – related data exists; use cascade=true to force delete", { status: 409 });
        }
        return new Response("Error: " + msg, { status: 500 });
    }
};

export const ordersHandler = async (req: Request, env: Env) => {
    switch (req.method) {
        case "GET": return getOrders(req, env);
        case "POST": return insertOrder(req, env);
        case "PUT": return updateOrder(req, env);
        case "DELETE": return deleteOrder(req, env);
        default: return errorResponse("Method not allowed", 405);
    }
};

// --- Order Items ---

export const getOrderItems = async (req: Request, env: Env) => {
    const baseQuery = `
        SELECT 
            oi.id, oi.order_id, oi.bike_id, oi.number, oi.price, 
            bm.name as model_name,
            o.project_id 
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN bikes b ON oi.bike_id = b.id
        JOIN bike_models bm ON b.model_id = bm.id
    `;
    const countQuery = `
        SELECT COUNT(*)
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN bikes b ON oi.bike_id = b.id
        JOIN bike_models bm ON b.model_id = bm.id
    `;
    return await queryWithPagination(req, env, baseQuery, countQuery);
};

export const insertOrderItem = async (req: Request, env: Env) => {
    const item: any = await readJson(req);
    // The project lives on the parent order (mirrors Go's orderitems.go projectIdQuery).
    const projectId = await resolveProjectId(env, "SELECT project_id FROM orders WHERE id = ?", item.order_id);
    await requireProjectRole(req, env, projectId, "admin");
    try {
        await env.DB.prepare(`INSERT INTO order_items (order_id, bike_id, number, price) VALUES (?, ?, ?, ?)`)
            .bind(item.order_id, item.bike_id, item.number, item.price)
            .run();
        return new Response("Order item created", { status: 201 });
    } catch (e) {
        console.error("insertOrderItem failed:", e);
        return errorResponse("Could not create order item", 500);
    }
};

export const updateOrderItem = async (req: Request, env: Env) => {
    const item: any = await readJson(req);
    if (!item.id) return errorResponse("ID missing");
    const projectId = await resolveProjectId(env, "SELECT project_id FROM orders WHERE id = ?", item.order_id);
    await requireProjectRole(req, env, projectId, "admin");
    try {
        await env.DB.prepare(`UPDATE order_items SET order_id = ?, bike_id = ?, number = ?, price = ? WHERE id = ?`)
            .bind(item.order_id, item.bike_id, item.number, item.price, item.id)
            .run();
        return new Response("Order item updated", { status: 200 });
    } catch (e) {
        console.error("updateOrderItem failed:", e);
        return errorResponse("Could not update order item", 500);
    }
};

export const deleteOrderItem = async (req: Request, env: Env) => {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return errorResponse("ID missing");

    const projectId = await resolveProjectId(
        env,
        "SELECT o.project_id FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE oi.id = ?",
        id
    );
    await requireProjectRole(req, env, projectId, "admin");

    try {
        await env.DB.prepare("DELETE FROM order_items WHERE id = ?").bind(id).run();
        return new Response("Order item deleted", { status: 200 });
    } catch (e: any) {
        const msg = String(e);
        if (msg.includes("FOREIGN KEY") || msg.includes("FOREIGN_KEY") || msg.includes("SQLITE_CONSTRAINT")) {
            return new Response("Conflict – related data exists; use cascade=true to force delete", { status: 409 });
        }
        return new Response("Error: " + msg, { status: 500 });
    }
};

export const orderItemsHandler = async (req: Request, env: Env) => {
    switch (req.method) {
        case "GET": return getOrderItems(req, env);
        case "POST": return insertOrderItem(req, env);
        case "PUT": return updateOrderItem(req, env);
        case "DELETE": return deleteOrderItem(req, env);
        default: return errorResponse("Method not allowed", 405);
    }
};
