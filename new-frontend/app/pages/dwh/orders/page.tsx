import DataTable from "@/components/helpers/Table";
import {type CustomColumnDef} from "@/models/datatable/column";
import {Button} from "@/components/ui/button";
import {Trash2} from "lucide-react";
import * as React from "react";
import {type Order, OrdersService, type OrderWithCustomer} from "@/models/api";
import {ButtonLoading} from "@/components/helpers/ButtonLoading";
import {useNotification} from "@/components/helpers/NotificationProvider";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {useTranslation} from "react-i18next";
import {isRoleUserForProject} from "@/utils/helpers";
import {genericItemsLoader, type ItemsLoaderOptions, useRefreshData} from "@/models/datatable/itemsLoader";
import {type FilterDefinition} from "@/components/helpers/FilterBar";
import {createOrdersFilterItemLoader} from "@/models/datatable/filterItemsLoader";
import ContentLayout from "@/components/layout/ContentLayout";
import OrderDialogContent from "@/pages/dwh/orders/content-dialog";

export default function OrderPage() {
    const {t} = useTranslation();
    const {addNotification} = useNotification();
    const refreshData = useRefreshData(itemsLoader);

    const [data, setData] = React.useState<OrderWithCustomer[]>([]);
    const [totalCount, setTotalCount] = React.useState<number>(0);
    const [loadingDeleteId, setLoadingDeleteId] = React.useState<number | null>(null);
    const [isLoadingDeleteCascade, setIsLoadingDeleteCascade] = React.useState(false);
    const [showCascadeDialog, setShowCascadeDialog] = React.useState(false);
    const [deleteId, setDeleteId] = React.useState<number | null>(null);
    const [itemsLoaderOptions, setItemsLoaderOptions] = React.useState<ItemsLoaderOptions | null>(null);

    async function itemsLoader(options: ItemsLoaderOptions): Promise<void> {
        setItemsLoaderOptions(options);
        return genericItemsLoader<OrderWithCustomer>(
            options,
            OrdersService.getOrders,
            setData,
            setTotalCount
        );
    }

    const deleteOrder = (id: number, cascade: boolean = false) => {
        if (cascade) {
            setIsLoadingDeleteCascade(true);
        } else {
            setLoadingDeleteId(id);
        }

        OrdersService.deleteOrder(id, cascade)
            .then(async () => {
                addNotification(`Order with id ${id}${cascade ? " and related data" : ""} deleted successfully`, "success");
                await refreshData();
                if (cascade) setShowCascadeDialog(false);
            })
            .catch((err) => {
                if (err?.status === 409 && !cascade) {
                    setShowCascadeDialog(true);
                    setDeleteId(id);
                    return;
                }
                addNotification(`Failed to delete order${err?.message ? `: ${err.message}` : ""}`, "error")
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
        deleteOrder(id);
    };

    const handleCascadeDelete = () => {
        if (deleteId !== null) {
            deleteOrder(deleteId, true);
        }
    };

    const handleCancelDelete = () => {
        setShowCascadeDialog(false);
    };

    const columns: CustomColumnDef<Order>[] = [
        {
            accessorKey: "customer_name",
            header: t("label.customer_name"),
            widthPercent: 30,
        },
        {
            accessorKey: "customer_email",
            header: t("label.customer_email"),
            widthPercent: 40,
            mobileTitle: true,
        },
        {
            accessorKey: "order_date",
            header: t("label.order_date"),
            widthPercent: 25,
            cell: ({row}) => {
                const date = new Date(row.getValue("order_date"))
                return date.toLocaleDateString()
            },
        },
        {
            id: "actions",
            widthPercent: 5,
            enableHiding: false,
            cell: ({row}) => {
                const order: Order = row.original

                return (
                    <ButtonLoading
                        onClick={(event) => handleDelete(event, order.id!)}
                        isLoading={loadingDeleteId === order.id}
                        className="text-black dark:text-white p-2 rounded"
                        variant="destructive"
                        disabled={isRoleUserForProject(order.project_id)}
                    >
                        <Trash2 className="w-5 h-5"/>
                    </ButtonLoading>
                )
            },
        },
    ]

    const filters: FilterDefinition[] = React.useMemo(() => {
        if (!itemsLoaderOptions) return [];
        const orderFilterLoader = createOrdersFilterItemLoader(itemsLoaderOptions);

        return [
            orderFilterLoader("customer_name", {pinned: false, type: "search"}),
            orderFilterLoader("customer_email", {type: "search"}),
            orderFilterLoader("order_date", {type: "date"}),
        ];
    }, [itemsLoaderOptions]);


    return (
        <ContentLayout title={t("menu.orders")}>
            <DataTable
                url="orders"
                title={t("menu.orders")}
                columns={columns}
                data={data}
                itemsLoader={itemsLoader}
                totalCount={totalCount}
                filterDefinition={filters}
                rowDialogContent={(rowData, onClose) => (
                    <OrderDialogContent
                        rowData={rowData}
                        onClose={onClose}
                        onRefresh={refreshData}
                    />
                )}
                addDialogContent={(onClose) => (
                    <OrderDialogContent
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

                                    {t("button.delete_ref")}
                                </ButtonLoading>
                            </div>
                        </div>
                    </DialogContent>

                </Dialog>
            )}
        </ContentLayout>
    );
}
