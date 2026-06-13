// Types mirroring the schema-centric DWH catalog. Entities belong to a SCHEMA; many projects share
// a schema. Booleans arrive as 0/1 (D1) or true/false (Postgres) — treat as truthy.

export type DwhDataType =
    | "text"
    | "integer"
    | "real"
    | "boolean"
    | "date"
    | "datetime"
    | "reference";

export interface DwhColumn {
    id: number;
    entity_id: number;
    name: string;
    display_name: string | null;
    data_type: DwhDataType;
    is_nullable: boolean | number;
    is_unique: boolean | number;
    default_value: string | null;
    position: number;
    ref_entity_id: number | null;
    on_delete: string | null;
    is_system: boolean | number;
}

export interface DwhEntity {
    id: number;
    schema_id: number;
    name: string;
    display_name: string | null;
    physical_table: string;
    project_column: string | null;
    is_managed: boolean | number;
    created_at: string;
    columns: DwhColumn[];
}

export interface DwhSchema {
    id: number;
    name: string;
    canWrite?: boolean;
}

export interface ImpactResult {
    destructive: boolean;
    affectedRows: number;
    affectedProjects?: number;
    reason: string;
}

export type DwhRow = Record<string, any>;
