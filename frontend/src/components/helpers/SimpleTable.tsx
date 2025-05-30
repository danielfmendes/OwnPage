import {
    useReactTable,
    getCoreRowModel,
    flexRender,
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
import {CustomColumnDef} from "@/models/datatable/column";

interface SimpleTableProps<TData> {
    data: TData[];
    columns: CustomColumnDef<TData>[];
    onRowClick?: (row: any) => void;
    isLoading?: boolean;
    headers?: React.ReactNode;
    table?: any;
    maxHeight?: number;
}

export function SimpleTable<TData>({
                                       data,
                                       columns,
                                       onRowClick,
                                       isLoading = false,
                                       headers,
                                       table,
                                       maxHeight,
                                   }: SimpleTableProps<TData>) {
    const {t} = useTranslation();

    const tableReact = table ?? useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const visibleRows = tableReact.getRowModel().rows;

    const scrollRef = React.useRef<HTMLDivElement>(null);
    const visibleColumnCount = tableReact.getVisibleFlatColumns().length;

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
                                        <TableHead
                                            key={header.id}
                                            style={{
                                                width: `${header.column.columnDef.widthPercent ?? (100 / visibleColumnCount)}%`,
                                            }}
                                        >
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
                 className="w-full overflow-x-auto overflow-y-auto"
                 style={{ maxHeight: `${maxHeight ?? 529}px` }}
            >
                <Table>
                    <TableBody>
                        {isLoading ? (
                            Array.from({length: 10}).map((_, index) => (
                                <TableRow key={index}
                                          className="cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 border-zinc-900 dark:border-zinc-500">
                                    {columns.map((_, colIndex) => (
                                        <TableCell
                                            key={colIndex}
                                            style={{
                                                width: `${columns[colIndex].widthPercent ?? (100 / visibleColumnCount)}%`,
                                            }}
                                        >
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
                                        <TableCell
                                            key={cell.id}
                                            style={{
                                                width: `${cell.column.columnDef.widthPercent ?? (100 / visibleColumnCount)}%`,
                                            }}
                                        >
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
