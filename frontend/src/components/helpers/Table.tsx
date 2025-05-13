import * as React from "react"
import {Dialog} from "@/components/ui/dialog"
import {
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import {Plus} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {SimpleTable} from "@/components/helpers/SimpleTable";

interface DataTableProps {
    title?: string;
    columns: ColumnDef<any>[];
    data: any[];
    isLoading: boolean;
    filterColumn: string;
    onRefresh: () => void;
    noHeaders?: boolean;
    rowDialogContent?: (row: any, onClose: () => void) => React.ReactNode;
    addDialogContent?: (onClose: () => void) => React.ReactNode;
}

export default function DataTable({title, columns, data, isLoading, filterColumn, onRefresh, noHeaders, rowDialogContent, addDialogContent}: DataTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [isRowDialogOpen, setIsRowDialogOpen] = React.useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
    const [selectedRow, setSelectedRow] = React.useState<any>(null);

    const handleRowClick = (row: any) => {
        if (rowDialogContent) {
            setSelectedRow(row);
            setIsRowDialogOpen(true);
        }
    };

    const handleAddClick = () => {
        if (addDialogContent) {
            setIsAddDialogOpen(true);
        }
    };

    React.useEffect(() => {
        onRefresh();
    }, [])

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    // @ts-ignore
    return (
        <div className="mt-2 w-full p-4 border rounded-lg  border-zinc-900 dark:border-zinc-50">
            {title}
            <div className="flex items-center py-4">
                <Input
                    placeholder={`Filter ${filterColumn.replace(/_/g, ' ')} ...`}
                    value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn(filterColumn)?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm border-zinc-900 dark:border-zinc-50"
                />
                <Button
                    onClick={handleAddClick}
                    className="ml-auto bg-zinc-300 dark:bg-zinc-800 hover:bg-zinc-400 dark:hover:bg-zinc-600 text-zinc-800 dark:text-white"
                >
                    <Plus className="mr-2 h-4 w-4"/>
                    Add
                </Button>

            </div>
            <div className="rounded-md border border-zinc-900 dark:border-zinc-500">
                <SimpleTable table={table} data={data} isLoading={isLoading} columns={columns} onRowClick={handleRowClick} noHeaders={noHeaders}/>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                {table.getAllColumns().some(col => col.id === 'select') && (
                    <div className="flex-1 text-sm text-muted-foreground">
                        {table.getFilteredSelectedRowModel().rows.length} of{" "}
                        {table.getFilteredRowModel().rows.length} row(s) selected.
                    </div>
                )}
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={(data?.length ?? 0) === 0 || !table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={(data?.length ?? 0) === 0 || !table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
            <Dialog open={isRowDialogOpen} onOpenChange={setIsRowDialogOpen}>
                {selectedRow && rowDialogContent && rowDialogContent(selectedRow.original, () => setIsRowDialogOpen(false))}
            </Dialog>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                {addDialogContent && addDialogContent(() => setIsAddDialogOpen(false))}
            </Dialog>
        </div>
)
}
