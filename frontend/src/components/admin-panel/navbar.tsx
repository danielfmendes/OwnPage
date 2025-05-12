import { UserNav } from "@/components/admin-panel/user-nav";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AncestorDialog } from "@/components/helpers/AncestorDialog";
import { useState } from "react";
import { useRoleStore } from "@/utils/rolemananagemetstate";
import { RoleManagementWithName } from "@/types/custom";

interface NavbarProps {
  title: string;
}

export function Navbar({ title }: NavbarProps) {
    const [open, setOpen] = useState(false);
    const roles: RoleManagementWithName[] = useRoleStore((state) => state.selectedRoles);

    const dynamicTitle = roles.length === 0
        ? 'Open Ancestor Dialog'
        : roles.length === 1
            ? "1 Ancestor"
            : `${roles.length} Ancestors`;

    return (
        <header className="sticky top-0 z-10 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary">
            <div className="mx-4 sm:mx-8 flex h-14 items-center">
                <div className="flex items-center space-x-4 lg:space-x-0">
                    {/*<SheetMenu />*/}
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="mr-2" onClick={() => setOpen(true)}>
                                {dynamicTitle}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <AncestorDialog onClose={() => setOpen(false)} />
                        </DialogContent>
                    </Dialog>
                    <h1 className="font-bold">{title}</h1>
                </div>
                <div className="flex flex-1 items-center justify-end">
                    <UserNav />
                </div>
            </div>
        </header>
    );
}
