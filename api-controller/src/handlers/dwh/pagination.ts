import { Env } from "../../types";

export interface PaginatedResult<T> {
    items: T[];
    totalCount: number;
}

// Parse filter string like "part_type:$eq.fork,project_id:$in.1|2|3,dob:$between.2020-01-01|2025-12-31"
// Returns { conditions: string[], bindings: any[] }
function parseFilters(filterStr: string | null): { conditions: string[]; bindings: any[] } {
    if (!filterStr) return { conditions: [], bindings: [] };

    const conditions: string[] = [];
    const bindings: any[] = [];

    const parts = filterStr.split(",");
    for (const part of parts) {
        if (part.includes(":$eq.")) {
            const [key, value] = part.split(":$eq.");
            const safeKey = key.replace(/[^a-zA-Z0-9_.]/g, "");
            if (safeKey && value !== undefined) {
                conditions.push(`${safeKey} = ?`);
                bindings.push(value);
            }
        } else if (part.includes(":$in.")) {
            const [key, value] = part.split(":$in.");
            const safeKey = key.replace(/[^a-zA-Z0-9_.]/g, "");
            if (safeKey && value) {
                const values = value.split("|");
                const placeholders = values.map(() => "?").join(", ");
                conditions.push(`${safeKey} IN (${placeholders})`);
                bindings.push(...values);
            }
        } else if (part.includes(":$between.")) {
            const [key, value] = part.split(":$between.");
            const safeKey = key.replace(/[^a-zA-Z0-9_.]/g, "");
            if (safeKey && value) {
                const [from, to] = value.split("|");
                if (from && to) {
                    conditions.push(`${safeKey} BETWEEN ? AND ?`);
                    bindings.push(from, to);
                }
            }
        }
    }

    return { conditions, bindings };
}

// Wraps query as subquery and adds WHERE clause so SELECT aliases are available for filtering
function appendFilters(query: string, conditions: string[]): string {
    if (conditions.length === 0) return query;

    const whereClause = conditions.join(" AND ");
    return `SELECT * FROM (${query}) AS _filtered WHERE ${whereClause}`;
}

// Build an ORDER BY clause from the frontend's orderBy param (port of Go's applyPaginationAndSorting).
// Format: "col=dir" comma-separated, e.g. "customer_name=asc,project_id=desc".
// Columns/directions are whitelisted because the clause is string-built (no bind for identifiers).
function buildOrderClause(orderByParam: string | null): string {
    if (!orderByParam) return "";
    const parts: string[] = [];
    for (const segment of orderByParam.split(",")) {
        const [rawCol, rawDir] = segment.split("=");
        const col = (rawCol || "").trim();
        const dir = (rawDir || "asc").trim().toLowerCase();
        if (!/^[A-Za-z0-9_]+$/.test(col)) continue;
        const safeDir = dir === "desc" ? "DESC" : "ASC";
        parts.push(`${col} ${safeDir}`);
    }
    return parts.length ? ` ORDER BY ${parts.join(", ")}` : "";
}

export const queryWithPagination = async <T = any>(
    req: Request,
    env: Env,
    baseQuery: string,
    countQuery: string,
    bindings: any[] = []
): Promise<Response> => {
    try {
        const url = new URL(req.url);
        const filterStr = url.searchParams.get("filter");
        const { conditions, bindings: filterBindings } = parseFilters(filterStr);

        // Apply filters to base query
        const filteredBaseQuery = appendFilters(baseQuery, conditions);
        // Derive count from filtered base query (not from countQuery which loses column names)
        const filteredCountQuery = conditions.length > 0
            ? `SELECT COUNT(*) AS count FROM (${filteredBaseQuery})`
            : countQuery;

        // Binding order must match the SQL: the base query's own placeholders come first (they sit
        // inside the wrapped subquery), then the filter placeholders in the outer WHERE.
        const allBindings = [...bindings, ...filterBindings];
        // When derived from filteredBaseQuery the count query embeds the same base+filter placeholders;
        // when there's no filter we use the caller's countQuery, which only needs the base bindings.
        const countBindings = conditions.length > 0 ? [...bindings, ...filterBindings] : [...bindings];

        // Handle countBy parameter for filter dropdowns
        const countBy = url.searchParams.get("countBy");
        if (countBy) {
            const safeColumn = countBy.replace(/[^a-zA-Z0-9_]/g, "");
            if (!safeColumn) {
                return new Response("Invalid countBy column", { status: 400 });
            }

            const countByQuery = `SELECT ${safeColumn} AS value, COUNT(*) AS count FROM (${filteredBaseQuery}) sub GROUP BY ${safeColumn} ORDER BY count DESC`;
            const { results } = await env.DB.prepare(countByQuery).bind(...allBindings).all();
            return Response.json(results);
        }

        let page = parseInt(url.searchParams.get("page") || "1");
        let pageSize = parseInt(url.searchParams.get("pageSize") || "25");

        if (isNaN(page) || page < 1) page = 1;
        if (isNaN(pageSize) || pageSize < 1 || pageSize > 100) pageSize = 25;

        const offset = (page - 1) * pageSize;

        const orderClause = buildOrderClause(url.searchParams.get("orderBy"));
        const paginatedQuery = `${filteredBaseQuery}${orderClause} LIMIT ? OFFSET ?`;

        const [countResult, itemsResult] = await env.DB.batch([
            env.DB.prepare(filteredCountQuery).bind(...countBindings),
            env.DB.prepare(paginatedQuery).bind(...allBindings, pageSize, offset)
        ]);

        const totalCount = countResult.results[0] ? (countResult.results[0] as any)["COUNT(*)"] || (countResult.results[0] as any)["count"] || 0 : 0;

        const responseData: PaginatedResult<T> = {
            items: itemsResult.results as T[],
            totalCount: totalCount as number
        };

        return Response.json(responseData);
    } catch (error) {
        console.error("Pagination Query Error:", error);
        return new Response("Internal Server Error: " + error, { status: 500 });
    }
};
