import { useEffect, useRef } from "react";
// AuthToken removed, using HttpOnly cookies
import { useNotification } from "@/components/helpers/NotificationProvider";
import { useUserStore } from "@/utils/userstate";
import { useRoleStore } from "@/utils/roleManagementState";
import { SessionProvider } from "@/context/SessionProvider";
import {
    RoleManagementsService,
    type RoleManagementListResponse,
} from "@/models/api";
import apiUrl from "@/utils/helpers";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useDataTableStore } from "@/models/datatable/dataTableStore";

export default function DWHLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const hideSidebar = ['/dwh/login', '/dwh/register'].includes(location.pathname);
    const hasDataTable = ['/dwh/orders', '/dwh/customers', '/dwh/warehouse', '/dwh/partsstorage', '/dwh/rolemanagement'].includes(location.pathname);
    const { addNotification } = useNotification();

    // User State
    const { setIsLoading: setIsLoadingUser } = useUserStore();

    // Role State
    const {
        roles,
        setRoles,
        setIsLoading: setIsLoadingRole,
        selectedRoles,
        setSelectedRoles
    } = useRoleStore();

    const { toQueryParams, fromQueryParams, filterManager: globalFilterManager } = useDataTableStore();

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

    // Reconcile the persisted (localStorage) selection against freshly-loaded roles once: re-map to the
    // current role objects (so schema_name/role are up to date) and drop any project the user no longer
    // has access to. This keeps the project filter intact across reloads without an empty window.
    const reconciledRef = useRef(false);
    useEffect(() => {
        if (!roles.length || reconciledRef.current) return;
        reconciledRef.current = true;
        if (selectedRoles.length === 0) return;
        const byId = new Map(roles.map((r) => [r.project_id, r]));
        const fresh = selectedRoles
            .map((s) => byId.get(s.project_id))
            .filter((r): r is NonNullable<typeof r> => Boolean(r));
        const changed = fresh.length !== selectedRoles.length || fresh.some((r, i) => r !== selectedRoles[i]);
        if (changed) setSelectedRoles(fresh);
    }, [roles]); // eslint-disable-line react-hooks/exhaustive-deps

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
        if (hideSidebar) return;

        setIsLoadingUser(true);
        setIsLoadingRole(true);

        // Fetch user data via plain fetch since openapi client doesn't know about /auth/me yet
        fetch(`${apiUrl}/dwh/auth/me`, { method: "GET", credentials: "include" })
            .then(res => {
                if (!res.ok) throw new Error("Unauthorized");
                return res.json();
            })
            .then(user => {
                useUserStore.getState().setUser(user);
            })
            .catch(() => {
                useUserStore.getState().clearUser();
                // We don't notify here because the axios/fetch interceptor will handle redirection on 401
            })
            .finally(() => {
                setIsLoadingUser(false);
            });

        RoleManagementsService.getRoleManagements()
            .then((rolesResponse) => {
                const list = rolesResponse as RoleManagementListResponse;
                setRoles(list.items || []);
            })
            .catch((err) => {
                if (err?.status !== 401) {
                    addNotification(
                        `Failed to load role management${err?.message ? `: ${err.message}` : ""}`,
                        "error"
                    );
                }
            })
            .finally(() => {
                setIsLoadingRole(false);
            });

    }, [hideSidebar]);

    // Extract loading state
    const { isLoading: isLoadingUserStatus } = useUserStore();
    const { isLoading: isLoadingRoleStatus } = useRoleStore();

    if (!hideSidebar && (isLoadingUserStatus || isLoadingRoleStatus)) {
        return null;
    }

    return (
        <SessionProvider>
            <div>
                <Outlet />
            </div>
        </SessionProvider>
    );
}
