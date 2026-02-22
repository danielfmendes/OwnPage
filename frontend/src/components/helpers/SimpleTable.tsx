import React, { useState, useRef, useEffect, useMemo } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

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
    const { t } = useTranslation();
    const tableReact = table ?? useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });
    const visibleRows = tableReact.getRowModel().rows;
    const visibleColumnCount = tableReact.getVisibleFlatColumns().length;
    const scrollRef = useRef<HTMLDivElement>(null);

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: 0 });
        setCurrentIndex(0);
    }, [data]);

    const actionsColIndex = useMemo(() => columns.findIndex((col) => col.id === "actions"), [columns]);
    const titleCol = useMemo(() => columns.find((col) => col.mobileTitle) ?? columns[0], [columns]);

    const prev = () => setCurrentIndex((i) => (i === 0 ? data.length - 1 : i - 1));
    const next = () => setCurrentIndex((i) => (i === data.length - 1 ? 0 : i + 1));

    const clickableClasses = onRowClick ? "cursor-pointer hover:bg-muted" : "";
    const clickableMobileClasses = onRowClick ? "hover:bg-muted/20 transition-colors cursor-pointer" : "";
    const noHeaderKeys = ["email", "customer_email", "project_name"];

    const renderCellContent = (col: any, rowData: any, hideHeaderKeys: string[] = []) => {
        const key = col.accessorKey ?? col.id;
        const showHeader = !hideHeaderKeys.includes(key);

        const context = {
            row: {
                getValue: (k: string) => rowData[k],
                original: rowData,
            },
        };

        const header = showHeader ? flexRender(col.header, {}) : null;
        const content = col.cell ? flexRender(col.cell, context) : rowData[key];

        return { header, content };
    };

    const renderTitle = (row: any) => {
        const { header, content } = renderCellContent(titleCol, row, noHeaderKeys);
        return (
            <span className="font-medium text-base truncate">
                {header && <span className="text-muted-foreground mr-1">{header}:</span>}{" "}
                {content}
            </span>
        );
    };

    const renderMobileColumnDetails = (rowData: any) => {
        return (
            <div className="grid gap-2 text-sm">
                {columns
                    .filter(
                        (col) =>
                            col.accessorKey &&
                            col.accessorKey !== titleCol.accessorKey &&
                            col.id !== "actions"
                    )
                    .map((col) => {
                        const { header, content } = renderCellContent(col, rowData);
                        return (
                            <div
                                key={col.accessorKey ?? col.id}
                                className="flex justify-between items-start py-1 border-b last:border-0"
                            >
                                <span className="font-medium text-muted-foreground">{header}</span>
                                <span className="text-right">{content}</span>
                            </div>
                        );
                    })}
            </div>
        );
    };


    return (
        <div className="rounded-md sm:border">
            {/* Desktop View */}
            <div className="hidden sm:block w-full overflow-x-auto rounded-md">
                <Table>
                    <TableHeader className="sticky top-0 z-10 bg-muted/50 shadow-sm border-b">
                        {headers
                            ? headers
                            : tableReact.getHeaderGroups().map((headerGroup: any) => (
                                <TableRow key={headerGroup.id} className="hover:bg-transparent">
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
                    style={{ height: maxHeight !== undefined ? `${maxHeight}px` : "calc(100vh - 430px)" }}
                >
                    <Table>
                        <TableBody className={`transition-opacity duration-500 ${isLoading ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
                            {isLoading && data.length === 0 ? (
                                Array.from({ length: 10 }).map((_, idx) => (
                                    <TableRow key={idx} className="hover:bg-muted">
                                        {columns.map((_, colIdx) => (
                                            <TableCell
                                                key={colIdx}
                                                style={{ width: `${columns[colIdx].widthPercent ?? (100 / visibleColumnCount)}%` }}
                                            >
                                                <Skeleton className="h-6 w-full" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : data.length ? (
                                <>
                                    {visibleRows.map((row: any) => (
                                        <TableRow
                                            key={row.id}
                                            onClick={onRowClick ? () => onRowClick(row) : undefined}
                                            className={`transition-all duration-200 ${clickableClasses}`}
                                            style={{ animation: "fadeInRow 0.3s ease both" }}
                                        >
                                            {row.getVisibleCells().map((cell: any) => (
                                                <TableCell
                                                    key={cell.id}
                                                    style={{ width: `${cell.column.columnDef.widthPercent ?? (100 / visibleColumnCount)}%` }}
                                                >
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </>
                            ) : (
                                <TableRow className="hover:bg-transparent">
                                    <TableCell colSpan={columns.length} className="h-48 text-center p-0">
                                        <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
                                            <div className="rounded-full bg-muted p-4">
                                                <SearchX className="w-7 h-7" />
                                            </div>
                                            <p className="text-sm font-semibold text-foreground">{t("placeholder.no_results")}</p>
                                            <p className="text-xs">{t("placeholder.no_results_hint")}</p>
                                        </div>
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
                    Array.from({ length: 5 }).map((_, idx) => (
                        <div key={idx} className="rounded-lg border p-4 bg-muted/10">
                            <Skeleton className="h-6 w-3/4 mb-3" />
                            <div className="space-y-2">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} className="h-4 w-full" />
                                ))}
                            </div>
                        </div>
                    ))
                ) : data.length ? (
                    singleData ? (
                        // Single-Element-Modus with Navigation
                        <div className="flex flex-col items-center space-y-2">
                            <div
                                onClick={onRowClick ? () => onRowClick({ original: data[currentIndex] }) : undefined}
                                className={`w-full rounded-lg border px-4 py-3 bg-muted/5 ${clickableMobileClasses}`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    {renderTitle(data[currentIndex])}
                                    {actionsColIndex !== -1 &&
                                        flexRender(columns[actionsColIndex].cell, {
                                            row: { original: data[currentIndex] },
                                        })}
                                </div>
                                {renderMobileColumnDetails(data[currentIndex])}
                            </div>

                            {/* Navigation Buttons */}
                            <div className="flex items-center space-x-4 mt-2">
                                <Button variant="outline" onClick={prev} aria-label="Previous">
                                    <ChevronLeft size={20} />
                                </Button>
                                <span className="min-w-[2rem] text-center">
                                    {currentIndex + 1} / {data.length}
                                </span>
                                <Button variant="outline" onClick={next} aria-label="Next">
                                    <ChevronRight size={20} />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        // Standard Mobile View (List)
                        data.map((row: any, index) => (
                            <div
                                key={index}
                                onClick={onRowClick ? () => onRowClick({ original: row }) : undefined}
                                className={`rounded-lg border px-4 py-3 bg-muted/5 ${clickableMobileClasses}`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    {renderTitle(row)}
                                    {actionsColIndex !== -1 &&
                                        flexRender(columns[actionsColIndex].cell, {
                                            row: { original: row },
                                        })}
                                </div>
                                {renderMobileColumnDetails(row)}
                            </div>
                        ))
                    )
                ) : (
                    <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
                        <div className="rounded-full bg-muted p-4">
                            <SearchX className="w-7 h-7" />
                        </div>
                        <p className="text-sm font-semibold text-foreground">{t("placeholder.no_results")}</p>
                        <p className="text-xs">{t("placeholder.no_results_hint")}</p>
                    </div>
                )}
            </div>
        </div>
    );
}