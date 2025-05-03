"use client";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
    TooltipProvider,
} from "@/components/ui/tooltip";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import DataTable from "@/components/admin-panel/table";
import type {ColumnDef} from "@tanstack/react-table";
import {Checkbox} from "@/components/ui/checkbox";
import {Button} from "@/components/ui/button";
import {ArrowUpDown, MoreHorizontal} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import * as React from "react";
import {fetchWithToken} from "@/app/config";
import {Bike} from "@/types/datatables";

const columns: ColumnDef<Bike>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "model_id",
        header: "Model ID",
    },
    {
        accessorKey: "serial_number",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Serial Number <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
    },
    {
        accessorKey: "production_date",
        header: "Production Date",
        cell: ({ row }) => {
            const date = new Date(row.getValue("production_date"))
            return date.toLocaleDateString()
        },
    },
    {
        accessorKey: "warehouse_location",
        header: "Warehouse",
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const bike = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(String(bike.serial_number))}
                        >
                            Copy Serial Number
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View details</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

export default function PartsStoragePage() {
    const sidebar = useStore(useSidebar, (x) => x);

    const [data, setData] = React.useState<Bike[]>([]);
    const [loading, setLoading] = React.useState(true);

    const fetchData = () => {
        setLoading(true);
        fetchWithToken(`/bikes`)
            .then((res) => res.json())
            .then((bikes: Bike[]) => {
                setData(bikes);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error loading bikes:", err);
                setLoading(false);
            });
    };

    if (!sidebar) return null;

    return (
        <ContentLayout title="Warenlager">
            <TooltipProvider>
                <DataTable
                    title="Warenlager"
                    columns={columns}
                    data={data}
                    isLoading={loading}
                    filterColumn={"serial_number"}
                    onRefresh={() => {
                        fetchData()
                    }}
                />
            </TooltipProvider>
        </ContentLayout>
    );
}
