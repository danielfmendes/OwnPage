import {
    Gauge,
    PackageCheck,
    PersonStanding,
    ArchiveIcon,
    BoxIcon,
    LogOut,
    Box,
} from "lucide-react";
import {Link, useNavigate, useLocation} from "react-router-dom";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import {cn} from "@/utils/utils";
import {useTranslation} from "react-i18next";
import * as React from "react";
import {handleLogOut} from "@/utils/helpers";
import {useNotification} from "@/components/helpers/NotificationProvider";
import {Collapsible, CollapsibleTrigger} from "@/components/ui/collapsible";

interface DwhSidebarProps {
    isOpen: boolean | undefined;
}

export function DwhSidebar({isOpen}: DwhSidebarProps) {
    const {t} = useTranslation();
    const {addNotification} = useNotification();
    const navigate = useNavigate();
    const location = useLocation();

    // Extract project_id from URL search params once
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get("project_id");
    const currentQuery = projectId ? `?project_id=${projectId}` : "";

    const handleLogout = () => {
        handleLogOut(navigate, addNotification);
    };

    const items = [
        {href: `/dwh/dashboard${currentQuery}`, label: t("menu.dashboard"), icon: Gauge},
        {href: `/dwh/orders${currentQuery}`, label: t("menu.orders"), icon: PackageCheck},
        {href: `/dwh/customer${currentQuery}`, label: t("menu.customer"), icon: PersonStanding},
        {href: `/dwh/warehouse${currentQuery}`, label: t("menu.warehouse"), icon: ArchiveIcon},
        {href: `/dwh/partsstorage${currentQuery}`, label: t("menu.parts_storage"), icon: BoxIcon},
    ];

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

            <SidebarGroup>
                    <SidebarMenu>
                        {items.map(({href, label, icon: Icon}) => {
                            const itemPath = href.split("?")[0];
                            const isActive = location.pathname === itemPath;

                            return (
                                <Collapsible key={label} asChild className="group/collapsible">
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton tooltip={label} asChild>
                                                <Link
                                                    to={href}
                                                    className={cn(
                                                        isOpen ? "flex items-center gap-3 w-full min-h-[44px] px-3 py-2 rounded-md" : "",
                                                        isActive
                                                            ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary"
                                                            : "hover:bg-muted"
                                                    )}
                                                >
                                                    {Icon && (
                                                        <Icon
                                                            className={cn(
                                                                "w-5 shrink-0 transition-all duration-200 ease-in-out",
                                                                isOpen ? "h-7" : "h-5",
                                                                isActive && "text-sidebar-primary-foreground"
                                                            )}
                                                            aria-hidden="true"
                                                        />
                                                    )}
                                                    <span
                                                        className={cn(
                                                            "text-sm font-medium truncate",
                                                            isActive && "text-sidebar-primary-foreground"
                                                        )}
                                                    >
                                                        {label}
                                                      </span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                    </SidebarMenuItem>
                                </Collapsible>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenuButton
                    tooltip={t("button.sign_out")}
                    onClick={handleLogout}
                    className={cn(
                        "flex gap-3 items-center transition-all duration-200 ease-in-out border-2",
                        isOpen ? "justify-center w-full px-3 py-2 min-h-[44px] rounded-md" : ""
                    )}
                    style={{borderColor: "var(--secondary)"}}
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
