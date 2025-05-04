"use client";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
    TooltipProvider,
} from "@/components/ui/tooltip";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import DataTable from "@/components/helpers/Table";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Trash2 } from "lucide-react";
import * as React from "react";
import apiUrl, { fetchWithToken } from "@/utils/url";
import { useNotification } from "@/components/helpers/NotificationProvider";
import { ButtonLoading } from "@/components/helpers/ButtonLoading";
import AuthToken from "@/utils/authtoken";
import BikeDialogContent from "@/app/dwh/warehouse/content-dialog";
import { BikeWithModelName } from "@/types/custom";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";

export default function PartsStoragePage() {
    const { addNotification } = useNotification();
    const token = AuthToken.getAuthToken();
    const [data, setData] = React.useState<BikeWithModelName[]>([]);
    const [isLoadingData, setIsLoadingData] = React.useState(true);
    const [loadingDeleteId, setLoadingDeleteId] = React.useState<number | null>(null);
    const [isLoadingDeleteCascade, setIsLoadingDeleteCascade] = React.useState(false);
    const [showCascadeDialog, setShowCascadeDialog] = React.useState(false);
    const [deleteId, setDeleteId] = React.useState<number | null>(null);

    const fetchData = React.useCallback(() => {
        setIsLoadingData(true);
        fetchWithToken(`/bikes`)
            .then((res) => res.json())
            .then((bikes: BikeWithModelName[]) => setData(bikes))
            .catch(err => addNotification(`Error loading bikes: ${err}`, "error"))
            .finally(() => setIsLoadingData(false));
    }, [addNotification]);

    const deleteBike = (id: number, cascade: boolean = false) => {
        if (cascade) {
            setIsLoadingDeleteCascade(true);
        } else {
            setLoadingDeleteId(id);
        }

        fetch(`${apiUrl}/bikes?id=${id}${cascade ? "&cascade=true" : ""}`, {
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

    const columns: ColumnDef<BikeWithModelName>[] = [
        {
            accessorKey: "id",
            header: "ID",
        },
        {
            accessorKey: "model_name",
            header: "Model Name",
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
            accessorKey: "quantity",
            header: "Quantity",
        },
        {
            accessorKey: "warehouse_location",
            header: "Warehouse",
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const bike: BikeWithModelName = row.original
                return (
                    <ButtonLoading
                        onClick={(event) => handleDelete(event, bike.id)}
                        isLoading={loadingDeleteId === bike.id}
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
        <ContentLayout title="Warenlager">
            <TooltipProvider>
                <DataTable
                    title="Warenlager"
                    columns={columns}
                    data={data}
                    isLoading={isLoadingData}
                    filterColumn={"serial_number"}
                    onRefresh={() => {
                        fetchData()
                    }}
                    rowDialogContent={(rowData, onClose) => (
                        <BikeDialogContent
                            rowData={rowData}
                            onClose={onClose}
                            onRefresh={fetchData}
                        />
                    )}
                    addDialogContent={(onClose) => (
                        <BikeDialogContent
                            onClose={onClose}
                            onRefresh={fetchData}
                        />
                    )}
                />
            </TooltipProvider>
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
