"use client";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
    TooltipProvider,
} from "@/components/ui/tooltip";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import DataTable from "@/components/admin-panel/table";
import type {ColumnDef} from "@tanstack/react-table";
import {Button} from "@/components/ui/button";
import {ArrowUpDown, Trash2} from "lucide-react";
import * as React from "react";
import apiUrl, {fetchWithToken} from "@/app/config";
import WarehousePartEditDialogContent from "@/app/dwh/partsstorage/content-dialog";
import {WarehousePartWithName} from "@/types/custom";


export default function PartsStoragePage() {
    const token = localStorage.getItem("authToken");
    const [data, setData] = React.useState<WarehousePartWithName[]>([]);
    const [loading, setLoading] = React.useState(true);

    const fetchData = () => {
        setLoading(true);
        fetchWithToken(`/warehouseparts`)
            .then((res) => res.json())
            .then((warehouseparts: WarehousePartWithName[]) => {
                setData(warehouseparts);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error loading bikes:", err);
                setLoading(false);
            });
    };

    const handleDelete = (event: React.MouseEvent, id: number) => {
        event.stopPropagation();
        fetch(`${apiUrl}/warehouseparts?id=${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
            .then(res => {
                if (!res.ok) throw new Error("Fehler beim Löschen");
                fetchData();
            })
            .catch(err => console.error("Löschfehler:", err));
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
                warehousePart.id
                return (
                    <Button
                        onClick={(event) => handleDelete(event, warehousePart.id)}
                        className="bg-red-400 text-black dark:text-white p-2 rounded"
                    >
                        <Trash2 className="w-5 h-5" />
                    </Button>
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
                    isLoading={loading}
                    filterColumn={"storage_location"}
                    onRefresh={() => {
                        fetchData()
                    }}
                    rowDialogContent={(rowData, onClose) => (
                        <WarehousePartEditDialogContent
                            rowData={rowData}
                            onClose={onClose}
                            onRefresh={fetchData}
                        />
                    )}
                    addDialogContent={(onClose) => (
                        <WarehousePartEditDialogContent
                            onClose={onClose}
                            onRefresh={fetchData}
                        />
                )}
                />
            </TooltipProvider>
        </ContentLayout>
    );
}
