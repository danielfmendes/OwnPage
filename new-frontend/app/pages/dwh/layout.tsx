import React, {useEffect} from "react";
import {jwtDecode} from "jwt-decode";
import AuthToken from "@/utils/authtoken";
import {useNotification} from "@/components/helpers/NotificationProvider";
import {useUserStore} from "@/utils/userstate";
import {useRoleStore} from "@/utils/rolemananagemetstate";
import {
    RoleManagementsService,
    UsersService,
    type RoleManagementListResponse,
    type RoleManagementWithName
} from "@/models/api";
import apiUrl, {handleLogOut} from "@/utils/helpers";
import Language from "@/utils/language";
import {useTranslation} from "react-i18next";
import {OpenAPI} from "@/models/api/core/OpenAPI";
import FilterManager from "@/utils/filtermanager";
import {useNavigate, useLocation, Outlet} from "react-router-dom";
import {triggerReload} from "@/models/datatable/reloadState";

export default function DWHLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const hideSidebar = ['/dwh/login', '/dwh/register'].includes(location.pathname);
    const {addNotification} = useNotification();
    const token = AuthToken.getAuthToken();
    const filterManager = new FilterManager();

    const setUser = useUserStore((state) => state.setUser);
    const setIsLoadingUser = useUserStore((state) => state.setIsLoading);
    const setRoles = useRoleStore((state) => state.setRoles);
    const setIsLoadingRole = useRoleStore((state) => state.setIsLoading);
    const selectedRoles = useRoleStore((state) => state.selectedRoles);
    const setSelectedRoles = useRoleStore((state) => state.setSelectedRoles);
    const roles: RoleManagementWithName[] = useRoleStore((state) => state.roles);
    const {i18n} = useTranslation();

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
        triggerReload();
    }, [selectedRoles]);

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

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const projectIds = urlParams.get("project_id");

        if (projectIds) {
            const selectedIds = projectIds.split("|").map((id) => parseInt(id, 10));
            const selectedProjects = roles.filter((p) =>
                selectedIds.includes(p.project_id)
            );
            setSelectedRoles(selectedProjects);
        }
    }, [roles, setSelectedRoles]);

    return (
        <div>
            <Outlet/>
        </div>
    );
}
