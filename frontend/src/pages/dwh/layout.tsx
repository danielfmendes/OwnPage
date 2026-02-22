import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import AuthToken from "@/utils/authtoken";
import { useNotification } from "@/components/helpers/NotificationProvider";
import { useUserStore } from "@/utils/userstate";
import { useRoleStore } from "@/utils/roleManagementState";
import {
    RoleManagementsService,
    UsersService,
    type RoleManagementListResponse,
} from "@/models/api";
import apiUrl, { handleLogOut } from "@/utils/helpers";
import { OpenAPI } from "@/models/api/core/OpenAPI";
import FilterManager from "@/utils/filtermanager";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useDataTableStore } from "@/models/datatable/dataTableStore";

export default function DWHLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const hideSidebar = ['/dwh/login', '/dwh/register'].includes(location.pathname);
    const hasDataTable = ['/dwh/orders', '/dwh/customers', '/dwh/warehouse', '/dwh/partsstorage', '/dwh/rolemanagement'].includes(location.pathname);
    const { addNotification } = useNotification();
    const token = AuthToken.getAuthToken();
    const filterManager = new FilterManager();

    const setUser = useUserStore((state) => state.setUser);
    const setIsLoadingUser = useUserStore((state) => state.setIsLoading);
    const roles = useRoleStore((state) => state.roles);
    const setRoles = useRoleStore((state) => state.setRoles);
    const setIsLoadingRole = useRoleStore((state) => state.setIsLoading);
    const selectedRoles = useRoleStore((state) => state.selectedRoles);
    const setSelectedRoles = useRoleStore((state) => state.setSelectedRoles);
    const { toQueryParams, fromQueryParams, filterManager: globalFilterManager } = useDataTableStore();

    useEffect(() => {
        OpenAPI.BASE = apiUrl;
    }, []);

    useEffect(() => {
        if (token) OpenAPI.TOKEN = token;
    }, [token]);

    useEffect(() => {
        fromQueryParams(new URLSearchParams(location.search));
    }, [location.search]);

    useEffect(() => {
        if (!roles.length) return;

        // Parse project_id manually since FilterManager.fromQueryParams purposely drops it to prevent infinite loops
        const searchParams = new URL(window.location.href).searchParams;
        const filterStr = searchParams.get("filter") || "";
        let projectIds: string[] = [];

        const inMatch = filterStr.match(/project_id:\$in\.([\d|]+)/);
        if (inMatch) {
            projectIds = inMatch[1].split("|");
        } else {
            const eqMatch = filterStr.match(/project_id:\$eq\.(\d+)/);
            if (eqMatch) {
                projectIds = [eqMatch[1]];
            }
        }

        if (projectIds.length > 0) {
            const newSelectedRoles = roles.filter(role =>
                projectIds.includes(role.project_id?.toString() || "")
            );

            // Only update if it actually changed to prevent loops
            const currentSelectedRefs = selectedRoles.map(r => r.project_id).sort().join(",");
            const newSelectedRefs = newSelectedRoles.map(r => r.project_id).sort().join(",");

            if (currentSelectedRefs !== newSelectedRefs) {
                setSelectedRoles(newSelectedRoles);
            }
        }
    }, [roles, location.search]);

    // Updates url if project filter changes
    useEffect(() => {
        if (roles.length > 0) {
            const queryParams = hasDataTable ? toQueryParams() : globalFilterManager.getFilterStringWithProjectIds(true);
            const newSearch = `?${queryParams.toString()}`;

            if (location.search !== newSearch) {
                navigate(newSearch, { replace: true });
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
            <Outlet />
        </div>
    );
}
