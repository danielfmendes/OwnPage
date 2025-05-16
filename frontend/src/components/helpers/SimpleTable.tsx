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
import { Skeleton } from "@/components/ui/skeleton";
import * as React from "react";
import {useTranslation} from "react-i18next";

interface SimpleTableProps<TData> {
    data: TData[];
    columns: ColumnDef<TData>[];
    onRowClick?: (row: any) => void;
    isLoading?: boolean;
    noHeaders?: boolean;
    table?: any;
}

export function SimpleTable<TData>({ data, columns, onRowClick, isLoading = false, noHeaders = false, table }: SimpleTableProps<TData>) {
    const {t} = useTranslation();
    const tableReact = table ? table : useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="rounded-md border">
            <Table>
                {!noHeaders && (
                    <TableHeader>
                        {tableReact.getHeaderGroups().map((headerGroup: any) => (
                            <TableRow key={headerGroup.id} className="border-zinc-900 dark:border-zinc-500">
                                {headerGroup.headers.map((header: any) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                )}
                <TableBody>
                    {isLoading ? (
                        Array.from({ length: 10 }).map((_, index) => (
                            <TableRow key={index} className="cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 border-zinc-900 dark:border-zinc-500">
                                {columns.map((_, colIndex) => (
                                    <TableCell key={colIndex}>
                                        <Skeleton className="h-6 w-full" />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : data?.length ? (
                        tableReact.getRowModel().rows.map((row: any) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                                onClick={() => onRowClick ? onRowClick(row) : undefined }
                                className="cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 border-zinc-900 dark:border-zinc-500"
                            >
                                {row.getVisibleCells().map((cell: any) => (
                                    <TableCell key={cell.id} >
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
    );
}
