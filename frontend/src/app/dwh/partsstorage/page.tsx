"use client";
import {ContentLayout} from "@/components/admin-panel/content-layout";
import {useSidebar} from "@/hooks/use-sidebar";
import {useStore} from "@/hooks/use-store";
import DataTable from "@/components/helpers/Table";
import type {ColumnDef} from "@tanstack/react-table";
import {Trash2} from "lucide-react";
import * as React from "react";
import WarehousePartDialogContent from "@/app/dwh/partsstorage/content-dialog";
import {WareHousePartsService, WarehousePartWithName} from "@/models/api";
import {ButtonLoading} from "@/components/helpers/ButtonLoading";
import {useNotification} from "@/components/helpers/NotificationProvider";
import {useTranslation} from "react-i18next";
import {genericItemsLoader, isRoleUserForProject, useRefreshData} from "@/utils/helpers";
import {ItemsLoaderOptions} from "@/models/datatable/itemsLoader";

export default function PartsStoragePage() {
    const {t} = useTranslation();
    const {addNotification} = useNotification();
    const refreshData = useRefreshData(itemsLoader);
    const [data, setData] = React.useState<WarehousePartWithName[]>([]);
    const [totalCount, setTotalCount] = React.useState<number>(0);
    const [loadingDeleteId, setLoadingDeleteId] = React.useState<number | null>(null);

    async function itemsLoader(options: ItemsLoaderOptions): Promise<void> {
        return genericItemsLoader<WarehousePartWithName>(
            options,
            WareHousePartsService.getWareHouseParts,
            setData,
            setTotalCount
        );
    }

    const handleDelete = (event: React.MouseEvent, id: number) => {
        event.stopPropagation();
        setLoadingDeleteId(id);
        WareHousePartsService.deleteWareHousePart(id)
            .then(async () => {
                addNotification(`Warehousepart with id ${id} successfully deleted`, "success");
                await refreshData();
            })
            .catch(err => addNotification(`Failed to delete warehousepart${err?.message ? `: ${err.message}` : ""}`, "error"))
            .finally(() => setLoadingDeleteId(null));
    };

    const columns: ColumnDef<WarehousePartWithName>[] = [
        {
            accessorKey: "id",
            header: t("label.id"),
        },
        {
            accessorKey: "part_type",
            header: t("label.part_type"),
        },
        {
            accessorKey: "part_name",
            header: t("label.part_name"),
        },
        {
            accessorKey: "quantity",
            header: t("label.quantity"),
        },
        {
            accessorKey: "storage_location",
            header: t("label.warehouse_position"),
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({row}) => {
                const warehousePart: WarehousePartWithName = row.original

                return (
                    <ButtonLoading
                        onClick={(event) => handleDelete(event, warehousePart.id!)}
                        isLoading={loadingDeleteId === warehousePart.id}
                        className="text-black dark:text-white p-2 rounded"
                        variant="destructive"
                        disabled={isRoleUserForProject(warehousePart.project_id)}
                    >
                        <Trash2 className="w-5 h-5"/>
                    </ButtonLoading>
                )
            },
        },
    ]

    const sidebar = useStore(useSidebar, (x) => x);
    if (!sidebar) return null;

    return (
        <ContentLayout title={t("menu.parts_storage")}>
            <DataTable
                title={t("menu.parts_storage")}
                columns={columns}
                data={data}
                itemsLoader={itemsLoader}
                totalCount={totalCount}
                filterColumn={"storage_location"}
                rowDialogContent={(rowData, onClose) => (
                    <WarehousePartDialogContent
                        rowData={rowData}
                        onClose={onClose}
                        onRefresh={refreshData}
                    />
                )}
                addDialogContent={(onClose) => (
                    <WarehousePartDialogContent
                        onClose={onClose}
                        onRefresh={refreshData}
                    />
                )}
            />
        </ContentLayout>
    );
}
