import AuthToken from "@/utils/authtoken";
import {useUserStore} from "@/utils/userstate";
import type {NavigateFunction} from "react-router-dom";
import {useRoleStore} from "@/utils/rolemananagemetstate";
import type {NotificationType} from "@/components/helpers/Notification";
import type {RoleManagementWithName} from "@/models/api";

export const handleLogOut = (
    navigate: NavigateFunction,
    addNotification: (message: string, type: NotificationType, duration?: number) => void
) => {
    AuthToken.removeAuthToken();
    useUserStore.getState().clearUser();
    useUserStore.getState().setIsLoading(false);
    useRoleStore.getState().clearRoles();
    useRoleStore.getState().setIsLoading(false);

    navigate("/dwh/login");
    addNotification(`Erfolgreich ausgeloggt`, "success");
};

export const isRoleUserForProject = (projectId: number, role: string = "user") => {
    const roles: RoleManagementWithName[] = useRoleStore((state) => state.roles);
    const roleForProject = roles.find(role => role.project_id === projectId);
    return roleForProject?.role === role;
}

const apiUrl = import.meta.env.VITE_API_ENV || "http://localhost:8080";
export default apiUrl;