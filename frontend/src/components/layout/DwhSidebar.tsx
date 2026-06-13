import {
    Gauge,
    LogOut,
    Box,
    Table2,
    Workflow,
    Terminal,
    Users,
} from "lucide-react";
import {useEffect, useState} from "react";
import {useNavigate, useLocation} from "react-router-dom";
import {dwhClient} from "@/models/dwh/dwhClient";
import type {DwhEntity} from "@/models/dwh/types";
import {useActiveSchema} from "@/utils/useActiveSchema";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
} from "@/components/ui/sidebar";
import {cn} from "@/lib/utils";
import {useTranslation} from "react-i18next";
import {handleLogOut} from "@/utils/helpers";
import {useNotification} from "@/components/helpers/NotificationProvider";

interface DwhSidebarProps {
    isOpen: boolean | undefined;
}

export function DwhSidebar({isOpen}: DwhSidebarProps) {
    const {t} = useTranslation();
    const {addNotification} = useNotification();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        handleLogOut(navigate, addNotification);
    };

    // Load the active SCHEMA's entities for the dynamic data links. The active project/schema lives in
    // the persisted store (useActiveSchema), so links don't need any ?project_id= query param.
    const {schemaId} = useActiveSchema();
    const [entities, setEntities] = useState<DwhEntity[]>([]);
    useEffect(() => {
        if (!schemaId) {
            setEntities([]);
            return;
        }
        let active = true;
        dwhClient
            .listEntities(schemaId)
            .then((es) => active && setEntities(es))
            .catch(() => active && setEntities([]));
        return () => {
            active = false;
        };
    }, [schemaId]);

    // Fixed platform links, then one "Data" link per user-defined entity.
    const platformItems = [
        {href: "/dwh/dashboard", label: t("menu.dashboard", {defaultValue: "Dashboard"}), icon: Gauge},
        {href: "/dwh/schema", label: t("menu.schema", {defaultValue: "Schema"}), icon: Workflow},
        {href: "/dwh/sql", label: t("menu.sql", {defaultValue: "SQL"}), icon: Terminal},
        {href: "/dwh/rolemanagement", label: t("menu.roles", {defaultValue: "Roles"}), icon: Users},
    ];
    const dataItems = entities.map((e) => ({
        href: `/dwh/data/${e.name}`,
        label: e.display_name || e.name,
        icon: Table2,
    }));

    const renderItem = ({href, label, icon: Icon}: { href: string; label: string; icon: typeof Gauge }) => {
        const isActive = location.pathname === href;
        return (
            <SidebarMenuButton
                key={label}
                tooltip={label}
                onClick={() => navigate(href)}
                className={cn(
                    isOpen ? "flex items-center gap-3 w-full min-h-[44px] px-3 py-2 rounded-md" : "",
                    isActive ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary" : "hover:bg-muted"
                )}
            >
                {Icon && (
                    <Icon
                        className={cn("w-5 shrink-0 transition-all duration-200 ease-in-out", isOpen ? "h-7" : "h-5", isActive && "text-sidebar-primary-foreground")}
                        aria-hidden="true"
                    />
                )}
                <span className={cn("text-sm font-medium truncate", isActive && "text-sidebar-primary-foreground")}>{label}</span>
            </SidebarMenuButton>
        );
    };

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuButton
                        size="lg"
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        onClick={() => navigate("/dwh/dashboard")}
                    >
                        <div
                            className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                            <Box className="w-4 h-4"/>
                        </div>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold">Nebula</span>
                            <span className="truncate text-xs">Data Warehouse Tool</span>
                        </div>
                    </SidebarMenuButton>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className={isOpen ? "mt-2" : "mt-4"}>
                <SidebarGroup className={isOpen ? "gap-1" : "gap-2"}>
                    {platformItems.map(renderItem)}
                </SidebarGroup>
                {dataItems.length > 0 && (
                    <SidebarGroup className={isOpen ? "gap-1" : "gap-2"}>
                        {isOpen && <div className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("menu.data", {defaultValue: "Data"})}</div>}
                        {dataItems.map(renderItem)}
                    </SidebarGroup>
                )}
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenuButton
                    tooltip={t("button.sign_out")}
                    onClick={handleLogout}
                    className={cn(
                        "flex gap-3 items-center transition-all duration-200 ease-in-out",
                        isOpen ? "justify-center w-full px-3 py-2 min-h-[44px] rounded-md" : ""
                    )}
                    style={{boxShadow: "inset 0 0 0 2px var(--secondary)"}}
                >
                    <LogOut
                        className={cn("w-5 shrink-0", isOpen ? "h-7" : "h-5")}
                        aria-hidden="true"
                    />
                    <span
                        className={cn(
                            "text-sm font-medium truncate transition-opacity duration-200",
                            !isOpen && "opacity-0 w-0 overflow-hidden"
                        )}
                    >
                      {t("button.sign_out")}
                    </span>
                </SidebarMenuButton>
            </SidebarFooter>
        </Sidebar>
    );
}
