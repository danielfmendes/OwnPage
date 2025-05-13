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

    useEffect(() => {
        if (!token) {
            handleLogOut(router, addNotification);
            return;
        }

        try {
            const decoded = jwtDecode(token);
            if (decoded.sub) {
                setIsLoadingUser(true);
                fetchWithToken(`/user?email=${decoded.sub}`)
                    .then((res) => res.json())
                    .then((data) => setUser(data[0]))
                    .catch((err) => addNotification(`Error fetching user data: ${err}`, "error"))
                    .finally(() => setIsLoadingUser(false));
            }
            setIsLoadingRole(true);
            fetchWithToken(`/projects`)
                .then((res) => res.json())
                .then((roles: RoleManagementWithName[]) => setRoles(roles))
                .catch((err) => addNotification(`Error loading role management: ${err}`, "error"))
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
