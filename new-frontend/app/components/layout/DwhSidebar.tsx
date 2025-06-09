import {
    Gauge,
    PackageCheck,
    PersonStanding,
    ArchiveIcon,
    BoxIcon,
    LogOut,
    Box,
} from "lucide-react";
import {Link} from "react-router-dom";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "~/components/ui/sidebar";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider,
} from "~/components/ui/tooltip";
import {Button} from "~/components/ui/button";
import {cn} from "~/utils/utils";
import {useTranslation} from "react-i18next";

interface DwhSidebarProps {
    isOpen: boolean | undefined;
}

export function DwhSidebar({isOpen}: DwhSidebarProps) {
    const {t} = useTranslation();
    // Extrahiere die project_id aus der aktuellen URL
    const urlParams = new URLSearchParams(window.location.search);
    const currentQuery = urlParams.get('project_id') ? `?project_id=${urlParams.get('project_id')}` : "";

    const items = [
        {href: `/dwh/dashboard${currentQuery}`, label: t("menu.dashboard"), icon: Gauge},
        {href: `/dwh/orders${currentQuery}`, label: t("menu.orders"), icon: PackageCheck},
        {href: `/dwh/customer${currentQuery}`, label: t("menu.customer"), icon: PersonStanding},
        {href: `/dwh/warehouse${currentQuery}`, label: t("menu.warehouse"), icon: ArchiveIcon},
        {href: `/dwh/partsstorage${currentQuery}`, label: t("menu.parts_storage"), icon: BoxIcon},
    ]

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader>
                {isOpen && (
                    <Link to="/dwh/dashboard" className="flex flex-col items-start w-full pt-4">
                        <div className="flex items-center gap-2 w-full justify-center">
                            <Box className="w-6 h-6"/>
                            <h1 className="font-bold text-lg whitespace-nowrap transition-all ease-in-out duration-300">
                                NebulaDW
                            </h1>
                        </div>
                    </Link>
                )}
                <div className={isOpen ? "mt-3" : "mt-8"}/>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.label}>
                                    <SidebarMenuButton asChild>
                                        <Link
                                            to={item.href}
                                            className="flex items-center gap-3 w-full min-h-[44px] px-3 py-2 rounded-md hover:bg-muted"
                                        >
                                            <item.icon className="w-5 h-5 shrink-0"/>
                                            <span className="text-sm font-medium">{item.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <TooltipProvider disableHoverableContent>
                    <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full justify-center min-h-[44px] mt-5 flex items-center"
                            >
                                <span className={cn(isOpen ? "mr-3" : "")}>
                                  <LogOut className="w-5 h-5"/>
                                </span>
                                <p
                                    className={cn(
                                        "text-sm font-medium transition-opacity duration-200",
                                        !isOpen && "opacity-0 hidden"
                                    )}
                                >
                                    Sign Out
                                </p>
                            </Button>
                        </TooltipTrigger>
                        {!isOpen && <TooltipContent side="right">Sign Out</TooltipContent>}
                    </Tooltip>
                </TooltipProvider>
            </SidebarFooter>
        </Sidebar>
    );
}
