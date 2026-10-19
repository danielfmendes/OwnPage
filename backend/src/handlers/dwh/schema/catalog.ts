// Read helpers over the DWH catalog (dwh_schemas / dwh_entities / dwh_columns). Schema-centric:
// entities belong to a SCHEMA; many projects can share a schema. Booleans come back as 0/1 on D1 and
// true/false on Postgres; callers treat them as truthy.

import { Env } from "../../../types";
import { DataType } from "./ddl";

export interface SchemaRow {
    id: number;
    name: string;
    created_by: string | null;
    created_at: string;
}

export interface EntityRow {
    id: number;
    schema_id: number;
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

// --- schemas ---------------------------------------------------------------------------

export async function getSchemaById(env: Env, id: number): Promise<SchemaRow | null> {
    return await env.DB.prepare("SELECT * FROM dwh_schemas WHERE id = ?").bind(id).first<SchemaRow>();
}

export async function schemaIdForProject(env: Env, projectId: number): Promise<number | null> {
    const row = await env.DB.prepare("SELECT schema_id FROM projects WHERE id = ?")
        .bind(projectId).first<{ schema_id: number | null }>();
    return row?.schema_id ?? null;
}

// Project ids that use a given schema (the discriminator values that compile together).
export async function projectsForSchema(env: Env, schemaId: number): Promise<number[]> {
    const { results } = await env.DB.prepare("SELECT id FROM projects WHERE schema_id = ?")
        .bind(schemaId).all<{ id: number }>();
    return results.map((r) => r.id);
}

// --- entities / columns ----------------------------------------------------------------

export async function listEntities(env: Env, schemaId: number): Promise<EntityRow[]> {
    const { results } = await env.DB.prepare(
        "SELECT * FROM dwh_entities WHERE schema_id = ? ORDER BY name"
    ).bind(schemaId).all<EntityRow>();
    return results;
}

export async function getEntityById(env: Env, id: number): Promise<EntityRow | null> {
    return await env.DB.prepare("SELECT * FROM dwh_entities WHERE id = ?").bind(id).first<EntityRow>();
}

export async function getEntityByName(env: Env, schemaId: number, name: string): Promise<EntityRow | null> {
    return await env.DB.prepare(
        "SELECT * FROM dwh_entities WHERE schema_id = ? AND name = ?"
    ).bind(schemaId, name).first<EntityRow>();
}

export async function getColumns(env: Env, entityId: number): Promise<ColumnRow[]> {
    const { results } = await env.DB.prepare(
        "SELECT * FROM dwh_columns WHERE entity_id = ? ORDER BY position, id"
    ).bind(entityId).all<ColumnRow>();
    return results;
}

// Reference columns (in any entity of the same schema) that point AT the given entity — its children,
// used for app-level cascade/child-exists checks (D1 doesn't enforce FKs).
export async function referencesTo(
    env: Env,
    entityId: number,
): Promise<Array<{ column: ColumnRow; entity: EntityRow }>> {
    const { results } = await env.DB.prepare(
        `SELECT c.*, e.physical_table AS _e_physical_table, e.schema_id AS _e_schema_id,
                e.name AS _e_name, e.id AS _e_id
         FROM dwh_columns c
                  JOIN dwh_entities e ON c.entity_id = e.id
         WHERE c.ref_entity_id = ?`
    ).bind(entityId).all<any>();
    return results.map((r) => ({
        column: r as ColumnRow,
        entity: {
            id: r._e_id,
            schema_id: r._e_schema_id,
            name: r._e_name,
            physical_table: r._e_physical_table,
        } as EntityRow,
    }));
}

// Physical table names a schema owns — the allowlist for the sandboxed SQL console.
export async function physicalTablesForSchema(env: Env, schemaId: number): Promise<string[]> {
    const { results } = await env.DB.prepare(
        "SELECT physical_table FROM dwh_entities WHERE schema_id = ?"
    ).bind(schemaId).all<{ physical_table: string }>();
    return results.map((r) => r.physical_table);
}
