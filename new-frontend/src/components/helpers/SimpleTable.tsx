import React, {useState, useRef, useEffect, useMemo} from "react";
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
import {ChevronLeft, ChevronRight} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useTranslation} from "react-i18next";

interface SimpleTableProps<TData> {
    data: TData[];
    columns: any[];
    onRowClick?: (row: any) => void;
    isLoading?: boolean;
    headers?: React.ReactNode;
    table?: any;
    maxHeight?: number;
    singleData?: boolean;
}

export function SimpleTable<TData>({
                                       data,
                                       columns,
                                       onRowClick,
                                       isLoading = false,
                                       headers,
                                       table,
                                       maxHeight,
                                       singleData = false,
                                   }: SimpleTableProps<TData>) {
    const {t} = useTranslation();
    const tableReact = table ?? useReactTable({data, columns, getCoreRowModel: getCoreRowModel()});
    const visibleRows = tableReact.getRowModel().rows;
    const visibleColumnCount = tableReact.getVisibleFlatColumns().length;
    const scrollRef = useRef<HTMLDivElement>(null);

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        scrollRef.current?.scrollTo({top: 0});
        setCurrentIndex(0);
    }, [data]);

    const actionsColIndex = useMemo(() => columns.findIndex((col) => col.id === "actions"), [columns]);
    const titleCol = useMemo(() => columns.find((col) => col.mobileTitle) ?? columns[0], [columns]);

    const prev = () => setCurrentIndex((i) => (i === 0 ? data.length - 1 : i - 1));
    const next = () => setCurrentIndex((i) => (i === data.length - 1 ? 0 : i + 1));

    const clickableClasses = onRowClick ? "cursor-pointer hover:bg-muted" : "";
    const clickableMobileClasses = onRowClick ? "hover:bg-muted/20 transition-colors cursor-pointer" : "";

    // Helper to render mobile column details
    const renderMobileColumnDetails = (rowData: any) => (
        <div className="grid gap-2 text-sm">
            {columns
                .filter(
                    (col) =>
                        col.accessorKey &&
                        col.accessorKey !== titleCol.accessorKey &&
                        col.id !== "actions"
                )
                .map((col) => (
                    <div
                        key={col.accessorKey ?? col.id}
                        className="flex justify-between items-start py-1 border-b last:border-0"
                    >
                        <span className="font-medium text-muted-foreground">
                            {flexRender(col.header, {})}
                        </span>
                        <span className="text-right">
                            {rowData[col.accessorKey ?? col.id]}
                        </span>
                    </div>
                ))}
        </div>
    );

    return (
        <div className="rounded-md sm:border">
            {/* Desktop View */}
            <div className="hidden sm:block w-full overflow-x-auto rounded-md">
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
                                    <TableRow key={idx} className="hover:bg-muted">
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
                                        onClick={onRowClick ? () => onRowClick(row) : undefined}
                                        className={clickableClasses}
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
            <div className="block sm:hidden space-y-2 mt-2">
                {isLoading ? (
                    Array.from({length: 5}).map((_, idx) => (
                        <div key={idx} className="rounded-lg border p-4 bg-muted/10">
                            <Skeleton className="h-6 w-3/4 mb-3"/>
                            <div className="space-y-2">
                                {Array.from({length: 3}).map((_, i) => (
                                    <Skeleton key={i} className="h-4 w-full"/>
                                ))}
                            </div>
                        </div>
                    ))
                ) : data.length ? (
                    singleData ? (
                        // Single-Element-Modus with Navigation
                        <div className="flex flex-col items-center space-y-2">
                            <div
                                onClick={onRowClick ? () => onRowClick({original: data[currentIndex]}) : undefined}
                                className={`w-full rounded-lg border px-4 py-3 bg-muted/5 ${clickableMobileClasses}`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                      <span className="font-medium text-base truncate">
                                        {(data[currentIndex] as any)[titleCol.accessorKey ?? titleCol.id]}
                                      </span>
                                    {actionsColIndex !== -1 &&
                                        flexRender(columns[actionsColIndex].cell, {
                                            row: {original: data[currentIndex]},
                                        })}
                                </div>
                                {renderMobileColumnDetails(data[currentIndex])}
                            </div>

                            {/* Navigation Buttons */}
                            <div className="flex items-center space-x-4 mt-2">
                                <Button
                                    variant="outline"
                                    onClick={prev}
                                    aria-label="Previous"
                                >
                                    <ChevronLeft size={20}/>
                                </Button>
                                <span className="min-w-[2rem] text-center">
                                  {currentIndex + 1} / {data.length}
                                </span>
                                <Button
                                    onClick={next}
                                    variant="outline"
                                    aria-label="Next"
                                >
                                    <ChevronRight size={20}/>
                                </Button>
                            </div>
                        </div>
                    ) : (
                        // Standard Mobile View (List)
                        data.map((row: any, index) => {
                            const titleValue = row[titleCol.accessorKey ?? titleCol.id];
                            return (
                                <div
                                    key={index}
                                    onClick={onRowClick ? () => onRowClick({original: row}) : undefined}
                                    className={`rounded-lg border px-4 py-3 bg-muted/5 ${clickableMobileClasses}`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-medium text-base truncate">{titleValue}</span>
                                        {actionsColIndex !== -1 &&
                                            flexRender(columns[actionsColIndex].cell, {
                                                row: {original: row},
                                            })}
                                    </div>
                                    {renderMobileColumnDetails(row)}
                                </div>
                            );
                        })
                    )
                ) : (
                    <div className="text-center text-muted-foreground py-6">
                        {t("placeholder.no_results")}
                    </div>
                )}
            </div>
        </div>
    );
}