"use client";
import {ContentLayout} from "@/components/admin-panel/content-layout";
import {useSidebar} from "@/hooks/use-sidebar";
import {useStore} from "@/hooks/use-store";
import DataTable from "@/components/helpers/Table";
import {CustomColumnDef} from "@/models/datatable/column";
import {Trash2} from "lucide-react";
import * as React from "react";
import WarehousePartDialogContent from "@/app/dwh/partsstorage/content-dialog";
import {WareHousePartsService, WarehousePartWithName} from "@/models/api";
import {ButtonLoading} from "@/components/helpers/ButtonLoading";
import {useNotification} from "@/components/helpers/NotificationProvider";
import {useTranslation} from "react-i18next";
import {isRoleUserForProject} from "@/utils/helpers";
import {genericItemsLoader, ItemsLoaderOptions, useRefreshData} from "@/models/datatable/itemsLoader";

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

    const columns: CustomColumnDef<WarehousePartWithName>[] = [
        {
            accessorKey: "id",
            header: t("label.id"),
            widthPercent: 5,
        },
        {
            accessorKey: "part_type",
            header: t("label.part_type"),
            widthPercent: 18,
        },
        {
            accessorKey: "part_name",
            header: t("label.part_name"),
            widthPercent: 32,
        },
        {
            accessorKey: "quantity",
            header: t("label.quantity"),
            widthPercent: 15,
        },
        {
            accessorKey: "storage_location",
            header: t("label.warehouse_position"),
            widthPercent: 25,
        },
        {
            id: "actions",
            enableHiding: false,
            widthPercent: 5,
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
