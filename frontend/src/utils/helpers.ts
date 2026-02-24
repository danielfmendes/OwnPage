import { useUserStore } from "@/utils/userstate";
import type { NavigateFunction } from "react-router-dom";
import { useRoleStore } from "@/utils/roleManagementState";
import type { NotificationType } from "@/components/helpers/Notification";
import type { RoleManagementWithName } from "@/models/api";

export const handleLogOut = async (
    navigate: NavigateFunction,
    addNotification: (message: string, type: NotificationType, duration?: number) => void
) => {
    try {
        await fetch(`${apiUrl}/dwh/auth/logout`, { method: "POST", credentials: "include" });
    } catch (e) {
        // Continue with local logout even if server request fails
    }

    useUserStore.getState().clearUser();
    useUserStore.getState().setIsLoading(false);
    useRoleStore.getState().clearRoles();
    useRoleStore.getState().setIsLoading(false);

    // Give a tiny delay strictly for state flush if needed
    setTimeout(() => {
        navigate("/dwh/login");
        addNotification("Successfully logged out.", "success");
    }, 50);
};

export const isRoleUserForProject = (projectId: number, role: string = "user") => {
    const roles: RoleManagementWithName[] = useRoleStore((state) => state.roles);
    const roleForProject = roles.find(role => role.project_id === projectId);
    return roleForProject?.role === role;
}

const apiUrl = import.meta.env.VITE_API_ENV || "http://localhost:8080";
export default apiUrl;