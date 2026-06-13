// Read helpers over the DWH catalog (dwh_entities / dwh_columns). No writes here — entity/column/
// relationship mutations live in entities.ts / columns.ts / relationships.ts. Booleans come back as
// 0/1 on D1 and true/false on Postgres; callers treat them as truthy.

import { Env } from "../../../types";
import { DataType } from "./ddl";

export interface EntityRow {
    id: number;
    project_id: number;
    name: string;
    display_name: string | null;
    physical_table: string;
    project_column: string | null;
    is_managed: number | boolean;
    created_at: string;
}

export interface ColumnRow {
    id: number;
    entity_id: number;
    name: string;
    display_name: string | null;
    data_type: DataType;
    is_nullable: number | boolean;
    is_unique: number | boolean;
    default_value: string | null;
    position: number;
    ref_entity_id: number | null;
    on_delete: string | null;
    is_system: number | boolean;
}

export async function listEntities(env: Env, projectId: number): Promise<EntityRow[]> {
    const { results } = await env.DB.prepare(
        "SELECT * FROM dwh_entities WHERE project_id = ? ORDER BY name"
    ).bind(projectId).all<EntityRow>();
    return results;
}

export async function listEntitiesForProjects(env: Env, projectIds: number[]): Promise<EntityRow[]> {
    if (projectIds.length === 0) return [];
    const placeholders = projectIds.map(() => "?").join(", ");
    const { results } = await env.DB.prepare(
        `SELECT * FROM dwh_entities WHERE project_id IN (${placeholders}) ORDER BY project_id, name`
    ).bind(...projectIds).all<EntityRow>();
    return results;
}

export async function getEntityById(env: Env, id: number): Promise<EntityRow | null> {
    return await env.DB.prepare("SELECT * FROM dwh_entities WHERE id = ?").bind(id).first<EntityRow>();
}

export async function getEntityByName(env: Env, projectId: number, name: string): Promise<EntityRow | null> {
    return await env.DB.prepare(
        "SELECT * FROM dwh_entities WHERE project_id = ? AND name = ?"
    ).bind(projectId, name).first<EntityRow>();
}

export async function getColumns(env: Env, entityId: number): Promise<ColumnRow[]> {
    const { results } = await env.DB.prepare(
        "SELECT * FROM dwh_columns WHERE entity_id = ? ORDER BY position, id"
    ).bind(entityId).all<ColumnRow>();
    return results;
}

// Reference columns (in any entity) that point AT the given entity — i.e. its children, used for
// app-level cascade/child-exists checks (we don't rely on DB-level FK enforcement on D1).
export async function referencesTo(
    env: Env,
    entityId: number,
): Promise<Array<{ column: ColumnRow; entity: EntityRow }>> {
    const { results } = await env.DB.prepare(
        `SELECT c.*, e.physical_table AS _e_physical_table, e.project_id AS _e_project_id,
                e.name AS _e_name, e.id AS _e_id
         FROM dwh_columns c
                  JOIN dwh_entities e ON c.entity_id = e.id
         WHERE c.ref_entity_id = ?`
    ).bind(entityId).all<any>();
    return results.map((r) => ({
        column: r as ColumnRow,
        entity: {
            id: r._e_id,
            project_id: r._e_project_id,
            name: r._e_name,
            physical_table: r._e_physical_table,
        } as EntityRow,
    }));
}

// Physical table names a project owns — the allowlist for the sandboxed SQL console.
export async function physicalTablesForProject(env: Env, projectId: number): Promise<string[]> {
    const { results } = await env.DB.prepare(
        "SELECT physical_table FROM dwh_entities WHERE project_id = ?"
    ).bind(projectId).all<{ physical_table: string }>();
    return results.map((r) => r.physical_table);
}
