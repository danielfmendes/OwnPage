"use client";
import BikeDialogContent from "@/app/dwh/warehouse/content-dialog";
import DataTable from "@/components/helpers/Table";
import * as React from "react";
import type {ColumnDef} from "@tanstack/react-table";
import {fetchWithToken} from "@/utils/url";
import {RoleManagementWithName} from "@/types/custom";
import {useNotification} from "@/components/helpers/NotificationProvider";
import {ContentLayout} from "@/components/admin-panel/content-layout";
import {Button} from "@/components/ui/button";
import RoleManagementDialogContent from "@/app/dwh/rolemanagement/content-dialog";
import {Dialog} from "@/components/ui/dialog";

export default function RoleManagement() {
    const {addNotification} = useNotification();
    const [data, setData] = React.useState<RoleManagementWithName[]>([]);
    const [isLoadingData, setIsLoadingData] = React.useState(true);
    const [showDialog, setShowDialog] = React.useState(false);

    const fetchData = React.useCallback(() => {
        setIsLoadingData(true);
        fetchWithToken(`/projects`)
            .then((res) => res.json())
            .then((roles: RoleManagementWithName[]) => setData(roles))
            .catch(err => addNotification(`Error loading bikes: ${err}`, "error"))
            .finally(() => setIsLoadingData(false));
    }, [addNotification]);

    const columns: ColumnDef<RoleManagementWithName>[] = [
        {
            accessorKey: "project_id",
            header: "Projekt Name",
        },
        {
            accessorKey: "project_name",
            header: "Projekt Name",
        },
        {
            accessorKey: "role",
            header: "Projekt Name",
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const roleman: RoleManagementWithName = row.original
                return roleman.role === "admin" ? (
                    <Button
                        onClick={() => setShowDialog(true)}
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
            />
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <RoleManagementDialogContent
                    title={"Rechte bearbeiten"}
                />
            </Dialog>
        </ContentLayout>
    );
}