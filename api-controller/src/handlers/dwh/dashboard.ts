import { Env } from "../../types";
import { GraphMeta, GraphData, CityData, BikeSales } from "../../models";
import { getAllowedProjectIds, HttpError, requireUser } from "../../utils/auth";

// Helper for error responses
const errorResponse = (msg: string, status = 400) => new Response(msg, { status });

const parseRangeFromFilter = (url: URL): string => {
    // The frontend sends ?filter=range:$eq.1m
    const filter = url.searchParams.get("filter");
    if (filter && filter.includes("range:$eq.")) {
        return filter.split("range:$eq.")[1].split(",")[0];
    }
    // Also try normal range param just in case
    return url.searchParams.get("range") || "1m";
}

// Parse project_id from filter string, e.g. "project_id:$in.1|2|3" or "project_id:$eq.1"
const parseProjectIds = (url: URL): number[] => {
    const filter = url.searchParams.get("filter");
    if (!filter) return [];
    const inMatch = filter.match(/project_id:\$in\.([\d|]+)/);
    if (inMatch) return inMatch[1].split("|").map(Number).filter(n => !isNaN(n));
    const eqMatch = filter.match(/project_id:\$eq\.(\d+)/);
    if (eqMatch) return [Number(eqMatch[1])];
    return [];
};

/**
 * Resolve which project IDs this request may aggregate over (port of Go's filterProjectIDs):
 * the requested IDs intersected with the caller's accessible projects. If the client requests
 * none, fall back to all of the caller's projects. Throws 403 if they request only projects they
 * cannot access. An empty array means "this user has no projects" → handlers return empty data.
 */
const scopedProjectIds = async (req: Request, env: Env): Promise<number[]> => {
    const email = await requireUser(req, env);
    const allowed = await getAllowedProjectIds(env, email, "user");
    const requested = parseProjectIds(new URL(req.url));
    if (requested.length === 0) return allowed;
    const allowedSet = new Set(allowed);
    const filtered = requested.filter(id => allowedSet.has(id));
    if (filtered.length === 0) {
        throw new HttpError(403, "You don't have access to the requested project(s)");
    }
    return filtered;
};

// Returns { sql: " AND o.project_id IN (?,?)", bindings: [1,2] } or empty
const buildProjectFilter = (projectIds: number[], prefix: "WHERE" | "AND" = "AND"): { sql: string; bindings: number[] } => {
    if (projectIds.length === 0) return { sql: "", bindings: [] };
    const placeholders = projectIds.map(() => "?").join(", ");
    return { sql: ` ${prefix} o.project_id IN (${placeholders})`, bindings: projectIds };
};

function getModifiers(range: string) {
    switch (range) {
        case '1d': return { current: '-1 day', previous: '-2 days' };
        case '1w': return { current: '-6 days', previous: '-12 days' };
        case '1m': return { current: '-29 days', previous: '-58 days' };
        case '1y': return { current: '-364 days', previous: '-728 days' };
        default: return { current: null, previous: null }; // max
    }
}

// GET /dashboard/graphmeta?filter=range:$eq.1m,project_id:$in.1|2
export const getGraphMeta = async (req: Request, env: Env) => {
    const url = new URL(req.url);
    const range = parseRangeFromFilter(url);
    if (!range) return errorResponse("Range missing");

    const mods = getModifiers(range);
    const projectIds = await scopedProjectIds(req, env);
    if (projectIds.length === 0) {
        return Response.json([{ current_revenue: 0, previous_revenue: 0, current_sales: 0, previous_sales: 0 }]);
    }
    const proj = buildProjectFilter(projectIds, "AND");

    let query: string;
    let bindings: any[] = [];

    if (mods.current) {
        query = `
            SELECT
                COALESCE((SELECT SUM(oi.price * oi.number) FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE date(o.order_date) >= date('now', ?)${proj.sql} AND date(o.order_date) < date('now', '+1 day')), 0) as current_revenue,
                COALESCE((SELECT SUM(oi.price * oi.number) FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE date(o.order_date) >= date('now', ?) AND date(o.order_date) < date('now', ?)${proj.sql}), 0) as previous_revenue,
                COALESCE((SELECT SUM(oi.number) FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE date(o.order_date) >= date('now', ?)${proj.sql} AND date(o.order_date) < date('now', '+1 day')), 0) as current_sales,
                COALESCE((SELECT SUM(oi.number) FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE date(o.order_date) >= date('now', ?) AND date(o.order_date) < date('now', ?)${proj.sql}), 0) as previous_sales
        `;
        bindings = [
            mods.current, ...proj.bindings,
            mods.previous, mods.current, ...proj.bindings,
            mods.current, ...proj.bindings,
            mods.previous, mods.current, ...proj.bindings,
        ];
    } else {
        query = `
            SELECT 
                COALESCE((SELECT SUM(oi.price * oi.number) FROM order_items oi JOIN orders o ON oi.order_id = o.id${proj.sql.replace("AND", "WHERE")}), 0) as current_revenue,
                0 as previous_revenue,
                COALESCE((SELECT SUM(oi.number) FROM order_items oi JOIN orders o ON oi.order_id = o.id${proj.sql.replace("AND", "WHERE")}), 0) as current_sales,
                0 as previous_sales
        `;
        bindings = [...proj.bindings, ...proj.bindings];
    }

    const { results } = await env.DB.prepare(query).bind(...bindings).all();
    return Response.json(results);
};

