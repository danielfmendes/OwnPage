"use client";
import {ContentLayout} from "@/components/admin-panel/content-layout";
import {useSidebar} from "@/hooks/use-sidebar";
import {useStore} from "@/hooks/use-store";
import DataTable from "@/components/helpers/Table";
import * as React from "react";
import {useNotification} from "@/components/helpers/NotificationProvider";
import {RoleManagementWithName} from "@/types/custom";
import {useRoleStore} from "@/utils/rolemananagemetstate";
import {deleteWithToken, handleFetchError} from "@/utils/url";
import type {ColumnDef} from "@tanstack/react-table";
import {Button} from "@/components/ui/button";
import {ArrowUpDown, Trash2} from "lucide-react";
import {ButtonLoading} from "@/components/helpers/ButtonLoading";
import {Customer} from "@/types/datatables";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import CustomerDetailContent from "@/app/dwh/customer/customer-detail-content";
import AddCustomerContent from "@/app/dwh/customer/add-customer-content";
import {useTranslation} from "react-i18next";
import {CustomersService} from "@/models/api";
import FilterManager from "@/utils/filtermanager";

export default function CustomerPage() {
    const {t} = useTranslation();
    const {addNotification} = useNotification();
    const filterManager = new FilterManager();
    const roles: RoleManagementWithName[] = useRoleStore((state) => state.roles);
    const [data, setData] = React.useState<Customer[]>([]);
    const [isLoadingData, setIsLoadingData] = React.useState(true);
    const [loadingDeleteId, setLoadingDeleteId] = React.useState<number | null>(null);
    const [isLoadingDeleteCascade, setIsLoadingDeleteCascade] = React.useState(false);
    const [showCascadeDialog, setShowCascadeDialog] = React.useState(false);
    const [deleteId, setDeleteId] = React.useState<number | null>(null);

    const fetchData = React.useCallback(async () => {
        setIsLoadingData(true);
        CustomersService.getCustomers(
            await filterManager.toString()
        )
            .then((customers: Customer[]) => setData(customers))
            .catch(err => addNotification(`Failed to load customer${err?.message ? `: ${err.message}` : ""}`, "error"))
            .finally(() => setIsLoadingData(false));
    }, [addNotification]);

    const deleteCustomer = (id: number, cascade: boolean = false) => {
        if (cascade) {
            setIsLoadingDeleteCascade(true);
        } else {
            setLoadingDeleteId(id);
        }

        deleteWithToken(`/customers?id=${id}${cascade ? "&cascade=true" : ""}`, true)
            .then(async (res) => {
                if (res.status === 409 && !cascade) {
                    setShowCascadeDialog(true);
                    setDeleteId(id);
                    return;
                }
                if (!res.ok) await handleFetchError(res, "DELETE");
                addNotification(`Customer with id ${id}${cascade ? " and related data" : ""} deleted successfully`, "success");
                fetchData();
                if (cascade) setShowCascadeDialog(false);
            })
            .catch(err => addNotification(`Failed to delete customer${err?.message ? `: ${err.message}` : ""}`, "error"))
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
        deleteCustomer(id);
    };

    const handleCascadeDelete = () => {
        if (deleteId !== null) {
            deleteCustomer(deleteId, true);
        }
    };

    const handleCancelDelete = () => {
        setShowCascadeDialog(false);
    };

    const columns: ColumnDef<Customer>[] = [
        {
            accessorKey: "first_name",
            header: t("label.first_name"),
        },
        {
            accessorKey: "name",
            header: t("label.name"),
        },
        {
            accessorKey: "email",
            header: ({column}) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    {t("label.email")} <ArrowUpDown className="ml-2 h-4 w-4"/>
                </Button>
            ),
        },
        {
            accessorKey: "dob",
            header: t("dob"),
            cell: ({row}) => {
                const date = new Date(row.getValue("dob"))
                return date.toLocaleDateString()
            },
        },
        {
            accessorKey: "city",
            header: t("label.city"),
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({row}) => {
                const customer: Customer = row.original
                const roleForProject = roles.find(role => role.project_id === customer.project_id);
                const isDisabled = roleForProject?.role === "user";

                return (
                    <ButtonLoading
                        onClick={(event) => handleDelete(event, customer.id)}
                        isLoading={loadingDeleteId === customer.id}
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
        <ContentLayout title={t("customer.data")}>
            <DataTable
                title={t("label.dob")}
                columns={columns}
                data={data}
                isLoading={isLoadingData}
                filterColumn={"email"}
                onRefresh={() => {
                    fetchData()
                }}
                rowDialogContent={(rowData, onClose) => (
                    <CustomerDetailContent
                        rowData={rowData}
                        onClose={onClose}
                        onRefresh={fetchData}
                    />
                )}
                addDialogContent={(onClose) => (
                    <AddCustomerContent
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
                                    {t("delete_reference.button")}
                                </ButtonLoading>
                            </div>
                        </div>
                    </DialogContent>

                </Dialog>
            )}
        </ContentLayout>
    );
}
