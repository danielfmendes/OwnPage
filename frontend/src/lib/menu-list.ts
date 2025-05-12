import {Gauge, PersonStanding, ArchiveIcon, BoxIcon, PackageCheck, LucideIcon} from "lucide-react";

type Submenu = {
    href: string;
    label: string;
    active?: boolean;
};

type Menu = {
    href: string;
    label: string;
    active?: boolean;
    icon: LucideIcon;
    submenus?: Submenu[];
};

type Group = {
    groupLabel: string;
    menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
    // Extrahiere die project_id aus der aktuellen URL
    const urlParams = new URLSearchParams(window.location.search);
    const currentQuery = urlParams.get('project_id') ? `?project_id=${urlParams.get('project_id')}` : "";

    return [
        {
            groupLabel: "",
            menus: [
                {
                    href: `/dwh/dashboard${currentQuery}`,
                    label: "Dashboard",
                    icon: Gauge,
                },
                {
                    href: `/dwh/orders${currentQuery}`,
                    label: "Orders",
                    icon: PackageCheck,
                },
                {
                    href: `/dwh/customer${currentQuery}`,
                    label: "Kundendaten",
                    icon: PersonStanding,
                },
                {
                    href: `/dwh/warehouse${currentQuery}`,
                    label: "Warenlager",
                    icon: ArchiveIcon,
                },
                {
                    href: `/dwh/partsstorage${currentQuery}`,
                    label: "Teilelager",
                    icon: BoxIcon,
                },
            ],
        },
    ];
}
