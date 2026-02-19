import { Env } from "../../types";
import { GraphMeta, GraphData, CityData, BikeSales } from "../../models";

// Helper for error responses
const errorResponse = (msg: string, status = 400) => new Response(msg, { status });

const parseRangeFromFilter = (url: URL): string => {
    // The frontend sends ?filter=range:$eq.1m
    const filter = url.searchParams.get("filter");
    if (filter && filter.includes("range:$eq.")) {
        return filter.split("range:$eq.")[1];
    }
    // Also try normal range param just in case
    return url.searchParams.get("range") || "1m";
}

function getModifiers(range: string) {
    switch (range) {
        case '1d': return { current: '-1 day', previous: '-2 days' };
        case '1w': return { current: '-6 days', previous: '-12 days' };
        case '1m': return { current: '-29 days', previous: '-58 days' };
        case '1y': return { current: '-364 days', previous: '-728 days' };
        default: return { current: null, previous: null }; // max
    }
}

// GET /dashboard/graphmeta?filter=range:$eq.1m
export const getGraphMeta = async (req: Request, env: Env) => {
    const url = new URL(req.url);
    const range = parseRangeFromFilter(url);
    if (!range) return errorResponse("Range missing");

    const mods = getModifiers(range);

    let query: string;
    let bindings: string[] = [];

    if (mods.current) {
        query = `
            SELECT 
                COALESCE((SELECT SUM(oi.price * oi.number) FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE date(o.order_date) >= date('now', ?) AND date(o.order_date) < date('now', '+1 day')), 0) as current_revenue,
                COALESCE((SELECT SUM(oi.price * oi.number) FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE date(o.order_date) >= date('now', ?) AND date(o.order_date) < date('now', ?)), 0) as previous_revenue,
                COALESCE((SELECT SUM(oi.number) FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE date(o.order_date) >= date('now', ?) AND date(o.order_date) < date('now', '+1 day')), 0) as current_sales,
                COALESCE((SELECT SUM(oi.number) FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE date(o.order_date) >= date('now', ?) AND date(o.order_date) < date('now', ?)), 0) as previous_sales
        `;
        bindings = [mods.current, mods.previous, mods.current, mods.current, mods.previous, mods.current];
    } else {
        query = `
            SELECT 
                COALESCE((SELECT SUM(oi.price * oi.number) FROM order_items oi JOIN orders o ON oi.order_id = o.id), 0) as current_revenue,
                0 as previous_revenue,
                COALESCE((SELECT SUM(oi.number) FROM order_items oi JOIN orders o ON oi.order_id = o.id), 0) as current_sales,
                0 as previous_sales
        `;
    }

    const { results } = await env.DB.prepare(query).bind(...bindings).all();
    return Response.json(results);
};

// GET /dashboard/graphdata?filter=range:$eq.1m
export const getGraphData = async (req: Request, env: Env) => {
    const url = new URL(req.url);
    const range = parseRangeFromFilter(url);
    if (!range) return errorResponse("Range missing");

    const mods = getModifiers(range);
    let query = `
        SELECT
             date(o.order_date) as bucket,
             SUM(oi.price * oi.number) AS revenue,
             SUM(oi.number) AS sales_no
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
    `;
    let bindings: string[] = [];

    if (mods.current) {
        query += ` WHERE date(o.order_date) >= date('now', ?) AND date(o.order_date) < date('now', '+1 day') `;
        bindings = [mods.current];
    }

    query += ` GROUP BY date(o.order_date) ORDER BY bucket ASC`;

    const { results } = await env.DB.prepare(query).bind(...bindings).all();
    return Response.json(results);
};

// GET /dashboard/citydata?filter=range:$eq.1m
export const getCityData = async (req: Request, env: Env) => {
    const url = new URL(req.url);
    const range = parseRangeFromFilter(url);
    if (!range) return errorResponse("Range missing");

    const mods = getModifiers(range);

    let query: string;
    let bindings: string[] = [];

    if (mods.current) {
        query = `
            SELECT c.city,
                   SUM(CASE WHEN date(o.order_date) >= date('now', ?) THEN oi.price * oi.number ELSE 0 END) as current_revenue,
                   SUM(CASE WHEN date(o.order_date) >= date('now', ?) AND date(o.order_date) < date('now', ?) THEN oi.price * oi.number ELSE 0 END) as previous_revenue
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            JOIN customers c ON o.customer_id = c.id
            WHERE date(o.order_date) >= date('now', ?)
            GROUP BY c.city
            ORDER BY current_revenue DESC
            LIMIT 15
        `;
        bindings = [mods.current, mods.previous, mods.current, mods.previous];
    } else {
        query = `
            SELECT c.city, SUM(oi.price * oi.number) as current_revenue, 0 as previous_revenue
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            JOIN customers c ON o.customer_id = c.id
            GROUP BY c.city
            ORDER BY current_revenue DESC
            LIMIT 15
        `;
    }

    const { results } = await env.DB.prepare(query).bind(...bindings).all();
    return Response.json(results);
};

// GET /dashboard/bikemodels?filter=range:$eq.1m
export const getBikeSales = async (req: Request, env: Env) => {
    const url = new URL(req.url);
    const range = parseRangeFromFilter(url);
    if (!range) return errorResponse("Range missing");

    const mods = getModifiers(range);
    let query = `
        SELECT
             date(o.order_date) as order_date,
             bm.name as bike_model,
             SUM(oi.price * oi.number) AS revenue,
             SUM(oi.number) AS total_sales
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN bikes b ON oi.bike_id = b.id
        JOIN bike_models bm ON b.model_id = bm.id
    `;
    let bindings: string[] = [];

    if (mods.current) {
        query += ` WHERE date(o.order_date) >= date('now', ?) AND date(o.order_date) < date('now', '+1 day') `;
        bindings = [mods.current];
    }

    query += ` GROUP BY date(o.order_date), bm.name ORDER BY order_date ASC`;

    const { results } = await env.DB.prepare(query).bind(...bindings).all();
    return Response.json(results);
};

export const dashboardHandler = async (req: Request, env: Env) => {
    const url = new URL(req.url);
    const path = url.pathname;

    if (path.endsWith("/graphmeta")) return getGraphMeta(req, env);
    if (path.endsWith("/graphdata")) return getGraphData(req, env);
    if (path.endsWith("/citydata")) return getCityData(req, env);
    if (path.endsWith("/bikemodels")) return getBikeSales(req, env);

    return errorResponse("Dashboard method not found", 404);
};
