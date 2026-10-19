import React, { useState, useRef, useEffect, useMemo } from "react";
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    type CellContext,
    type Table as TanstackTable,
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
import type { CustomColumnDef } from "@/models/datatable/column";

interface SimpleTableProps<TData> {
    data: TData[];
    columns: CustomColumnDef<TData>[];
    onRowClick?: (row: { original: TData }) => void;
    isLoading?: boolean;
    headers?: React.ReactNode;
    table?: TanstackTable<TData>;
    maxHeight?: number;
    singleData?: boolean;
}

// Column configs are plain objects; these read the optional fields without assuming the column kind
const accessorKeyOf = (col: object): string | undefined =>
    "accessorKey" in col && typeof col.accessorKey === "string" ? col.accessorKey : undefined;

const widthOf = (col: object): number | undefined =>
    "widthPercent" in col && typeof col.widthPercent === "number" ? col.widthPercent : undefined;

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
    // Always called (also when `table` is passed) so hook order never changes between renders.
    // TanStack's table API cannot be memoized by the React Compiler; rendering is unaffected.
    // eslint-disable-next-line react-hooks/incompatible-library
    const internalTable = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });
    const tableReact = table ?? internalTable;
    const visibleRows = tableReact.getRowModel().rows;
    const visibleColumnCount = tableReact.getVisibleFlatColumns().length;
    const scrollRef = useRef<HTMLDivElement>(null);

    const [currentIndex, setCurrentIndex] = useState(0);
    // Reset to the first item when the data changes (state is adjusted during render, not in an effect)
    const [shownData, setShownData] = useState(data);
    if (shownData !== data) {
        setShownData(data);
        setCurrentIndex(0);
    }

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: 0 });
    }, [data]);

    const actionsColIndex = useMemo(() => columns.findIndex((col) => col.id === "actions"), [columns]);
    const titleCol = useMemo(() => columns.find((col) => col.mobileTitle) ?? columns[0], [columns]);

    const prev = () => setCurrentIndex((i) => (i === 0 ? data.length - 1 : i - 1));
    const next = () => setCurrentIndex((i) => (i === data.length - 1 ? 0 : i + 1));

    const clickableClasses = onRowClick ? "cursor-pointer hover:bg-muted" : "";
    const clickableMobileClasses = onRowClick ? "hover:bg-muted/20 transition-colors cursor-pointer" : "";
    const noHeaderKeys = ["email", "customer_email", "project_name"];

    // Cell renderers only read `row.original` and `row.getValue`, so that is all that is provided here
    const cellContext = (rowData: TData) =>
        ({
            row: {
                getValue: (k: string) => (rowData as Record<string, unknown>)[k],
                original: rowData,
            },
        }) as unknown as CellContext<TData, unknown>;

    const renderCellContent = (col: CustomColumnDef<TData>, rowData: TData, hideHeaderKeys: string[] = []) => {
        const key = accessorKeyOf(col) ?? col.id;
        const showHeader = !hideHeaderKeys.includes(key ?? "");

        const header = showHeader ? flexRender(col.header, {} as never) : null;
        const content = col.cell ? flexRender(col.cell, cellContext(rowData)) : ((rowData as Record<string, unknown>)[key ?? ""] as React.ReactNode);

        return { header, content };
    };

    const renderTitle = (row: TData) => {
        const { header, content } = renderCellContent(titleCol, row, noHeaderKeys);
        return (
            <span className="font-medium text-base truncate">
                {header && <span className="text-muted-foreground mr-1">{header}:</span>}{" "}
                {content}
            </span>
        );
    };

    const renderMobileColumnDetails = (rowData: TData) => {
        return (
            <div className="grid gap-2 text-sm">
                {columns
                    .filter(
                        (col) =>
                            accessorKeyOf(col) &&
                            accessorKeyOf(col) !== accessorKeyOf(titleCol) &&
                            col.id !== "actions"
                    )
                    .map((col) => {
                        const { header, content } = renderCellContent(col, rowData);
                        return (
                            <div
                                key={accessorKeyOf(col) ?? col.id}
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
                            : tableReact.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                                    {headerGroup.headers.map((header) => (
                                        <TableHead
                                            key={header.id}
                                            style={{
                                                width: `${widthOf(header.column.columnDef) ?? (100 / visibleColumnCount)}%`,
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
                                        {columns.map((col, colIdx) => (
                                            <TableCell
                                                key={colIdx}
                                                style={{ width: `${widthOf(col) ?? (100 / visibleColumnCount)}%` }}
                                            >
                                                <Skeleton className="h-6 w-full" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : data.length ? (
                                <>
                                    {visibleRows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            onClick={onRowClick ? () => onRowClick(row) : undefined}
                                            className={`transition-all duration-200 ${clickableClasses}`}
                                            style={{ animation: "fadeInRow 0.3s ease both" }}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell
                                                    key={cell.id}
                                                    style={{ width: `${widthOf(cell.column.columnDef) ?? (100 / visibleColumnCount)}%` }}
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
                                        flexRender(columns[actionsColIndex].cell, cellContext(data[currentIndex]))}
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
                        data.map((row, index) => (
                            <div
                                key={index}
                                onClick={onRowClick ? () => onRowClick({ original: row }) : undefined}
                                className={`rounded-lg border px-4 py-3 bg-muted/5 ${clickableMobileClasses}`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    {renderTitle(row)}
                                    {actionsColIndex !== -1 &&
                                        flexRender(columns[actionsColIndex].cell, cellContext(row))}
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
