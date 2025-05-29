import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    ColumnDef,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {Skeleton} from "@/components/ui/skeleton";
import * as React from "react";
import {useTranslation} from "react-i18next";

interface SimpleTableProps<TData> {
    data: TData[];
    columns: ColumnDef<TData>[];
    onRowClick?: (row: any) => void;
    isLoading?: boolean;
    headers?: React.ReactNode;
    table?: any;
    showFixedItems?: number;
}

export function SimpleTable<TData>({
                                       data,
                                       columns,
                                       onRowClick,
                                       isLoading = false,
                                       headers,
                                       table,
                                       showFixedItems = 10,
                                   }: SimpleTableProps<TData>) {
    const {t} = useTranslation();

    const tableReact = table ?? useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const visibleRows = tableReact.getRowModel().rows;
    const shouldScroll = data.length > showFixedItems;

    const scrollRef = React.useRef<HTMLDivElement>(null);

    // Scroll beim Ändern von data nach oben setzen
    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
    }, [data]);

    return (
        <div className="rounded-md border">
            <div className="w-full overflow-x-auto">
                <Table>
                    <TableHeader className="sticky top-0 z-10 bg-white dark:bg-zinc-900">
                        {headers ? (
                            headers
                        ) : (
                            tableReact.getHeaderGroups().map((headerGroup: any) => (
                                <TableRow key={headerGroup.id} className="border-zinc-900 dark:border-zinc-500">
                                    {headerGroup.headers.map((header: any) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableHeader>
                </Table>
            </div>

            <div ref={scrollRef}
                 className={`w-full overflow-x-auto ${shouldScroll ? "max-h-[529px] overflow-y-auto" : ""}`}>
                <Table>
                    <TableBody>
                        {isLoading ? (
                            Array.from({length: showFixedItems}).map((_, index) => (
                                <TableRow key={index}
                                          className="cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 border-zinc-900 dark:border-zinc-500">
                                    {columns.map((_, colIndex) => (
                                        <TableCell key={colIndex}>
                                            <Skeleton className="h-6 w-full"/>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : data?.length ? (
                            visibleRows.map((row: any) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    onClick={() => onRowClick?.(row)}
                                    className="cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 border-zinc-900 dark:border-zinc-500"
                                >
                                    {row.getVisibleCells().map((cell: any) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    {t("placeholder.no_results")}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
