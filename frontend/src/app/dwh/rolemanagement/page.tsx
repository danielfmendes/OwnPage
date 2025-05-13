"use client";
import DataTable from "@/components/helpers/Table";
import * as React from "react";
import type {ColumnDef} from "@tanstack/react-table";
import {fetchWithToken} from "@/utils/url";
import {RoleManagementWithName} from "@/types/custom";
import {useNotification} from "@/components/helpers/NotificationProvider";
import {ContentLayout} from "@/components/admin-panel/content-layout";
import {Button} from "@/components/ui/button";
import RoleManagementDialogContent from "@/app/dwh/rolemanagement/manage-dialog";
import {Dialog} from "@/components/ui/dialog";
import {useRoleStore} from "@/utils/rolemananagemetstate";
import AddProjektDialogContent from "@/app/dwh/rolemanagement/add-project-dialog";

export default function RoleManagementPage() {
    const {addNotification} = useNotification();
    const data = useRoleStore((state) => state.roles);
    const setData = useRoleStore((state) => state.setRoles);
    const isLoadingData = useRoleStore((state) => state.isLoading);
    const setIsLoadingData = useRoleStore((state) => state.setIsLoading);
    const [showDialog, setShowDialog] = React.useState(false);
    const [manageId, setManageId] = React.useState<number | null>(null);

    const fetchData = React.useCallback((isLoading?: boolean) => {
        if (!data || isLoading) {
            setIsLoadingData(true);
        }
        fetchWithToken(`/rolemanagements`)
            .then((res) => res.json())
            .then((roles: RoleManagementWithName[]) => setData(roles))
            .catch(err => addNotification(`Error loading bikes: ${err}`, "error"))
            .finally(() => setIsLoadingData(false));
    }, []);

    const columns: ColumnDef<RoleManagementWithName>[] = [
        {
            accessorKey: "project_name",
            header: "Projekt Name",
        },
        {
            accessorKey: "role",
            header: "Role",
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({row}) => {
                const roleman: RoleManagementWithName = row.original
                return roleman.role !== "user" ? (
                    <Button
                        onClick={() => {
                            setManageId(roleman.project_id)
                            setShowDialog(true)
                        }}
                        className="text-white dark:text-black p-2 rounded"
                    >
                        Manage
                    </Button>
                ) : (
                    <Button
                        disabled
                        className="text-black dark:text-white p-2 rounded opacity-50 cursor-not-allowed"
                        variant="secondary"
                    >
                        Manage
                    </Button>
                );
            },
        },
    ]
    return (
        <ContentLayout title="Role Management">
            <DataTable
                title="Role Management"
                columns={columns}
                data={data}
                isLoading={isLoadingData}
                filterColumn={"project_name"}
                onRefresh={() => {
                    fetchData()
                }}
                addDialogContent={(onClose) => (
                    <AddProjektDialogContent
                        onClose={onClose}
                        onRefresh={() => fetchData(true)}
                    />
                )}
            />
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <RoleManagementDialogContent
                    manageId={manageId}
                />
            </Dialog>
        </ContentLayout>
    );
}