// GET /dashboard/graphdata?filter=range:$eq.1m,project_id:$in.1|2
export const getGraphData = async (req: Request, env: Env) => {
    const url = new URL(req.url);
    const range = parseRangeFromFilter(url);
    if (!range) return errorResponse("Range missing");

    const mods = getModifiers(range);
    const projectIds = await scopedProjectIds(req, env);
    if (projectIds.length === 0) return Response.json([]);
    const proj = buildProjectFilter(projectIds, "AND");

    let query = `
        SELECT
             date(o.order_date) as bucket,
             SUM(oi.price * oi.number) AS revenue,
             SUM(oi.number) AS sales_no
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
    `;
    let bindings: any[] = [];

    if (mods.current) {
        query += ` WHERE date(o.order_date) >= date('now', ?) AND date(o.order_date) < date('now', '+1 day')${proj.sql} `;
        bindings = [mods.current, ...proj.bindings];
    } else if (proj.bindings.length > 0) {
        query += ` WHERE ${proj.sql.trimStart().replace(/^AND /, "")} `;
        bindings = proj.bindings;
    }

    query += ` GROUP BY date(o.order_date) ORDER BY bucket ASC`;

    const { results } = await env.DB.prepare(query).bind(...bindings).all();
    return Response.json(results);
};

// GET /dashboard/citydata?filter=range:$eq.1m,project_id:$in.1|2
export const getCityData = async (req: Request, env: Env) => {
    const url = new URL(req.url);
    const range = parseRangeFromFilter(url);
    if (!range) return errorResponse("Range missing");

    const mods = getModifiers(range);
    const projectIds = await scopedProjectIds(req, env);
    if (projectIds.length === 0) return Response.json([]);
    const proj = buildProjectFilter(projectIds, "AND");

    let query: string;
    let bindings: any[] = [];

    if (mods.current) {
        query = `
            SELECT c.city,
                   SUM(CASE WHEN date(o.order_date) >= date('now', ?) THEN oi.price * oi.number ELSE 0 END) as current_revenue,
                   SUM(CASE WHEN date(o.order_date) >= date('now', ?) AND date(o.order_date) < date('now', ?) THEN oi.price * oi.number ELSE 0 END) as previous_revenue
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            JOIN customers c ON o.customer_id = c.id
            WHERE date(o.order_date) >= date('now', ?)${proj.sql}
            GROUP BY c.city
            ORDER BY current_revenue DESC
            LIMIT 15
        `;
        bindings = [mods.current, mods.previous, mods.current, mods.previous, ...proj.bindings];
    } else {
        query = `
            SELECT c.city, SUM(oi.price * oi.number) as current_revenue, 0 as previous_revenue
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            JOIN customers c ON o.customer_id = c.id
            ${proj.bindings.length > 0 ? `WHERE ${proj.sql.trimStart().replace(/^AND /, "")}` : ""}
            GROUP BY c.city
            ORDER BY current_revenue DESC
            LIMIT 15
        `;
        bindings = proj.bindings;
    }

    const { results } = await env.DB.prepare(query).bind(...bindings).all();
    return Response.json(results);
};

// GET /dashboard/bikemodels?filter=range:$eq.1m,project_id:$in.1|2
export const getBikeSales = async (req: Request, env: Env) => {
    const url = new URL(req.url);
    const range = parseRangeFromFilter(url);
    if (!range) return errorResponse("Range missing");

    const mods = getModifiers(range);
    const projectIds = await scopedProjectIds(req, env);
    if (projectIds.length === 0) return Response.json([]);
    const proj = buildProjectFilter(projectIds, "AND");

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
    let bindings: any[] = [];

    if (mods.current) {
        query += ` WHERE date(o.order_date) >= date('now', ?) AND date(o.order_date) < date('now', '+1 day')${proj.sql} `;
        bindings = [mods.current, ...proj.bindings];
    } else if (proj.bindings.length > 0) {
        query += ` WHERE ${proj.sql.trimStart().replace(/^AND /, "")} `;
        bindings = proj.bindings;
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
