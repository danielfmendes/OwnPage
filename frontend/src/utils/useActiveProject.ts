// The active project is the one selected in the global project picker (Navbar → ProjectDialog),
// stored in useRoleStore.selectedRoles. New DWH pages read it from here instead of parsing the URL
// (the URL carries the app's filter syntax, e.g. project_id=$eq.2, not a plain id).

import { useRoleStore } from "@/utils/roleManagementState";

export function useActiveProject() {
    const selectedRoles = useRoleStore((s) => s.selectedRoles);
    const first = selectedRoles[0];
    return {
        projectId: (first?.project_id as number | undefined) ?? undefined,
        projectName: (first?.project_name as string | undefined) ?? undefined,
        count: selectedRoles.length,
    };
}
