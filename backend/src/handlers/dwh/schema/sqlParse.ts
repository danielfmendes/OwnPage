// Parse a CONSTRAINED `CREATE TABLE` subset into entity/column specs for schema creation. We never
// execute the user's SQL — we read structure from it and generate our own tables. Supported per
// column: a name, a type from a known set, optional NOT NULL / UNIQUE / PRIMARY KEY, and
// `REFERENCES other(id)` (→ a reference column). Unsupported syntax raises a clear error.

import { HttpError } from "../../../utils/auth";
import { DataType } from "./ddl";

export interface ParsedColumn {
    name: string;
    data_type: DataType;
    is_nullable: boolean;
    is_unique: boolean;
    ref_table?: string;
}
export interface ParsedEntity {
    name: string;
    columns: ParsedColumn[];
}

function mapSqlType(raw: string): DataType {
    const t = raw.toLowerCase().replace(/\(.*\)/, "").trim();
    if (/(varchar|char|text|string|uuid)/.test(t)) return "text";
    if (/(bigint|smallint|integer|int|serial)/.test(t)) return "integer";
    if (/(real|float|double|numeric|decimal|money)/.test(t)) return "real";
    if (/(boolean|bool)/.test(t)) return "boolean";
    if (/timestamp|datetime/.test(t)) return "datetime";
    if (/date/.test(t)) return "date";
    throw new HttpError(400, `Unsupported column type "${raw}"`);
}

// Split a column-list body on top-level commas (ignoring commas inside parentheses like DECIMAL(10,2)).
function splitTopLevel(body: string): string[] {
    const parts: string[] = [];
    let depth = 0;
    let cur = "";
    for (const ch of body) {
        if (ch === "(") depth++;
        else if (ch === ")") depth--;
        if (ch === "," && depth === 0) { parts.push(cur); cur = ""; }
        else cur += ch;
    }
    if (cur.trim()) parts.push(cur);
    return parts;
}

const IDENT = /^[a-z][a-z0-9_]*$/;

function parseColumn(def: string): ParsedColumn | null {
    const trimmed = def.trim().replace(/\s+/g, " ");
    if (!trimmed) return null;
    // Skip table-level constraints (PRIMARY KEY (...), FOREIGN KEY ..., CONSTRAINT ...).
    if (/^(primary\s+key|foreign\s+key|constraint|unique\s*\()/i.test(trimmed)) return null;

    const tokens = trimmed.split(" ");
    const name = tokens[0].toLowerCase().replace(/["'`]/g, "");
    if (!IDENT.test(name)) throw new HttpError(400, `Invalid column name "${tokens[0]}"`);
    // id / project_id are added automatically — ignore if the user declares them.
    if (name === "id" || name === "project_id") return null;
    if (!tokens[1]) throw new HttpError(400, `Column "${name}" is missing a type`);

    const upper = trimmed.toUpperCase();
    const refMatch = trimmed.match(/references\s+([a-z_][\w]*)\s*\(/i);
    const data_type: DataType = refMatch ? "reference" : mapSqlType(tokens[1]);

    return {
        name,
        data_type,
        is_nullable: !/NOT\s+NULL/.test(upper) && !/PRIMARY\s+KEY/.test(upper),
        is_unique: /\bUNIQUE\b/.test(upper),
        ref_table: refMatch ? refMatch[1].toLowerCase() : undefined,
    };
}

export function parseCreateTables(sql: string): ParsedEntity[] {
    const cleaned = sql.replace(/--[^\n]*/g, " ").replace(/\/\*[\s\S]*?\*\//g, " ");
    const stmts = cleaned.split(";").map((s) => s.trim()).filter(Boolean);
    if (stmts.length === 0) throw new HttpError(400, "No CREATE TABLE statements found");

    const entities: ParsedEntity[] = [];
    for (const stmt of stmts) {
        const m = stmt.match(/create\s+table\s+(?:if\s+not\s+exists\s+)?["'`]?([a-z_][\w]*)["'`]?\s*\(([\s\S]*)\)\s*$/i);
        if (!m) throw new HttpError(400, `Only CREATE TABLE statements are supported (got: "${stmt.slice(0, 40)}…")`);
        const tableName = m[1].toLowerCase();
        if (!IDENT.test(tableName)) throw new HttpError(400, `Invalid table name "${m[1]}"`);
        const columns = splitTopLevel(m[2]).map(parseColumn).filter((c): c is ParsedColumn => c !== null);
        if (columns.length === 0) throw new HttpError(400, `Table "${tableName}" has no usable columns`);
        entities.push({ name: tableName, columns });
    }
    return entities;
}
