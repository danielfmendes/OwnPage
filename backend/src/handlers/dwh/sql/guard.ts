// Security guard for the Monaco SQL console. The console is a SCOPED, READ-ONLY query tool:
// a single SELECT against the caller's own project tables. Enforced the same way on both dialects
// (Postgres additionally runs in a read-only transaction). This is allowlist-first, not blocklist.

import { HttpError } from "../../../utils/auth";

// Remove -- line comments and /* */ block comments so they can't smuggle past the checks.
function stripComments(sql: string): string {
    return sql
        .replace(/\/\*[\s\S]*?\*\//g, " ")
        .replace(/--[^\n]*/g, " ");
}

const WRITE_KEYWORDS =
    /\b(insert|update|delete|drop|alter|create|truncate|grant|revoke|attach|detach|pragma|vacuum|reindex|copy|call|do|replace|merge)\b/i;

// Validate the statement is a single read-only SELECT/WITH. Throws 400 otherwise. Returns the
// cleaned (comment-stripped, trimmed) SQL.
export function validateReadOnly(rawSql: string): string {
    const sql = stripComments(rawSql).trim().replace(/;\s*$/, "");
    if (!sql) throw new HttpError(400, "Empty query");
    if (sql.includes(";")) throw new HttpError(400, "Only a single statement is allowed");
    if (!/^(select|with)\b/i.test(sql)) throw new HttpError(400, "Only SELECT queries are allowed");
    if (WRITE_KEYWORDS.test(sql)) throw new HttpError(400, "Only read-only queries are allowed");
    return sql;
}

// Table names referenced after FROM/JOIN. CTE names (WITH x AS / , x AS) are collected separately so
// they aren't mistaken for physical tables.
export function extractTables(sql: string): { tables: string[]; ctes: string[] } {
    const tables: string[] = [];
    const ctes: string[] = [];
    const lower = sql.toLowerCase();

    const tableRe = /\b(?:from|join)\s+([a-z_][\w]*)/gi;
    let m: RegExpExecArray | null;
    while ((m = tableRe.exec(lower)) !== null) tables.push(m[1]);

    const cteRe = /\b([a-z_][\w]*)\s+as\s*\(/gi;
    while ((m = cteRe.exec(lower)) !== null) ctes.push(m[1]);

    return { tables: [...new Set(tables)], ctes: [...new Set(ctes)] };
}

// Every referenced table must be one of the project's physical tables (or a CTE defined in the
// query). Closes cross-tenant reads (users, role_management, dwh_*, other projects' d_* tables).
export function assertTablesAllowed(sql: string, allowedTables: string[]): void {
    const allowed = new Set(allowedTables.map((t) => t.toLowerCase()));
    const { tables, ctes } = extractTables(sql);
    const cteSet = new Set(ctes);
    for (const t of tables) {
        if (!allowed.has(t) && !cteSet.has(t)) {
            throw new HttpError(403, `Query references table "${t}" which is not in this project`);
        }
    }
}

// Cap rows by wrapping the validated query. Safe in both SQLite and Postgres.
export function wrapWithLimit(sql: string, limit = 1000): string {
    return `SELECT * FROM (${sql}) AS _scoped LIMIT ${limit}`;
}
