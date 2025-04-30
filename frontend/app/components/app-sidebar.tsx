import { Box, Gauge, PersonStanding, ArchiveIcon, BoxIcon, ChevronUp } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "~/components/ui/sidebar"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"

// Menu items.
const items = [
    {
        title: "Dashboard",
        url: "/dwh/dashboard",
        icon: Gauge,
    },
    {
        title: "Kundendaten",
        url: "/dwh/customer",
        icon: PersonStanding,
    },
    {
        title: "Warenlager",
        url: "/dwh/warehouse",
        icon: ArchiveIcon,
    },
    {
        title: "Teilelager",
        url: "/dwh/partsstorage",
        icon: BoxIcon,
    },
]

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarHeader className="flex flex-row justify-center items-center gap-4">
                <span className="font-bold text-lg">NebulaDW</span>
                <Box />
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton>
                                    Icon
                                    Username
                                    <ChevronUp className="ml-auto" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="top"
                                className="w-[--radix-popper-anchor-width]"
                            >
                                <DropdownMenuItem>
                                    <span>Account</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <span>Billing</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <span>Sign out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
