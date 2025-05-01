import {Gauge, PersonStanding, ArchiveIcon, BoxIcon, LucideIcon} from "lucide-react"

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
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/dwh/dashboard",
          label: "Dashboard",
          icon: Gauge,
        },
        {
          href: "/dwh/customer",
          label: "Kundendaten",
          icon: PersonStanding,
        },
        {
          href: "/dwh/warehouse",
          label: "Warenlager",
          icon: ArchiveIcon,
        },
        {
          href: "/dwh/partsstorage",
          label: "Teilelager",
          icon: BoxIcon,
        },
      ]
    },
  ];
}
