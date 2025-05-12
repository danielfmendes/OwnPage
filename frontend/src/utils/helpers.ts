import AuthToken from "@/utils/authtoken";
import {useUserStore} from "@/utils/userstate";
import {useRouter} from "next/navigation";
import {useRoleStore} from "@/utils/rolemananagemetstate";

export const handleLogOut = (router: ReturnType<typeof useRouter>) => {
    AuthToken.removeAuthToken();
    useUserStore.getState().clearUser();
    useUserStore.getState().setIsLoading(false);
    useRoleStore.getState().clearRoles();
    useRoleStore.getState().setIsLoading(false);
    router.push("/login/dwh");
};