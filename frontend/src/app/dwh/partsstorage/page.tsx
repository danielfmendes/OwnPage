"use client";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
    TooltipProvider,
} from "@/components/ui/tooltip";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import DataTable from "@/components/helpers/Table";
import type {ColumnDef} from "@tanstack/react-table";
import {Button} from "@/components/ui/button";
import {ArrowUpDown, Trash2} from "lucide-react";
import * as React from "react";
import apiUrl, {fetchWithToken} from "@/utils/url";
import WarehousePartDialogContent from "@/app/dwh/partsstorage/content-dialog";
import {WarehousePartWithName} from "@/types/custom";
import AuthToken from "@/utils/authtoken";
import {ButtonLoading} from "@/components/helpers/ButtonLoading";
import {useNotification} from "@/components/helpers/NotificationProvider";


export default function PartsStoragePage() {
    const {addNotification} = useNotification();
    const token = AuthToken.getAuthToken();
    const [data, setData] = React.useState<WarehousePartWithName[]>([]);
    const [isLoadingData, setIsLoadingData] = React.useState(true);
    const [loadingDeleteId, setLoadingDeleteId] = React.useState<number | null>(null);

    const fetchData = () => {
        setIsLoadingData(true);
        fetchWithToken(`/warehouseparts`)
            .then((res) => res.json())
            .then((warehouseparts: WarehousePartWithName[]) => {
                setData(warehouseparts);
            })
            .catch(err => addNotification(`Error isLoading warehouseparts: ${err}`, "error"))
            .finally(() => setIsLoadingData(false));
    };

    const handleDelete = (event: React.MouseEvent, id: number) => {
        event.stopPropagation();
        setLoadingDeleteId(id);
        fetch(`${apiUrl}/warehouseparts?id=${id}`, {
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

    const columns: ColumnDef<WarehousePartWithName>[] = [
        {
            accessorKey: "id",
            header: "ID",
        },
        {
            accessorKey: "part_type",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Part Type<ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
        {
            accessorKey: "part_name",
            header: "Part Name",
        },
        {
            accessorKey: "quantity",
            header: "Quantity",
        },
        {
            accessorKey: "storage_location",
            header: "Warehouse",
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const warehousePart:WarehousePartWithName = row.original
                return (
                    <ButtonLoading
                        onClick={(event) => handleDelete(event, warehousePart.id)}
                        isLoading={loadingDeleteId === warehousePart.id}
                        className="text-black dark:text-white p-2 rounded"
                        variant="destructive"
                    >
                        <Trash2 className="w-5 h-5" />
                    </ButtonLoading>
                )
            },
        },
    ]

    const sidebar = useStore(useSidebar, (x) => x);
    if (!sidebar) return null;

    return (
        <ContentLayout title="Teilelager">
            <TooltipProvider>
                <DataTable
                    title="Teilelager"
                    columns={columns}
                    data={data}
                    isLoading={isLoadingData}
                    filterColumn={"storage_location"}
                    onRefresh={() => {
                        fetchData()
                    }}
                    rowDialogContent={(rowData, onClose) => (
                        <WarehousePartDialogContent
                            rowData={rowData}
                            onClose={onClose}
                            onRefresh={fetchData}
                        />
                    )}
                    addDialogContent={(onClose) => (
                        <WarehousePartDialogContent
                            onClose={onClose}
                            onRefresh={fetchData}
                        />
                )}
                />
            </TooltipProvider>
        </ContentLayout>
    );
}
