import {useMemo, useState, type MouseEvent} from "react";
import DataTable from "@/components/helpers/Table";
import {type CustomColumnDef} from "@/models/datatable/column";
import {WareHousePartsService, type WarehousePartWithName} from "@/models/api";
import {useNotification} from "@/components/helpers/NotificationProvider";
import {useTranslation} from "react-i18next";
import {isRoleUserForProject} from "@/utils/helpers";
import {genericItemsLoader, type ItemsLoaderOptions, useRefreshData} from "@/models/datatable/itemsLoader";
import {type FilterDefinition} from "@/components/helpers/FilterBar";
import {createWareHousePartsFilterItemLoader} from "@/models/datatable/filterItemsLoader";
import ContentLayout from "@/components/layout/ContentLayout";
import WarehousePartDialogContent from "@/pages/dwh/partsstorage/content-dialog";
import {DeleteButton} from "@/components/helpers/buttons/DeleteButton";

export default function PartsStoragePage() {
    const {t} = useTranslation();
    const {addNotification} = useNotification();
    const refreshData = useRefreshData(itemsLoader);

    const [data, setData] = useState<WarehousePartWithName[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [loadingDeleteId, setLoadingDeleteId] = useState<number | null>(null);
    const [itemsLoaderOptions, setItemsLoaderOptions] = useState<ItemsLoaderOptions | null>(null);

    async function itemsLoader(options: ItemsLoaderOptions): Promise<void> {
        setItemsLoaderOptions(options);
        return genericItemsLoader<WarehousePartWithName>(
            options,
            WareHousePartsService.getWareHouseParts,
            setData,
            setTotalCount
        );
    }

    const handleDelete = (event: MouseEvent, id: number) => {
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
            mobileTitle: true,
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
            header: t("label.storage_location"),
            widthPercent: 25,
        },
        {
            id: "actions",
            enableHiding: false,
            widthPercent: 5,
            cell: ({row}) => {
                const warehousePart: WarehousePartWithName = row.original

                return (
                    <DeleteButton
                        onClick={(event) => handleDelete(event, warehousePart.id!)}
                        isLoading={loadingDeleteId === warehousePart.id}
                        disabled={isRoleUserForProject(warehousePart.project_id)}
                    />
                )
            },
        },
    ]

    const filters: FilterDefinition[] = useMemo(() => {
        if (!itemsLoaderOptions) return [];
        const warehouseFilterLoader = createWareHousePartsFilterItemLoader(itemsLoaderOptions);

        return [
            warehouseFilterLoader("id", {pinned: false, type: "search"}),
            warehouseFilterLoader("part_type", {type: "search"}),
            warehouseFilterLoader("part_name", {type: "search"}),
            warehouseFilterLoader("quantity", {pinned: false, type: "search"}),
            warehouseFilterLoader("storage_location", {type: "search"}),
        ];
    }, [itemsLoaderOptions]);

    return (
        <ContentLayout title={t("menu.parts_storage")}>
            <DataTable
                title={t("menu.parts_storage")}
                columns={columns}
                data={data}
                itemsLoader={itemsLoader}
                totalCount={totalCount}
                filterDefinition={filters}
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
