"use client";
import {ContentLayout} from "@/components/admin-panel/content-layout";
import {useSidebar} from "@/hooks/use-sidebar";
import {useStore} from "@/hooks/use-store";
import DataTable from "@/components/helpers/Table";
import type {ColumnDef} from "@tanstack/react-table";
import {Button} from "@/components/ui/button";
import {ArrowUpDown, Trash2} from "lucide-react";
import * as React from "react";
import apiUrl, {fetchWithToken} from "@/utils/url";
import {OrderOverview, RoleManagementWithName} from "@/types/custom";
import AuthToken from "@/utils/authtoken";
import {ButtonLoading} from "@/components/helpers/ButtonLoading";
import {useNotification} from "@/components/helpers/NotificationProvider";
import {useRoleStore} from "@/utils/rolemananagemetstate";
import OrderDialogContent from "@/app/dwh/orders/content-dialog";


export default function OrderPage() {
    const {addNotification} = useNotification();
    const token = AuthToken.getAuthToken();
    const roles: RoleManagementWithName[] = useRoleStore((state) => state.roles);
    const [data, setData] = React.useState<OrderOverview[]>([]);
    const [isLoadingData, setIsLoadingData] = React.useState(true);
    const [loadingDeleteId, setLoadingDeleteId] = React.useState<number | null>(null);

    const fetchData = () => {
        setIsLoadingData(true);
        fetchWithToken(`/orders`)
            .then((res) => res.json())
            .then((orders: OrderOverview[]) => {
                setData(orders);
            })
            .catch(err => addNotification(`Error isLoading orders: ${err}`, "error"))
            .finally(() => setIsLoadingData(false));
    };

    const handleDelete = (event: React.MouseEvent, id: number) => {
        event.stopPropagation();
        setLoadingDeleteId(id);
        fetch(`${apiUrl}/orders?id=${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
            .then(res => {
                if (!res.ok) throw new Error("Fehler beim Löschen");
                addNotification(`Teilelager mit id ${id} erfolgreich gelöscht`, "success");
                fetchData();
            })
            .catch(err => addNotification(`Löschfehler: ${err}`, "error"))
            .finally(() => setLoadingDeleteId(null));
    };

    const columns: ColumnDef<OrderOverview>[] = [
        {
            accessorKey: "customer_name",
            header: "Customer",
        },
        {
            accessorKey: "order_date",
            header: ({column}) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    OrderDate<ArrowUpDown className="ml-2 h-4 w-4"/>
                </Button>
            ),
            cell: ({row}) => {
                const date = new Date(row.getValue("order_date"))
                return date.toLocaleDateString()
            },
        },
        {
            accessorKey: "bike_model_name",
            header: "Bike Name",
        },
        {
            accessorKey: "number",
            header: "Number",
        },
        {
            accessorKey: "price",
            header: "Price",
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({row}) => {
                const order: OrderOverview = row.original
                const roleForProject = roles.find(role => role.project_id === order.project_id);
                const isDisabled = roleForProject?.role === "user";

                return (
                    <ButtonLoading
                        onClick={(event) => handleDelete(event, order.orderitem_id)}
                        isLoading={loadingDeleteId === order.orderitem_id}
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
        <ContentLayout title="Orders">
            <DataTable
                title="Orders"
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
        </ContentLayout>
    );
}
