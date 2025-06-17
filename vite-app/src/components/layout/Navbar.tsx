import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogTrigger} from "@/components/ui/dialog";
import {type ReactNode, useState} from "react";
import type {RoleManagementWithName} from "@/models/api";
import {useTranslation} from "react-i18next";
import {Folder} from "lucide-react";
import {useRoleStore} from "@/utils/rolemananagemetstate";
import {UserNav} from "@/components/layout/UserNav";
import {ProjectDialog} from "@/components/layout/ProjectDialog";

type NavbarProps = {
    title: string;
    children?: ReactNode;
};

export function Navbar({title, children}: NavbarProps) {
    const {t} = useTranslation();
    const [open, setOpen] = useState(false);
    const roles: RoleManagementWithName[] = useRoleStore((state) => state.selectedRoles);

    const dynamicTitle =
        roles.length === 0
            ? t("projectDialog.open")
            : roles.length === 1
                ? t("projectDialog.single", {count: 1})
                : t("projectDialog.multiple", {count: roles.length});

    return (
        <header
            className="sticky top-0 z-10 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary">
            <div className="mx-4 sm:mx-8 flex h-14 items-center">
                {children && <div className="mr-4">{children}</div>}
                <div className="flex items-center space-x-4 lg:space-x-2">
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                className="mr-2 flex items-center gap-2"
                                onClick={() => setOpen(true)}
                                aria-label={dynamicTitle}
                            >
                                <Folder className="w-5 h-5" aria-hidden="true"/>
                                <span className="block md:hidden text-sm font-medium">{roles.length}</span>
                                <span className="hidden md:block">{dynamicTitle}</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <ProjectDialog onClose={() => setOpen(false)}/>
                        </DialogContent>
                    </Dialog>
                    <h1 className="font-bold">{title}</h1>
                </div>
                <div className="flex flex-1 items-center justify-end">
                    <UserNav/>
                </div>
            </div>
        </header>
    );
}
