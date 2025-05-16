import {Gauge, PersonStanding, ArchiveIcon, BoxIcon, PackageCheck, LucideIcon} from "lucide-react";
import {useTranslation} from "react-i18next";

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
    const {t} = useTranslation();
    // Extrahiere die project_id aus der aktuellen URL
    const urlParams = new URLSearchParams(window.location.search);
    const currentQuery = urlParams.get('project_id') ? `?project_id=${urlParams.get('project_id')}` : "";

    return [
        {
            groupLabel: "",
            menus: [
                {
                    href: `/dwh/dashboard${currentQuery}`,
                    label: t("menu.dashboard"),
                    icon: Gauge,
                },
                {
                    href: `/dwh/orders${currentQuery}`,
                    label: t("menu.orders"),
                    icon: PackageCheck,
                },
                {
                    href: `/dwh/customer${currentQuery}`,
                    label: t("menu.customer"),
                    icon: PersonStanding,
                },
                {
                    href: `/dwh/warehouse${currentQuery}`,
                    label: t("menu.warehouse"),
                    icon: ArchiveIcon,
                },
                {
                    href: `/dwh/partsstorage${currentQuery}`,
                    label: t("menu.parts_storage"),
                    icon: BoxIcon,
                },
            ],
        },
    ];
}
