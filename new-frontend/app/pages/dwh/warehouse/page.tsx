import DataTable from "@/components/helpers/Table";
import {type CustomColumnDef} from "@/models/datatable/column";
import {Button} from "@/components/ui/button";
import {Trash2} from "lucide-react";
import * as React from "react";
import {useNotification} from "@/components/helpers/NotificationProvider";
import {ButtonLoading} from "@/components/helpers/ButtonLoading";
import {BikesService, type BikeWithModelName} from "@/models/api";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {useTranslation} from "react-i18next";
import {isRoleUserForProject} from "@/utils/helpers";
import {genericItemsLoader, type ItemsLoaderOptions, useRefreshData} from "@/models/datatable/itemsLoader";
import {type FilterDefinition} from "@/components/helpers/FilterBar";
import {createBikeFilterItemLoader} from "@/models/datatable/filterItemsLoader";
import ContentLayout from "@/components/layout/ContentLayout";
import BikeDialogContent from "@/pages/dwh/warehouse/content-dialog";

export default function WareHousePage() {
    const {t} = useTranslation();
    const {addNotification} = useNotification();
    const refreshData = useRefreshData(itemsLoader);

    const [data, setData] = React.useState<BikeWithModelName[]>([]);
    const [totalCount, setTotalCount] = React.useState<number>(0);
    const [loadingDeleteId, setLoadingDeleteId] = React.useState<number | null>(null);
    const [isLoadingDeleteCascade, setIsLoadingDeleteCascade] = React.useState(false);
    const [showCascadeDialog, setShowCascadeDialog] = React.useState(false);
    const [deleteId, setDeleteId] = React.useState<number | null>(null);
    const [itemsLoaderOptions, setItemsLoaderOptions] = React.useState<ItemsLoaderOptions | null>(null);

    async function itemsLoader(options: ItemsLoaderOptions): Promise<void> {
        setItemsLoaderOptions(options);
        return genericItemsLoader<BikeWithModelName>(
            options,
            BikesService.getBikes,
            setData,
            setTotalCount
        );
    }

    const deleteBike = (id: number, cascade: boolean = false) => {
        if (cascade) {
            setIsLoadingDeleteCascade(true);
        } else {
            setLoadingDeleteId(id);
        }

        BikesService.deleteBike(id, cascade)
            .then(async () => {
                addNotification(`Bike with id ${id}${cascade ? " and related data" : ""} deleted successfully`, "success");
                await refreshData();
                if (cascade) setShowCascadeDialog(false);
            })
            .catch((err) => {
                if (err?.status === 409 && !cascade) {
                    setShowCascadeDialog(true);
                    setDeleteId(id);
                    return;
                }
                addNotification(`Failed to delete bike${err?.message ? `: ${err.message}` : ""}`, "error")
            })
            .finally(() => {
                if (cascade) {
                    setIsLoadingDeleteCascade(false);
                } else {
                    setLoadingDeleteId(null);
                }
            });
    };

    const handleDelete = (event: React.MouseEvent, id: number) => {
        event.stopPropagation();
        deleteBike(id);
    };

    const handleCascadeDelete = () => {
        if (deleteId !== null) {
            deleteBike(deleteId, true);
        }
    };

    const handleCancelDelete = () => {
        setShowCascadeDialog(false);
    };

    const columns: CustomColumnDef<BikeWithModelName>[] = [
        {
            accessorKey: "id",
            header: t("label.id"),
            widthPercent: 5,
        },
        {
            accessorKey: "model_name",
            header: t("label.model_name"),
            widthPercent: 25,
        },
        {
            accessorKey: "serial_number",
            header: t("label.serial_number"),
            widthPercent: 15,
            mobileTitle: true,
        },
        {
            accessorKey: "production_date",
            header: t("label.production_date"),
            widthPercent: 20,
            cell: ({row}) => {
                const date = new Date(row.getValue("production_date"))
                return date.toLocaleDateString()
            },
        },
        {
            accessorKey: "quantity",
            header: t("label.quantity"),
            widthPercent: 10,
        },
        {
            accessorKey: "warehouse_location",
            header: t("label.warehouse_location"),
            widthPercent: 20,
        },
        {
            id: "actions",
            enableHiding: false,
            widthPercent: 5,
            cell: ({row}) => {
                const bike: BikeWithModelName = row.original

                return (
                    <ButtonLoading
                        onClick={(event) => handleDelete(event, bike.id!)}
                        isLoading={loadingDeleteId === bike.id}
                        className="text-black dark:text-white p-2 rounded"
                        variant="destructive"
                        disabled={isRoleUserForProject(bike.project_id)}
                    >
                        <Trash2 className="w-5 h-5"/>
                    </ButtonLoading>
                )
            },
        },
    ]

    const filters: FilterDefinition[] = React.useMemo(() => {
        if (!itemsLoaderOptions) return [];
        const bikeFilterLoader = createBikeFilterItemLoader(itemsLoaderOptions);

        return [
            bikeFilterLoader("id", {pinned: false, type: "search"}),
            bikeFilterLoader("model_name", {type: "search"}),
            bikeFilterLoader("serial_number", {type: "search"}),
            bikeFilterLoader("production_date", {type: "date"}),
            bikeFilterLoader("quantity", {pinned: false, type: "search"}),
            bikeFilterLoader("warehouse_location", {type: "search"}),
        ];
    }, [itemsLoaderOptions]);

    return (
        <ContentLayout title={t("menu.warehouse")}>
            <DataTable
                title={t("menu.warehouse")}
                columns={columns}
                data={data}
                itemsLoader={itemsLoader}
                totalCount={totalCount}
                filterDefinition={filters}
                rowDialogContent={(rowData, onClose) => (
                    <BikeDialogContent
                        rowData={rowData}
                        onClose={onClose}
                        onRefresh={refreshData}
                    />
                )}
                addDialogContent={(onClose) => (
                    <BikeDialogContent
                        onClose={onClose}
                        onRefresh={refreshData}
                    />
                )}
            />
            {showCascadeDialog && (
                <Dialog open={showCascadeDialog} onOpenChange={() => setShowCascadeDialog(false)}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle className="text-center">
                                {t("delete_references.info")}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="grid">
                            <div className="flex justify-center space-x-4">
                                <Button
                                    variant="outline"
                                    onClick={handleCancelDelete}
                                    className="w-[40%]"
                                >
                                    {t("button.cancel")}
                                </Button>
                                <ButtonLoading
                                    isLoading={isLoadingDeleteCascade}
                                    onClick={handleCascadeDelete}
                                    className="w-[40%]"
                                    variant="destructive"
                                >
                                    {t("delete_references.button")}
                                </ButtonLoading>
                            </div>
                        </div>
                    </DialogContent>

                </Dialog>
            )}
        </ContentLayout>
    );
}
