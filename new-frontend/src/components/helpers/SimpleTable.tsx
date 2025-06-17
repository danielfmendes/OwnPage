import React, {useState, useRef, useEffect} from "react";
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
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {ChevronDown, ChevronUp} from "lucide-react";
import {useTranslation} from "react-i18next";

interface SimpleTableProps<TData> {
    data: TData[];
    columns: any[];
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
    const tableReact = table ?? useReactTable({data, columns, getCoreRowModel: getCoreRowModel()});
    const visibleRows = tableReact.getRowModel().rows;
    const visibleColumnCount = tableReact.getVisibleFlatColumns().length;
    const scrollRef = useRef<HTMLDivElement>(null);

    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    useEffect(() => {
        scrollRef.current?.scrollTo({top: 0});
    }, [data]);

    const toggleExpanded = (id: string) => {
        setExpandedRows((prev) => {
            const newSet = new Set(prev);
            newSet.has(id) ? newSet.delete(id) : newSet.add(id);
            return newSet;
        });
    };

    const actionsColIndex = columns.findIndex((col) => col.id === "actions");
    const titleCol = columns.find((col) => col.mobileTitle) ?? columns[0];

    return (
        <div className="rounded-md border">
            {/* Desktop View */}
            <div className="hidden sm:block w-full overflow-x-auto">
                <Table>
                    <TableHeader className="sticky top-0 z-10 bg-white dark:bg-zinc-900">
                        {headers
                            ? headers
                            : tableReact.getHeaderGroups().map((headerGroup: any) => (
                                <TableRow key={headerGroup.id} className="border-zinc-900 dark:border-zinc-500">
                                    {headerGroup.headers.map((header: any) => (
                                        <TableHead
                                            key={header.id}
                                            style={{
                                                width: `${header.column.columnDef.widthPercent ?? (100 / visibleColumnCount)}%`,
                                            }}
                                        >
                                            {!header.isPlaceholder && flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                    </TableHeader>
                </Table>

                <div
                    ref={scrollRef}
                    className="w-full overflow-y-auto"
                    style={{maxHeight: `${maxHeight ?? 529}px`}}
                >
                    <Table>
                        <TableBody>
                            {isLoading ? (
                                Array.from({length: 10}).map((_, idx) => (
                                    <TableRow key={idx} className="border-zinc-900 dark:border-zinc-500 hover:bg-muted">
                                        {columns.map((_, colIdx) => (
                                            <TableCell
                                                key={colIdx}
                                                style={{width: `${columns[colIdx].widthPercent ?? (100 / visibleColumnCount)}%`}}
                                            >
                                                <Skeleton className="h-6 w-full"/>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : data.length ? (
                                visibleRows.map((row: any) => (
                                    <TableRow
                                        key={row.id}
                                        onClick={() => onRowClick?.(row)}
                                        className="cursor-pointer border-zinc-900 dark:border-zinc-500 hover:bg-muted"
                                    >
                                        {row.getVisibleCells().map((cell: any) => (
                                            <TableCell
                                                key={cell.id}
                                                style={{width: `${cell.column.columnDef.widthPercent ?? (100 / visibleColumnCount)}%`}}
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

            {/* Mobile View */}
            <div className="block sm:hidden">
                {isLoading ? (
                    Array.from({length: 5}).map((_, idx) => (
                        <Card key={idx} className="rounded-none border-b last:border-0">
                            <CardContent className="p-4">
                                <Skeleton className="h-6 w-3/4 mb-2"/>
                                <Skeleton className="h-4 w-full"/>
                            </CardContent>
                        </Card>
                    ))
                ) : data.length ? (
                    data.map((row: any, index) => {
                        const isExpanded = expandedRows.has(row.id);
                        const title = row[titleCol.accessorKey ?? titleCol.id];
                        return (
                            <Card key={index} onClick={() => onRowClick?.({original: row})}
                                  className="rounded-none border-b last:border-0">
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 w-full">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleExpanded(row.id);
                                                }}
                                                className="h-6 w-6"
                                            >
                                                {isExpanded ? <ChevronUp className="w-4 h-4"/> :
                                                    <ChevronDown className="w-4 h-4"/>}
                                            </Button>
                                            <span className="font-medium truncate">{title}</span>
                                        </div>

                                        {actionsColIndex !== -1 &&
                                            flexRender(columns[actionsColIndex].cell, {
                                                row: {original: row},
                                            })}
                                    </div>

                                    {isExpanded && (
                                        <div className="text-sm space-y-1 text-muted-foreground">
                                            {columns
                                                .filter(
                                                    (col) =>
                                                        col.accessorKey &&
                                                        col.accessorKey !== titleCol.accessorKey &&
                                                        col.id !== "actions"
                                                )
                                                .map((col) => (
                                                    <div key={col.accessorKey ?? col.id}
                                                         className="flex justify-between">
                                                        <span
                                                            className="font-medium">{flexRender(col.header, {})}</span>
                                                        <span>{row[col.accessorKey ?? col.id]}</span>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })
                ) : (
                    <div className="text-center text-muted-foreground py-6">
                        {t("placeholder.no_results")}
                    </div>
                )}
            </div>
        </div>
    );
}
