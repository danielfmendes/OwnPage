import { create } from "zustand";
import { RoleManagementWithName } from "@/types/custom";

interface RoleManagementState {
    roles: RoleManagementWithName[];
    isLoading: boolean;
    setRoles: (roles: RoleManagementWithName[]) => void;
    clearRoles: () => void;
    setIsLoading: (isLoading: boolean) => void;
}

export const useRoleStore = create<RoleManagementState>((set) => ({
    roles: [],
    isLoading: true,
    setRoles: (roles) => set({ roles }),
    clearRoles: () => set({ roles: [] }),
    setIsLoading: (isLoading) => set({ isLoading }),
}));
