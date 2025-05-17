"use client";
import React, {useEffect} from "react";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import {jwtDecode} from "jwt-decode";
import {fetchWithToken} from "@/utils/url";
import AuthToken from "@/utils/authtoken";
import {useNotification} from "@/components/helpers/NotificationProvider";
import {useUserStore} from "@/utils/userstate";
import {useRoleStore} from "@/utils/rolemananagemetstate";
import {RoleManagementWithName} from "@/types/custom";
import {handleLogOut} from "@/utils/helpers";
import {useRouter} from "next/navigation";
import Language from "@/utils/language";
import {useTranslation} from "react-i18next";

export default function DemoLayout({children}: { children: React.ReactNode }) {
    const {addNotification} = useNotification();
    const token = AuthToken.getAuthToken();
    const router = useRouter();
    const setUser = useUserStore((state) => state.setUser);
    const setIsLoadingUser = useUserStore((state) => state.setIsLoading);
    const setRoles = useRoleStore((state) => state.setRoles);
    const setIsLoadingRole = useRoleStore((state) => state.setIsLoading);
    const setSelectedRoles = useRoleStore((state) => state.setSelectedRoles);
    const roles: RoleManagementWithName[] = useRoleStore((state) => state.roles);
    const {i18n} = useTranslation();

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
                fetchWithToken(`/user?email=${decoded.sub}`, true)
                    .then((data) => setUser(data[0]))
                    .catch(err => addNotification(`Failed to load user data${err?.message ? `: ${err.message}` : ""}`, "error"))
                    .finally(() => setIsLoadingUser(false));
            }
            setIsLoadingRole(true);
            fetchWithToken(`/rolemanagements`, true)
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
