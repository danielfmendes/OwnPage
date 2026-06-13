// Hand-written client for the schema-centric DWH endpoints. Same base URL + cookie credentials as
// the generated OpenAPI client. Entities are addressed by schema; data reads compile across the
// selected projects (project_ids), writes target a single project.

import { OpenAPI } from "@/models/api/core/OpenAPI";
import type { DwhEntity, DwhSchema, ImpactResult, DwhRow } from "./types";

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
    data_type: string;
    is_nullable?: boolean;
    is_unique?: boolean;
    default_value?: string | null;
    ref_entity_id?: number | null;
    ref_table?: string;
    on_delete?: string | null;
}

const ids = (projectIds: number[]) => projectIds.join("|");

export const dwhClient = {
    // --- schemas & projects ---
    listSchemas: () => request<DwhSchema[]>("GET", "/schemas"),
    getSchema: (id: number) => request<DwhSchema & { entities: DwhEntity[] }>("GET", `/schemas/${id}`),
    createProject: (body: { name: string; schema_id?: number; new_schema?: { name: string; entities?: any[]; sql?: string } }) =>
        request<{ id: number; schema_id: number | null }>("POST", "/projects", body),

    // --- schema editing ---
    listEntities: (schemaId: number) => request<DwhEntity[]>("GET", `/entities?schema_id=${schemaId}`),
    createEntity: (body: { schema_id: number; name: string; display_name?: string; columns?: NewColumn[] }) =>
        request<DwhEntity>("POST", "/entities", body),
    deleteEntity: (id: number) => request<void>("DELETE", `/entities?id=${id}`),
    entityImpact: (id: number) => request<ImpactResult>("GET", `/entities/impact?id=${id}`),
    addColumn: (body: NewColumn & { entity_id: number }) => request<void>("POST", "/columns", body),
    deleteColumn: (id: number) => request<void>("DELETE", `/columns?id=${id}`),
    columnImpact: (id: number) => request<ImpactResult>("GET", `/columns/impact?id=${id}`),
    createRelationship: (body: { from_entity_id: number; to_entity_id: number; column_name?: string; on_delete?: string }) =>
        request<void>("POST", "/relationships", body),
    getDdl: (entityId: number) => request<{ ddl: string }>("GET", `/entities/ddl?id=${entityId}`),

    // --- data (compiled reads, single-project writes) ---
    getData: (entity: string, schemaId: number, projectIds: number[], filter?: string, page = 1, pageSize = 25, orderBy?: string) => {
        const p = new URLSearchParams({ schema_id: String(schemaId), project_ids: ids(projectIds), page: String(page), pageSize: String(pageSize) });
        if (filter) p.set("filter", filter);
        if (orderBy) p.set("orderBy", orderBy);
        return request<DataPage>("GET", `/data/${entity}?${p.toString()}`);
    },
    createRow: (entity: string, schemaId: number, projectId: number, body: DwhRow) =>
        request<void>("POST", `/data/${entity}?schema_id=${schemaId}&project_id=${projectId}`, body),
    updateRow: (entity: string, schemaId: number, projectId: number, body: DwhRow) =>
        request<void>("PUT", `/data/${entity}?schema_id=${schemaId}&project_id=${projectId}`, body),
    deleteRow: (entity: string, schemaId: number, id: number | string, cascade = false) =>
        request<void>("DELETE", `/data/${entity}?schema_id=${schemaId}&id=${id}${cascade ? "&cascade=true" : ""}`),

    // --- sql + aggregation + dashboard ---
    runSql: (schemaId: number, sql: string) =>
        request<{ columns: string[]; rows: DwhRow[] }>("POST", "/sql", { schemaId, sql }),
    aggregate: (entity: string, schemaId: number, projectIds: number[], opts: { groupBy?: string; measure?: string; fn?: string }) => {
        const p = new URLSearchParams({ schema_id: String(schemaId), project_ids: ids(projectIds) });
        if (opts.groupBy) p.set("groupBy", opts.groupBy);
        if (opts.measure) p.set("measure", opts.measure);
        if (opts.fn) p.set("fn", opts.fn);
        return request<Array<{ value: string; total: number }>>("GET", `/aggregate/${entity}?${p.toString()}`);
    },
    getDashboard: (schemaId: number) => request<{ config: any }>("GET", `/dashboards?schema_id=${schemaId}`),
    saveDashboard: (schemaId: number, config: unknown) => request<void>("PUT", `/dashboards?schema_id=${schemaId}`, { config }),
};

export const truthy = (v: boolean | number | null | undefined): boolean => v === true || v === 1;
export const editableColumns = <T extends { is_system: boolean | number }>(cols: T[]): T[] => cols.filter((c) => !truthy(c.is_system));
