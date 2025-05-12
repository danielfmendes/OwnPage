import { create } from "zustand";
import { RoleManagementWithName } from "@/types/custom";

interface RoleManagementState {
    roles: RoleManagementWithName[];
    selectedRoles: RoleManagementWithName[];
    isLoading: boolean;
    setRoles: (roles: RoleManagementWithName[]) => void;
    clearRoles: () => void;
    setIsLoading: (isLoading: boolean) => void;
    setSelectedRoles: (selected: RoleManagementWithName[]) => void;
}

export const useRoleStore = create<RoleManagementState>((set) => ({
    roles: [],
    selectedRoles: [],
    isLoading: true,
    setRoles: (roles) => set({ roles }),
    clearRoles: () => set({ roles: [] }),
    setIsLoading: (isLoading) => set({ isLoading }),
    setSelectedRoles: (selected) => set({ selectedRoles: selected }),
}));
