// Hand-written client for the generic, catalog-driven DWH endpoints. Uses the same base URL and
// cookie credentials as the generated OpenAPI client, but the dynamic /dwh endpoints don't fit a
// static per-entity spec, so they live here instead of being code-generated.

import { OpenAPI } from "@/models/api/core/OpenAPI";
import type { DwhColumn, DwhDataType, DwhEntity, DwhRow } from "./types";

function apiBase(): string {
    return `${OpenAPI.BASE}/api/dwh`;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${apiBase()}${path}`, {
        method,
        credentials: "include",
        headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        const err = new Error(text || res.statusText) as Error & { status?: number };
        err.status = res.status;
        throw err;
    }
    const text = await res.text();
    return (text ? JSON.parse(text) : null) as T;
}

export interface DataPage {
    items: DwhRow[];
    totalCount: number;
}

export interface NewColumn {
    name: string;
    display_name?: string;
    data_type: DwhDataType;
    is_nullable?: boolean;
    is_unique?: boolean;
    default_value?: string | null;
    ref_entity_id?: number | null;
    on_delete?: string | null;
}

export const dwhClient = {
    // --- schema ---
    listEntities: (projectId: number) =>
        request<DwhEntity[]>("GET", `/entities?project_id=${projectId}`),
    createEntity: (body: { project_id: number; name: string; display_name?: string; columns?: NewColumn[] }) =>
        request<DwhEntity>("POST", "/entities", body),
    deleteEntity: (id: number) => request<void>("DELETE", `/entities?id=${id}`),
    addColumn: (body: NewColumn & { entity_id: number }) => request<void>("POST", "/columns", body),
    deleteColumn: (id: number) => request<void>("DELETE", `/columns?id=${id}`),
    createRelationship: (body: { from_entity_id: number; to_entity_id: number; column_name?: string; on_delete?: string }) =>
        request<void>("POST", "/relationships", body),

    // --- data ---
    getData: (entity: string, projectId: number, filter?: string, page = 1, pageSize = 25, orderBy?: string) => {
        const p = new URLSearchParams({ project_id: String(projectId), page: String(page), pageSize: String(pageSize) });
        if (filter) p.set("filter", filter);
        if (orderBy) p.set("orderBy", orderBy);
        return request<DataPage>("GET", `/data/${entity}?${p.toString()}`);
    },
    createRow: (entity: string, projectId: number, body: DwhRow) =>
        request<void>("POST", `/data/${entity}?project_id=${projectId}`, body),
    updateRow: (entity: string, projectId: number, body: DwhRow) =>
        request<void>("PUT", `/data/${entity}?project_id=${projectId}`, body),
    deleteRow: (entity: string, projectId: number, id: number | string, cascade = false) =>
        request<void>("DELETE", `/data/${entity}?project_id=${projectId}&id=${id}${cascade ? "&cascade=true" : ""}`),

    // --- sql console + aggregation (wired in later slices, client ready now) ---
    runSql: (projectId: number, sql: string) =>
        request<{ columns: string[]; rows: DwhRow[] }>("POST", "/sql", { projectId, sql }),
    getDdl: (entityId: number) => request<{ ddl: string }>("GET", `/entities/ddl?id=${entityId}`),
    aggregate: (entity: string, projectId: number, opts: { groupBy?: string; measure?: string; fn?: string }) => {
        const p = new URLSearchParams({ project_id: String(projectId) });
        if (opts.groupBy) p.set("groupBy", opts.groupBy);
        if (opts.measure) p.set("measure", opts.measure);
        if (opts.fn) p.set("fn", opts.fn);
        return request<Array<{ value: string; total: number }>>("GET", `/aggregate/${entity}?${p.toString()}`);
    },
};

// Helper: is a column truthy-boolean flag set?
export const truthy = (v: boolean | number | null | undefined): boolean => v === true || v === 1;

// Non-system, user-editable columns.
export const editableColumns = (cols: DwhColumn[]): DwhColumn[] => cols.filter((c) => !truthy(c.is_system));
