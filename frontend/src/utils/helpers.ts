import { useUserStore } from "@/utils/userstate";
import type { NavigateFunction } from "react-router-dom";
import { useRoleStore } from "@/utils/roleManagementState";
import type { RoleManagementWithName } from "@/models/api";
import type { NotificationType } from "@/components/helpers/Notification";

export const handleLogOut = async (
    navigate: NavigateFunction,
    addNotification: (message: string, type: NotificationType, duration?: number) => void
) => {
    try {
        await fetch(`${apiUrl}/dwh/auth/logout`, { method: "POST", credentials: "include" });
    } catch {
        // Continue with local logout even if server request fails
    }

    useUserStore.getState().clearUser();
    useUserStore.getState().setIsLoading(false);
    useRoleStore.getState().clearRoles();
    useRoleStore.getState().setIsLoading(false);

    // Give a tiny delay strictly for state flush if needed
    setTimeout(() => {
        navigate("/login");
        addNotification("Successfully logged out.", "success");
    }, 50);
};

// Reads the store without subscribing, so it is safe to call from non-hook helpers.
export const isRoleUserForProject = (projectId: number, role: string = "user") => {
    const roles: RoleManagementWithName[] = useRoleStore.getState().roles;
    const roleForProject = roles.find((entry) => entry.project_id === projectId);
    return roleForProject?.role === role;
}

const apiUrl = import.meta.env.VITE_API_ENV || "http://localhost:8080";
export default apiUrl;
// Only same-site paths are accepted from ?next=, so the login page cannot redirect off-site
export const safeNext = (next: string | null, fallback: string) =>
    next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;

// Message for a caught value: Error and {message} objects show their message, anything else is stringified
export const errorMessage = (e: unknown): string => {
    const message = typeof e === "object" && e !== null && "message" in e ? e.message : undefined;
    return String(message ?? e);
};
