import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RoleManagementWithName } from "@/models/api";

interface RoleManagementState {
    roles: RoleManagementWithName[];
    selectedRoles: RoleManagementWithName[];
    isLoading: boolean;
    setRoles: (roles: RoleManagementWithName[]) => void;
    clearRoles: () => void;
    setIsLoading: (isLoading: boolean) => void;
    setSelectedRoles: (selected: RoleManagementWithName[]) => void;
}

// The active project selection is persisted to localStorage so it survives a page reload (cmd+R) and
// is available on the very first render — avoiding a window where schemaId/projectIds are empty and the
// dashboard fetches nothing. Only `selectedRoles` is persisted; `roles` is always re-fetched fresh.
export const useRoleStore = create<RoleManagementState>()(
    persist(
        (set) => ({
            roles: [],
            selectedRoles: [],
            isLoading: true,
            setRoles: (roles) => set({ roles }),
            clearRoles: () => set({ roles: [] }),
            setIsLoading: (isLoading) => set({ isLoading }),
            setSelectedRoles: (selected) => set({ selectedRoles: selected }),
        }),
        {
            name: "dwh-project-selection",
            partialize: (state) => ({ selectedRoles: state.selectedRoles }),
        },
    ),
);
