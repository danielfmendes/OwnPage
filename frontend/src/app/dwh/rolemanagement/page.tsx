"use client";
import DataTable from "@/components/helpers/Table";
import * as React from "react";
import type {ColumnDef} from "@tanstack/react-table";
import {RoleManagementsService, RoleManagementWithName} from "@/models/api";
import {useNotification} from "@/components/helpers/NotificationProvider";
import {ContentLayout} from "@/components/admin-panel/content-layout";
import {Button} from "@/components/ui/button";
import RoleManagementDialogContent from "@/app/dwh/rolemanagement/manage-dialog";
import {Dialog} from "@/components/ui/dialog";
import {useRoleStore} from "@/utils/rolemananagemetstate";
import AddProjektDialogContent from "@/app/dwh/rolemanagement/add-project-dialog";
import {useTranslation} from "react-i18next";
import FilterManager from "@/utils/filtermanager";

export default function RoleManagementPage() {
    const {t} = useTranslation();
    const {addNotification} = useNotification();
    const filterManager = new FilterManager();
    const [data, setData] = React.useState<RoleManagementWithName[]>([]);
    const isLoadingData = useRoleStore((state) => state.isLoading);
    const setIsLoadingData = useRoleStore((state) => state.setIsLoading);
    const [showDialog, setShowDialog] = React.useState(false);
    const [manageId, setManageId] = React.useState<number | null>(null);

    const fetchData = React.useCallback(async () => {
        setIsLoadingData(true);
        const filterString = await filterManager.getFilterString();
        RoleManagementsService.getRoleManagements(filterString === "" ? undefined : filterString)
            .then((roles: RoleManagementWithName[]) => {
                setData(roles ?? [])
                useRoleStore.getState().setRoles(roles ?? [])
            })
            .catch(err => addNotification(`Failed to load rolemanagement${err?.message ? `: ${err.message}` : ""}`, "error"))
            .finally(() => setIsLoadingData(false));
    }, []);

    const columns: ColumnDef<RoleManagementWithName>[] = [
        {
            accessorKey: "project_name",
            header: t("label.project_name")
        },
        {
            accessorKey: "role",
            header: t("label.role")
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
                        {t("button.manage")}
                    </Button>
                ) : (
                    <Button
                        disabled
                        className="text-black dark:text-white p-2 rounded opacity-50 cursor-not-allowed"
                        variant="secondary"
                    >
                        {t("button.manage")}
                    </Button>
                );
            },
        },
    ]
    return (
        <ContentLayout title={t("menu.role_management")}>
            <DataTable
                title={t("menu.role_management")}
                columns={columns}
                data={data}
                isLoading={isLoadingData}
                filterColumn={"project_name"}
                onRefresh={async () => {
                    await fetchData()
                }}
                addDialogContent={(onClose) => (
                    <AddProjektDialogContent
                        onClose={onClose}
                        onRefresh={fetchData}
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