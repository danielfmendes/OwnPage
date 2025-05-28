"use client";
import React, {useEffect} from "react";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import {jwtDecode} from "jwt-decode";
import AuthToken from "@/utils/authtoken";
import {useNotification} from "@/components/helpers/NotificationProvider";
import {useUserStore} from "@/utils/userstate";
import {useRoleStore} from "@/utils/rolemananagemetstate";
import {RoleManagementsService, RoleManagementWithName, UsersService} from "@/models/api";
import {handleLogOut} from "@/utils/helpers";
import {usePathname, useRouter} from "next/navigation";
import Language from "@/utils/language";
import {useTranslation} from "react-i18next";
import {OpenAPI} from "@/models/api/core/OpenAPI";
import FilterManager from "@/utils/filtermanager";

export default function DemoLayout({children}: { children: React.ReactNode }) {
    const pathname = usePathname();
    const hideSidebar = ['/dwh/login', '/dwh/register'].includes(pathname);

    // Early rendering for login/register
    if (hideSidebar) return <>{children}</>;

    const {addNotification} = useNotification();
    const token = AuthToken.getAuthToken();
    const filterManager = new FilterManager();
    const router = useRouter();
    const setUser = useUserStore((state) => state.setUser);
    const setIsLoadingUser = useUserStore((state) => state.setIsLoading);
    const setRoles = useRoleStore((state) => state.setRoles);
    const setIsLoadingRole = useRoleStore((state) => state.setIsLoading);
    const setSelectedRoles = useRoleStore((state) => state.setSelectedRoles);
    const roles: RoleManagementWithName[] = useRoleStore((state) => state.roles);
    const {i18n} = useTranslation();

    // Set up API token
    useEffect(() => {
        if (token) {
            OpenAPI.TOKEN = token
        }
    }, [token]);

    useEffect(() => {
        const savedLang = Language.getLanguage();
        if (savedLang && i18n.language !== savedLang) {
            i18n.changeLanguage(savedLang);
        }
    }, [i18n]);

    useEffect(() => {
        if (!token) {
            handleLogOut(router, addNotification);
            return;
        }

        try {
            const decoded = jwtDecode(token);
            if (decoded.sub) {
                setIsLoadingUser(true);
                filterManager.addFilter("email", [decoded.sub]);
                UsersService.getUserInfo(filterManager.getFilterString())
                    .then((data) => setUser(data[0]))
                    .catch(err => addNotification(`Failed to load user data${err?.message ? `: ${err.message}` : ""}`, "error"))
                    .finally(() => setIsLoadingUser(false));
            }
            setIsLoadingRole(true);
            RoleManagementsService.getRoleManagements()
                .then((roles: RoleManagementWithName[]) => {
                    setRoles(roles || []);
                })
                .catch(err => addNotification(`Failed to load role management${err?.message ? `: ${err.message}` : ""}`, "error"))
                .finally(() => setIsLoadingRole(false));
        } catch (err) {
            addNotification(`Invalid or expired token: ${err}`, "error");
            setIsLoadingUser(false);
            setIsLoadingRole(false);
        }
    }, [token, setUser]);

    // Hier wird die URL-Logik für die Auswahl von Projekten hinzugefügt
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const projectIdsFromUrl = urlParams.get("project_id");

        if (projectIdsFromUrl) {
            const selectedIds = projectIdsFromUrl.split("|").map((id) => parseInt(id, 10));

            const selectedProjects = roles.filter((project) =>
                selectedIds.includes(project.project_id)
            );
            setSelectedRoles(selectedProjects);
        }
    }, [roles, setSelectedRoles]);

    return <AdminPanelLayout>{children}</AdminPanelLayout>;
}
