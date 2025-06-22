import {useEffect} from "react";
import {jwtDecode} from "jwt-decode";
import AuthToken from "@/utils/authtoken";
import {useNotification} from "@/components/helpers/NotificationProvider";
import {useUserStore} from "@/utils/userstate";
import {useRoleStore} from "@/utils/rolemananagemetstate";
import {
    RoleManagementsService,
    UsersService,
    type RoleManagementListResponse,
} from "@/models/api";
import apiUrl, {handleLogOut} from "@/utils/helpers";
import Language from "@/utils/language";
import {useTranslation} from "react-i18next";
import {OpenAPI} from "@/models/api/core/OpenAPI";
import FilterManager from "@/utils/filtermanager";
import {useNavigate, useLocation, Outlet} from "react-router-dom";
import {useDataTableStore} from "@/models/datatable/dataTableStore.ts";

export default function DWHLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const hideSidebar = ['/dwh/login', '/dwh/register'].includes(location.pathname);
    const hasDataTable = ['/dwh/orders', '/dwh/customers', '/dwh/warehouse', '/dwh/partsstorage', '/dwh/rolemanagement'].includes(location.pathname);
    const {addNotification} = useNotification();
    const token = AuthToken.getAuthToken();
    const filterManager = new FilterManager();

    const setUser = useUserStore((state) => state.setUser);
    const setIsLoadingUser = useUserStore((state) => state.setIsLoading);
    const roles = useRoleStore((state) => state.roles);
    const setRoles = useRoleStore((state) => state.setRoles);
    const setIsLoadingRole = useRoleStore((state) => state.setIsLoading);
    const selectedRoles = useRoleStore((state) => state.selectedRoles);
    const setSelectedRoles = useRoleStore((state) => state.setSelectedRoles);
    const {i18n} = useTranslation();
    const {toQueryParams, fromQueryParams, filterManager: globalFilterManager} = useDataTableStore();

    useEffect(() => {
        OpenAPI.BASE = apiUrl;
    }, []);

    useEffect(() => {
        if (token) OpenAPI.TOKEN = token;
    }, [token]);

    useEffect(() => {
        const savedLang = Language.getLanguage();
        if (savedLang && i18n.language !== savedLang) {
            i18n.changeLanguage(savedLang);
        }
    }, [i18n]);

    useEffect(() => {
        fromQueryParams(new URLSearchParams(location.search));
    }, [location.search]);

    // Storer befüllen
    useEffect(() => {
        const filters = globalFilterManager.getFilters();
        const projectIds = filters.project_id?.values.map(String) || [];

        if (roles.length !== 0 && projectIds.length > 0) {
            const selectedRoles = roles.filter(role =>
                projectIds.includes(role.project_id?.toString())
            );
            setSelectedRoles(selectedRoles);
        }
    }, [roles, JSON.stringify(globalFilterManager.getFilters().project_id?.values)]);

    // Updates url if project filter changes
    useEffect(() => {
        if (roles.length > 0) {
            const queryParams = hasDataTable ? toQueryParams() : globalFilterManager.getFilterStringWithProjectIds(true);
            const newSearch = `?${queryParams.toString()}`;

            if (location.search !== newSearch) {
                navigate(newSearch, {replace: true});
            }
        }
    }, [roles, selectedRoles]);

    useEffect(() => {
        if (!token) {
            if (!hideSidebar) {
                handleLogOut(navigate, addNotification);
            }
            return;
        }

        try {
            const decoded = jwtDecode(token);
            if (decoded.sub) {
                setIsLoadingUser(true);
                filterManager.addFilter("email", [decoded.sub]);

                UsersService.getUserInfo(filterManager.getFilterString())
                    .then((data) => setUser(data[0]))
                    .catch((err) =>
                        addNotification(
                            `Failed to load user data${err?.message ? `: ${err.message}` : ""}`,
                            "error"
                        )
                    )
                    .finally(() => setIsLoadingUser(false));
            }

            setIsLoadingRole(true);
            RoleManagementsService.getRoleManagements()
                .then((roles) => {
                    const list = roles as RoleManagementListResponse;
                    setRoles(list.items || []);
                })
                .catch((err) =>
                    addNotification(
                        `Failed to load role management${err?.message ? `: ${err.message}` : ""}`,
                        "error"
                    )
                )
                .finally(() => setIsLoadingRole(false));
        } catch (err) {
            addNotification(`Invalid or expired token: ${err}`, "error");
            setIsLoadingUser(false);
            setIsLoadingRole(false);
        }
    }, [token, setUser]);

    return (
        <div>
            <Outlet/>
        </div>
    );
}
