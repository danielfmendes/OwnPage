import React from "react";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {fetchWithToken} from "@/utils/url";
import {useNotification} from "@/components/helpers/NotificationProvider";
import {RoleManagement} from "@/types/datatables";
import {Button} from "@/components/ui/button";
import {Select, SelectTrigger, SelectValue, SelectContent, SelectItem} from "@/components/ui/select";
import {Check, Trash} from "lucide-react";
import type {ColumnDef} from "@tanstack/react-table";
import {SimpleTable} from "@/components/helpers/SimpleTable";

interface ManageProps {
    manageId: number | null;
}

export default function ManageDialogContent({manageId}: ManageProps) {
    const {addNotification} = useNotification();
    const [data, setData] = React.useState<RoleManagement[]>([]);
    const [originalData, setOriginalData] = React.useState<Record<string, string>>({});
    const [isLoadingData, setIsLoadingData] = React.useState(true);

    const fetchData = () => {
        if (manageId) {
            setIsLoadingData(true);
            fetchWithToken(`/projects/${manageId}`)
                .then((res) => res.json())
                .then((roles: RoleManagement[]) => {
                    setData(roles);
                    const original: Record<string, string> = {};
                    roles.forEach((role) => {
                        original[role.user_email] = role.role;
                    });
                    setOriginalData(original);
                })
                .catch((err) =>
                    addNotification(`Fehler beim Laden der Rollen: ${err}`, "error")
                )
                .finally(() => setIsLoadingData(false));
        }
    };

    React.useEffect(() => {
        fetchData();
    }, [manageId]);

    const handleRoleChange = (email: string, newRole: string) => {
        setData((prev) =>
            prev.map((r) =>
                r.user_email === email ? { ...r, role: newRole } : r
            )
        );
    };

    const handleSave = (email: string) => {
        //todo: implement save
    };

    const handleDelete = (email: string) => {
        //todo: implement delete
    };

    const columns: ColumnDef<RoleManagement>[] = [
        {
            accessorKey: "user_email",
            header: "User Email",
        },
        {
            accessorKey: "role",
            header: "Role",
            cell: ({row}) => {
                const email = row.original.user_email;
                const value = row.original.role;
                return (
                    <Select
                        value={value}
                        onValueChange={(newRole) => handleRoleChange(email, newRole)}
                    >
                        <SelectTrigger className="w-[120px]">
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="creator">Creator</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                    </Select>
                );
            },
        },
        {
            id: "actions",
            header: "",
            cell: ({row}) => {
                const email = row.original.user_email;
                const currentRole = row.original.role;
                const originalRole = originalData[email];
                const hasChanged = currentRole !== originalRole;

                return (
                    <div className="flex gap-2">
                        <Button
                            variant={hasChanged ? "default" : "outline"}
                            size="icon"
                            disabled={!hasChanged}
                            onClick={() => handleSave(email)}
                        >
                            <Check className="w-4 h-4"/>
                        </Button>
                        <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDelete(email)}
                        >
                            <Trash className="w-4 h-4"/>
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <DialogContent className="sm:max-w-[640px]">
            <DialogHeader>
                <DialogTitle>Rechte bearbeiten</DialogTitle>
            </DialogHeader>
            <SimpleTable data={data} columns={columns} isLoading={isLoadingData} />
        </DialogContent>
    );
}
