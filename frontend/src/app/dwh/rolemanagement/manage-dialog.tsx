import React, {useState} from "react";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {deleteWithToken, fetchWithBodyAndToken, fetchWithToken} from "@/utils/url";
import {useNotification} from "@/components/helpers/NotificationProvider";
import {RoleManagement} from "@/types/datatables";
import {Select, SelectTrigger, SelectValue, SelectContent, SelectItem} from "@/components/ui/select";
import {Check, Trash2} from "lucide-react";
import {Input} from "@/components/ui/input";
import type {ColumnDef} from "@tanstack/react-table";
import {SimpleTable} from "@/components/helpers/SimpleTable";
import {ButtonLoading} from "@/components/helpers/ButtonLoading";

interface RoleSelectProps {
    value: string;
    onValueChange: (value: string) => void;
    hasRoleError?: boolean;
}

const RoleSelect = ({value, onValueChange, hasRoleError = false}: RoleSelectProps) => (
    <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={`w-[120px] ${hasRoleError ? "border-red-500" : ""}`}>
            <SelectValue placeholder="Select Role"/>
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="creator">Creator</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">User</SelectItem>
        </SelectContent>
    </Select>
);

interface ManageProps {
    manageId: number | null;
}

export default function ManageDialogContent({manageId}: ManageProps) {
    const {addNotification} = useNotification();
    const [data, setData] = React.useState<RoleManagement[]>([]);
    const [originalData, setOriginalData] = React.useState<Record<string, string>>({});
    const [isLoadingData, setIsLoadingData] = React.useState(true);
    const [isLoadingAdd, setIsLoadingAdd] = React.useState(false);
    const [loadingDeleteEmail, setLoadingDeleteEmail] = React.useState<string | null>(null);
    const [loadingEditEmail, setLoadingEditEmail] = React.useState<string | null>(null);
    const [newEmail, setNewEmail] = useState<string>("");
    const [newRole, setNewRole] = useState<string>("");

    const [hasEmailError, setHasEmailError] = useState(false);
    const [hasRoleError, setHasRoleError] = useState(false);

    const fetchData = () => {
        if (manageId) {
            setIsLoadingData(true);
            fetchWithToken(`/rolemanagements/${manageId}`)
                .then((roles: RoleManagement[]) => {
                    setData(roles);
                    const original: Record<string, string> = {};
                    roles.forEach((role) => {
                        original[role.user_email] = role.role;
                    });
                    setOriginalData(original);
                })
                .catch(err => addNotification(`Failed to load roles${err?.message ? `: ${err.message}` : ""}`, "error"))
                .finally(() => setIsLoadingData(false));
        }
    };

    React.useEffect(() => {
        fetchData();
    }, [manageId]);

    const handleRoleChange = (email: string, newRole: string) => {
        setData((prev) =>
            prev.map((r) =>
                r.user_email === email ? {...r, role: newRole} : r
            )
        );
    };

    const handleAddUser = () => {
        const isEmailValid = newEmail.trim() !== "";
        const isRoleValid = newRole !== "";

        setHasEmailError(!isEmailValid);
        setHasRoleError(!isRoleValid);
        if (newEmail && newRole) {
            const newRoleManagement: RoleManagement = {user_email: newEmail, project_id: manageId ?? 0, role: newRole};
            setIsLoadingAdd(true);
            fetchWithBodyAndToken("POST", "/rolemanagements", newRoleManagement)
                .then(() => {
                    addNotification("Role saved successfully", "success");
                    setNewEmail("");
                    setNewRole("");
                    fetchData();
                })
                .catch(err => addNotification(`Failed to save rolemanagement${err?.message ? `: ${err.message}` : ""}`, "error"))
                .finally(() => setIsLoadingAdd(false));
        }
    };

    const handleSaveRole = (email: string, currentRole: string) => {
        const updatedData: RoleManagement = {
            user_email: email,
            project_id: manageId ?? 0,
            role: currentRole,
        }
        setLoadingEditEmail(email);
        fetchWithBodyAndToken("PUT", "/rolemanagements", updatedData)
            .then(() => {
                addNotification("Role updated successfully", "success");
                fetchData();
            })
            .catch(err => addNotification(`Failed to update rolemanagement${err?.message ? `: ${err.message}` : ""}`, "error"))
            .finally(() => setLoadingEditEmail(null));
    };

    const handleDelete = (email: string) => {
        setLoadingDeleteEmail(email);
        deleteWithToken(`/rolemanagements?email=${email}&project_id=${manageId}`)
            .then(() => {
                addNotification(`Email ${email} was successfully deleted from project with id ${manageId}`, "success");
                fetchData();
            })
            .catch(err => addNotification(`Failed to delete rolemanagement${err?.message ? `: ${err.message}` : ""}`, "error"))
            .finally(() => setLoadingDeleteEmail(null));
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
                    <RoleSelect value={value} onValueChange={(newRole) => handleRoleChange(email, newRole)}/>
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
                        <ButtonLoading
                            onClick={() => handleSaveRole(email, currentRole)}
                            variant={hasChanged ? "secondary" : "outline"}
                            isLoading={loadingEditEmail === email}
                            className="text-black dark:text-white p-2 rounded"
                            disabled={!hasChanged}
                        >
                            <Check className="w-4 h-4"/>
                        </ButtonLoading>
                        <ButtonLoading
                            onClick={() => handleDelete(email)}
                            isLoading={loadingDeleteEmail === email}
                            className="text-black dark:text-white p-2 rounded"
                            variant="destructive"
                        >
                            <Trash2 className="w-5 h-5"/>
                        </ButtonLoading>
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

            <div className="mb-4 flex gap-4 items-center">
                <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Add user email"
                    className={`${hasEmailError ? "border-red-500" : ""}`}
                />
                <RoleSelect value={newRole} onValueChange={setNewRole} hasRoleError={hasRoleError}/>
                <ButtonLoading isLoading={isLoadingAdd} onClick={handleAddUser} className="w-1/6">
                    Add User
                </ButtonLoading>
            </div>

            <SimpleTable data={data} columns={columns} isLoading={isLoadingData}/>
        </DialogContent>
    );
}
