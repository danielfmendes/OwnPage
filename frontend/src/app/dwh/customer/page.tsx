"use client";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import DataTable from "@/components/helpers/Table";
import * as React from "react";
import {useNotification} from "@/components/helpers/NotificationProvider";
import AuthToken from "@/utils/authtoken";
import {RoleManagementWithName} from "@/types/custom";
import {useRoleStore} from "@/utils/rolemananagemetstate";
import apiUrl, {fetchWithToken} from "@/utils/url";
import type {ColumnDef} from "@tanstack/react-table";
import {Button} from "@/components/ui/button";
import {ArrowUpDown, Trash2} from "lucide-react";
import {ButtonLoading} from "@/components/helpers/ButtonLoading";
import {Customer} from "@/types/datatables";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import CustomerDetailContent from "@/app/dwh/customer/customer-detail-content";
import AddCustomerContent from "@/app/dwh/customer/add-customer-content";

export default function CustomerPage() {
    const {addNotification} = useNotification();
    const token = AuthToken.getAuthToken();
    const roles: RoleManagementWithName[] = useRoleStore((state) => state.roles);
    const [data, setData] = React.useState<Customer[]>([]);
    const [isLoadingData, setIsLoadingData] = React.useState(true);
    const [loadingDeleteId, setLoadingDeleteId] = React.useState<number | null>(null);
    const [isLoadingDeleteCascade, setIsLoadingDeleteCascade] = React.useState(false);
    const [showCascadeDialog, setShowCascadeDialog] = React.useState(false);
    const [deleteId, setDeleteId] = React.useState<number | null>(null);

    const fetchData = React.useCallback(() => {
        setIsLoadingData(true);
        fetchWithToken(`/customers`)
            .then((res) => res.json())
            .then((customers: Customer[]) => setData(customers))
            .catch(err => addNotification(`Error loading customer: ${err}`, "error"))
            .finally(() => setIsLoadingData(false));
    }, [addNotification]);

    const deleteCustomer = (id: number, cascade: boolean = false) => {
        if (cascade) {
            setIsLoadingDeleteCascade(true);
        } else {
            setLoadingDeleteId(id);
        }

        fetch(`${apiUrl}/customers?id=${id}${cascade ? "&cascade=true" : ""}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
            .then((res) => {
                if (res.status === 409 && !cascade) {
                    setShowCascadeDialog(true);
                    setDeleteId(id);
                    return;
                }
                if (!res.ok) throw new Error("Fehler beim Löschen");
                addNotification(`Teilelager mit id ${id}${cascade ? " und referenzierten Werten" : ""} erfolgreich gelöscht`, "success");
                fetchData();
                if (cascade) setShowCascadeDialog(false);
            })
            .catch((err) => addNotification(`Löschfehler: ${err}`, "error"))
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
            header: "First Name",
        },
        {
            accessorKey: "name",
            header: "Name",
        },
        {
            accessorKey: "email",
            header: ({column}) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Email <ArrowUpDown className="ml-2 h-4 w-4"/>
                </Button>
            ),
        },
        {
            accessorKey: "dob",
            header: "Date of Birth",
            cell: ({row}) => {
                const date = new Date(row.getValue("dob"))
                return date.toLocaleDateString()
            },
        },
        {
            accessorKey: "location",
            header: "Location",
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
        <ContentLayout title="Kundendaten">
            <DataTable
                title="Kundendaten"
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
                                Willst du auch die referenzierten Werte löschen?
                            </DialogTitle>
                        </DialogHeader>
                        <div className="grid">
                            <div className="flex justify-center space-x-4">
                                <Button
                                    variant="outline"
                                    onClick={handleCancelDelete}
                                    className="w-[40%]"
                                >
                                    Abbrechen
                                </Button>
                                <ButtonLoading
                                    isLoading={isLoadingDeleteCascade}
                                    onClick={handleCascadeDelete}
                                    className="w-[40%]"
                                    variant="destructive"
                                >
                                    Lösche Referenzen
                                </ButtonLoading>
                            </div>
                        </div>
                    </DialogContent>

                </Dialog>
            )}
        </ContentLayout>
    );
}
