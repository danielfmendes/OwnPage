import AuthToken from "@/utils/authtoken";
import {useUserStore} from "@/utils/userstate";
import {useRouter} from "next/navigation";
import {useRoleStore} from "@/utils/rolemananagemetstate";
import {NotificationType} from "@/components/helpers/Notification";
import {CancelablePromise, RoleManagementWithName} from "@/models/api";
import {useCallback} from "react";
import {defaultPageSize, Pagination} from "@/models/datatable/pagination";
import {Sort} from "@/models/datatable/sort";
import {ItemsLoaderOptions} from "@/models/datatable/itemsLoader";
import FilterManager from "@/utils/filtermanager";

export const handleLogOut = (
    router: ReturnType<typeof useRouter>,
    addNotification: (message: string, type: NotificationType, duration?: number) => void
) => {
    AuthToken.removeAuthToken();
    useUserStore.getState().clearUser();
    useUserStore.getState().setIsLoading(false);
    useRoleStore.getState().clearRoles();
    useRoleStore.getState().setIsLoading(false);

    router.push("/dwh/login");
    addNotification(`Erfolgreich ausgeloggt`, "success");
};

export const isRoleUserForProject = (projectId: number, role: string = "user") => {
    const roles: RoleManagementWithName[] = useRoleStore((state) => state.roles);
    const roleForProject = roles.find(role => role.project_id === projectId);
    return roleForProject?.role === role;
}

export function useRefreshData(itemsLoader: Function) {
    return useCallback(() => {
        return itemsLoader({
            pagination: new Pagination(0, defaultPageSize),
            sort: new Sort(),
        });
    }, [itemsLoader, defaultPageSize]);
}

export async function genericItemsLoader<T>(
    options: ItemsLoaderOptions,
    fetchFunction: (
        filter: string | undefined,
        pageSize: number,
        page: number,
        sort: string | undefined
    ) => CancelablePromise<any>,
    setData: (items: T[]) => void,
    setTotalCount: (count: number) => void,
): Promise<void> {
    const filterManager = new FilterManager();
    const filterString = await filterManager.getFilterStringWithProjectIds();
    const sortString = options.sort.toCallOpts().join(",");

    const result = await fetchFunction(
        filterString === "" ? undefined : filterString,
        options.pagination.itemsPerPage,
        options.pagination.page,
        sortString === "" ? undefined : sortString
    );

    setData(result.items ?? []);
    setTotalCount(result.totalCount ?? 0);
}

const apiUrl = process.env.NEXT_PUBLIC_API_ENV || "http://localhost:8080";
export default apiUrl;