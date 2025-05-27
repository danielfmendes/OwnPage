import AuthToken from "@/utils/authtoken";
import {useUserStore} from "@/utils/userstate";
import {useRouter} from "next/navigation";
import {useRoleStore} from "@/utils/rolemananagemetstate";
import {NotificationType} from "@/components/helpers/Notification";
import {RoleManagementWithName} from "@/models/api";

export const handleLogOut = (
    router: ReturnType<typeof useRouter>,
    addNotification: (message: string, type: NotificationType, duration?: number) => void
) => {
    AuthToken.removeAuthToken();
    useUserStore.getState().clearUser();
    useUserStore.getState().setIsLoading(false);
    useRoleStore.getState().clearRoles();
    useRoleStore.getState().setIsLoading(false);

    router.push("/login/dwh");
    addNotification(`Erfolgreich ausgeloggt`, "success");
};

export const isRoleUserForProject = (projectId: number, role: string = "user") => {
    const roles: RoleManagementWithName[] = useRoleStore((state) => state.roles);
    const roleForProject = roles.find(role => role.project_id === projectId);
    return roleForProject?.role === role;
}

const apiUrl = process.env.NEXT_PUBLIC_API_ENV || "http://localhost:8080";
export default apiUrl;