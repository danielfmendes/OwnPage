"use client";
import {ContentLayout} from "@/components/admin-panel/content-layout";
import {useSidebar} from "@/hooks/use-sidebar";
import {useStore} from "@/hooks/use-store";
import DataTable from "@/components/helpers/Table";
import type {ColumnDef} from "@tanstack/react-table";
import {Button} from "@/components/ui/button";
import {ArrowUpDown, Trash2} from "lucide-react";
import * as React from "react";
import {Order, OrdersService, OrderWithCustomer} from "@/models/api";
import {ButtonLoading} from "@/components/helpers/ButtonLoading";
import {useNotification} from "@/components/helpers/NotificationProvider";
import OrderDialogContent from "@/app/dwh/orders/content-dialog";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {useTranslation} from "react-i18next";
import FilterManager from "@/utils/filtermanager";
import {isRoleUserForProject} from "@/utils/helpers";

export default function OrderPage() {
    const {t} = useTranslation();
    const {addNotification} = useNotification();
    const filterManager = new FilterManager();
    const [data, setData] = React.useState<OrderWithCustomer[]>([]);
    const [isLoadingData, setIsLoadingData] = React.useState(true);
    const [loadingDeleteId, setLoadingDeleteId] = React.useState<number | null>(null);
    const [isLoadingDeleteCascade, setIsLoadingDeleteCascade] = React.useState(false);
    const [showCascadeDialog, setShowCascadeDialog] = React.useState(false);
    const [deleteId, setDeleteId] = React.useState<number | null>(null);

    const fetchData = async () => {
        setIsLoadingData(true);
        const filterString = await filterManager.getFilterStringWithProjectIds();
        OrdersService.getOrders(filterString === "" ? undefined : filterString)
            .then((orders) => {
                const ordersWithCustomer = orders as OrderWithCustomer[];
                setData(ordersWithCustomer);
            })
            .catch(err => addNotification(`Failed to load orders${err?.message ? `: ${err.message}` : ""}`, "error"))
            .finally(() => setIsLoadingData(false));
    };

    const deleteOrder = (id: number, cascade: boolean = false) => {
        if (cascade) {
            setIsLoadingDeleteCascade(true);
        } else {
            setLoadingDeleteId(id);
        }

        OrdersService.deleteOrder(id, cascade)
            .then(async () => {
                addNotification(`Order with id ${id}${cascade ? " and related data" : ""} deleted successfully`, "success");
                await fetchData();
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

    const columns: ColumnDef<Order>[] = [
        {
            accessorKey: "customer_name",
            header: t("label.customer_name"),
        },
        {
            accessorKey: "customer_email",
            header: t("label.email"),
        },
        {
            accessorKey: "order_date",
            header: ({column}) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    {t("label.order_date")}<ArrowUpDown className="ml-2 h-4 w-4"/>
                </Button>
            ),
            cell: ({row}) => {
                const date = new Date(row.getValue("order_date"))
                return date.toLocaleDateString()
            },
        },
        {
            id: "actions",
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

    const sidebar = useStore(useSidebar, (x) => x);
    if (!sidebar) return null;

    return (
        <ContentLayout title={t("menu.orders")}>
            <DataTable
                title={t("menu.orders")}
                columns={columns}
                data={data}
                isLoading={isLoadingData}
                filterColumn={"customer_name"}
                onRefresh={async () => {
                    await fetchData()
                }}
                rowDialogContent={(rowData, onClose) => (
                    <OrderDialogContent
                        rowData={rowData}
                        onClose={onClose}
                        onRefresh={fetchData}
                    />
                )}
                addDialogContent={(onClose) => (
                    <OrderDialogContent
                        onClose={onClose}
                        onRefresh={fetchData}
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
