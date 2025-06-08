"use client";
import DataTable from "@/components/helpers/Table";
import * as React from "react";
import {CustomColumnDef} from "@/models/datatable/column";
import {RoleManagementsService, RoleManagementWithName} from "@/models/api";
import {ContentLayout} from "@/components/admin-panel/content-layout";
import {Button} from "@/components/ui/button";
import RoleManagementDialogContent from "@/app/dwh/rolemanagement/manage-dialog";
import {Dialog} from "@/components/ui/dialog";
import AddProjektDialogContent from "@/app/dwh/rolemanagement/add-project-dialog";
import {useTranslation} from "react-i18next";
import {genericItemsLoader, ItemsLoaderOptions, useRefreshData} from "@/models/datatable/itemsLoader";
import {FilterDefinition} from "@/components/helpers/FilterBar";
import {createRoleManagementFilterItemLoader} from "@/models/datatable/filterItemsLoader";

export default function RoleManagementPage() {
    const {t} = useTranslation();
    const refreshData = useRefreshData(itemsLoader);

    const [data, setData] = React.useState<RoleManagementWithName[]>([]);
    const [totalCount, setTotalCount] = React.useState<number>(0);
    const [showDialog, setShowDialog] = React.useState(false);
    const [manageId, setManageId] = React.useState<number | null>(null);
    const [itemsLoaderOptions, setItemsLoaderOptions] = React.useState<ItemsLoaderOptions | null>(null);

    async function itemsLoader(options: ItemsLoaderOptions): Promise<void> {
        setItemsLoaderOptions(options);
        return genericItemsLoader<RoleManagementWithName>(
            options,
            RoleManagementsService.getRoleManagements,
            setData,
            setTotalCount
        );
    }

    const columns: CustomColumnDef<RoleManagementWithName>[] = [
        {
            accessorKey: "project_name",
            header: t("label.project_name"),
            enableSorting: false,
            widthPercent: 40,
            mobileTitle: true,
        },
        {
            accessorKey: "role",
            header: t("label.role"),
            enableSorting: false,
            widthPercent: 40,
        },
        {
            id: "actions",
            widthPercent: 10,
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

    const filters: FilterDefinition[] = React.useMemo(() => {
        if (!itemsLoaderOptions) return [];
        const roleManagementFilterLoader = createRoleManagementFilterItemLoader(itemsLoaderOptions);

        return [
            roleManagementFilterLoader("project_name", {type: "search"}),
            roleManagementFilterLoader("role"),
        ];
    }, [itemsLoaderOptions]);

    return (
        <ContentLayout title={t("menu.role_management")}>
            <DataTable
                title={t("menu.role_management")}
                columns={columns}
                data={data}
                itemsLoader={itemsLoader}
                totalCount={totalCount}
                filterDefinition={filters}
                addDialogContent={(onClose) => (
                    <AddProjektDialogContent
                        onClose={onClose}
                        onRefresh={refreshData}
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