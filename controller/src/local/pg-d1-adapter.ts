// Local-development only: a thin adapter that implements the slice of the Cloudflare D1
// API the Worker actually uses (`prepare().bind().all()/.first()/.run()` and `batch()`),
// backed by a node-postgres Pool. This lets the SAME Worker handlers run unchanged against a
// local Postgres on :5433, while production keeps using real D1/SQLite.
//
// It is never imported by src/index.ts (the workerd entrypoint), so it has zero effect on the
// deployed Worker — it is only wired up by src/local/server.ts.
//
// The handlers/queries are written in SQLite dialect (D1). `translate()` rewrites the few
// SQLite-isms that appear at runtime — the `date(...)` function and `?` placeholders — into
// their Postgres equivalents. All other SQL in the codebase is portable.

import type { Pool, PoolClient } from "pg";

// --- SQLite -> Postgres SQL translation -------------------------------------------------

// date('now')               -> CURRENT_DATE
// date('now', ?)            -> (CURRENT_DATE + (?)::interval)::date          [e.g. '-29 days']
// date('now', '+1 day')     -> (CURRENT_DATE + ('+1 day')::interval)::date
// date(o.order_date)        -> (o.order_date)::date
// date(col, '+1 day')       -> ((col)::date + ('+1 day')::interval)::date
const DATE_RE =
    /\bdate\s*\(\s*('now'|[A-Za-z_][\w.]*)\s*(?:,\s*('[^']*'|\?\d*|[A-Za-z_][\w.]*)\s*)?\)/gi;

function translateDates(sql: string): string {
    return sql.replace(DATE_RE, (_m, arg1: string, arg2?: string) => {
        const base = arg1.toLowerCase() === "'now'" ? "CURRENT_DATE" : `(${arg1})::date`;
        if (arg2 == null) return base;
        return `(${base} + (${arg2})::interval)::date`;
    });
}

// Convert positional `?` (and numbered `?1`) placeholders to Postgres `$1, $2, ...`,
// skipping anything inside single-quoted string literals.
function placeholdersToPg(sql: string): string {
    let out = "";
    let seq = 0;
    let inString = false;
    for (let i = 0; i < sql.length; i++) {
        const c = sql[i];
        if (inString) {
            out += c;
            if (c === "'") {
                if (sql[i + 1] === "'") { out += "'"; i++; continue; } // escaped ''
                inString = false;
            }
            continue;
        }
        if (c === "'") { inString = true; out += c; continue; }
        if (c === "?") {
            let j = i + 1;
            let num = "";
            while (j < sql.length && sql[j] >= "0" && sql[j] <= "9") { num += sql[j]; j++; }
            if (num) { out += "$" + num; i = j - 1; }
            else { seq++; out += "$" + seq; }
            continue;
        }
        out += c;
    }
    return out;
}

export function translate(sql: string): string {
    return placeholdersToPg(translateDates(sql));
}

// --- D1-shaped result helpers -----------------------------------------------------------

function meta(changes: number, lastRowId?: number | null) {
    return {
        changes,
        last_row_id: lastRowId ?? 0,
        duration: 0,
        rows_read: 0,
        rows_written: 0,
        size_after: 0,
        changed_db: changes > 0,
    };
}

// --- Prepared statement -----------------------------------------------------------------

class PgPreparedStatement {
    constructor(
        private readonly pool: Pool,
        readonly sql: string,
        readonly params: any[] = [],
    ) {}

    bind(...params: any[]): PgPreparedStatement {
        return new PgPreparedStatement(this.pool, this.sql, params);
    }

    async all<T = Record<string, any>>(): Promise<{ results: T[]; success: true; meta: any }> {
        const res = await this.pool.query(translate(this.sql), this.params);
        return { results: res.rows as T[], success: true, meta: meta(res.rowCount ?? 0) };
    }

    async first<T = any>(column?: string): Promise<T | null> {
        const res = await this.pool.query(translate(this.sql), this.params);
        const row = res.rows[0];
        if (row == null) return null;
        return (column ? row[column] : row) as T;
    }

    async raw<T = any[]>(): Promise<T[]> {
        const res = await this.pool.query({ text: translate(this.sql), values: this.params, rowMode: "array" } as any);
        return res.rows as T[];
    }

    async run(): Promise<{ success: true; results: never[]; meta: any }> {
        const isInsert = /^\s*insert\b/i.test(this.sql);
        const hasReturning = /\breturning\b/i.test(this.sql);

        // D1 exposes meta.last_row_id after INSERT (used by crud.ts when creating a project).
        // Postgres needs an explicit RETURNING; tables without an `id` column (users, role_management)
        // raise undefined_column (42703) — fall back to the plain statement for those.
        if (isInsert && !hasReturning) {
            try {
                const res = await this.pool.query(translate(this.sql) + " RETURNING id", this.params);
                return { success: true, results: [], meta: meta(res.rowCount ?? 0, res.rows[0]?.id) };
            } catch (e: any) {
                if (e?.code !== "42703") throw e;
            }
        }
        const res = await this.pool.query(translate(this.sql), this.params);
        return { success: true, results: [], meta: meta(res.rowCount ?? 0) };
    }
}

// --- Database ---------------------------------------------------------------------------

export class PgD1Database {
    constructor(private readonly pool: Pool) {}

    prepare(sql: string): PgPreparedStatement {
        return new PgPreparedStatement(this.pool, sql);
    }

    // D1 batch() runs the statements atomically; mirror that with a transaction.
    async batch<T = Record<string, any>>(
        statements: PgPreparedStatement[],
    ): Promise<{ results: T[]; success: true; meta: any }[]> {
        const client: PoolClient = await this.pool.connect();
        try {
            await client.query("BEGIN");
            const out: { results: T[]; success: true; meta: any }[] = [];
            for (const s of statements) {
                const res = await client.query(translate(s.sql), s.params);
                out.push({ results: res.rows as T[], success: true, meta: meta(res.rowCount ?? 0) });
            }
            await client.query("COMMIT");
            return out;
        } catch (e) {
            await client.query("ROLLBACK");
            throw e;
        } finally {
            client.release();
        }
    }

    async exec(sql: string): Promise<{ count: number; duration: number }> {
        const res = await this.pool.query(translate(sql));
        return { count: res.rowCount ?? 0, duration: 0 };
    }
}
