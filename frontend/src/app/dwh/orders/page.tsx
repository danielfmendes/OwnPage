"use client";
import {ContentLayout} from "@/components/admin-panel/content-layout";
import {useSidebar} from "@/hooks/use-sidebar";
import {useStore} from "@/hooks/use-store";
import DataTable from "@/components/helpers/Table";
import type {ColumnDef} from "@tanstack/react-table";
import {Button} from "@/components/ui/button";
import {ArrowUpDown, Trash2} from "lucide-react";
import * as React from "react";
import {deleteWithToken, fetchWithToken, handleFetchError} from "@/utils/url";
import {OrderWithCustomer, RoleManagementWithName} from "@/types/custom";
import {ButtonLoading} from "@/components/helpers/ButtonLoading";
import {useNotification} from "@/components/helpers/NotificationProvider";
import {useRoleStore} from "@/utils/rolemananagemetstate";
import OrderDialogContent from "@/app/dwh/orders/content-dialog";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Order} from "@/types/datatables";
import {useTranslation} from "react-i18next";


export default function OrderPage() {
    const {t} = useTranslation();
    const {addNotification} = useNotification();
    const roles: RoleManagementWithName[] = useRoleStore((state) => state.roles);
    const [data, setData] = React.useState<OrderWithCustomer[]>([]);
    const [isLoadingData, setIsLoadingData] = React.useState(true);
    const [loadingDeleteId, setLoadingDeleteId] = React.useState<number | null>(null);
    const [isLoadingDeleteCascade, setIsLoadingDeleteCascade] = React.useState(false);
    const [showCascadeDialog, setShowCascadeDialog] = React.useState(false);
    const [deleteId, setDeleteId] = React.useState<number | null>(null);

    const fetchData = () => {
        setIsLoadingData(true);
        fetchWithToken(`/orders`)
            .then((orders: OrderWithCustomer[]) => {
                setData(orders);
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

        deleteWithToken(`/orders?id=${id}${cascade ? "&cascade=true" : ""}`, true)
            .then(async (res) => {
                if (res.status === 409 && !cascade) {
                    setShowCascadeDialog(true);
                    setDeleteId(id);
                    return;
                }
                if (!res.ok) await handleFetchError(res, "DELETE");
                addNotification(`Order with id ${id}${cascade ? " and related data" : ""} deleted successfully`, "success");
                fetchData();
                if (cascade) setShowCascadeDialog(false);
            })
            .catch(err => addNotification(`Failed to delete order${err?.message ? `: ${err.message}` : ""}`, "error"))
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
                const roleForProject = roles.find(role => role.project_id === order.project_id);
                const isDisabled = roleForProject?.role === "user";

                return (
                    <ButtonLoading
                        onClick={(event) => handleDelete(event, order.id)}
                        isLoading={loadingDeleteId === order.id}
                        className="text-black dark:text-white p-2 rounded"
                        variant="destructive"
                        disabled={isDisabled}
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
                onRefresh={() => {
                    fetchData()
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
                                {t("delete_reference.info")}
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
