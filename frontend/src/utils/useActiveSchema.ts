// Derive the active SCHEMA context from the global project picker (useRoleStore.selectedRoles).
// All selected projects are expected to share one schema (the picker enforces this); we take that
// schema, the selected project ids (compiled reads), and a single writeProjectId (only when exactly
// one project is selected — writes need one target).

import { useRoleStore } from "@/utils/roleManagementState";

interface RoleWithSchema {
    project_id?: number;
    role?: string;
    schema_id?: number | null;
    schema_name?: string | null;
}

export function useActiveSchema() {
    const selectedRoles = useRoleStore((s) => s.selectedRoles) as RoleWithSchema[];

    const withSchema = selectedRoles.filter((r) => r.schema_id != null);
    const schemaId = withSchema.length ? Number(withSchema[0].schema_id) : undefined;
    const sameSchema = withSchema.filter((r) => Number(r.schema_id) === schemaId);

    const projectIds = sameSchema.map((r) => r.project_id as number).filter((n) => n != null);
    const writeProjectId = projectIds.length === 1 ? projectIds[0] : undefined;
    const canWrite = sameSchema.some((r) => r.role === "admin" || r.role === "creator");
    const schemaName = schemaId ? (withSchema[0].schema_name ?? undefined) : undefined;

    return { schemaId, schemaName, projectIds, writeProjectId, canWrite, selectedCount: selectedRoles.length };
}
