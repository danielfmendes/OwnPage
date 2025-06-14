import * as React from "react";
import {Dialog} from "@/components/ui/dialog";
import {
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
    flexRender,
} from "@tanstack/react-table";
import {
    ArrowDown,
    ArrowUp,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Plus,
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {Button} from "@/components/ui/button";
import {SimpleTable} from "@/components/helpers/SimpleTable";
import {useTranslation} from "react-i18next";
import {defaultPageSize, Pagination} from "@/models/datatable/pagination";
import {TableHead, TableRow} from "@/components/ui/table";
import {Sort, SortDirection} from "@/models/datatable/sort";
import {type ItemsLoaderOptions} from "@/models/datatable/itemsLoader";
import {useNotification} from "@/components/helpers/NotificationProvider";
import {type CustomColumnDef} from "@/models/datatable/column";
import {FilterBar, type  FilterDefinition} from "./FilterBar";
import FilterManager from "@/utils/filtermanager";
import {useLocation, useNavigate} from "react-router-dom";

interface DataTableProps<TData> {
    title: string;
    columns: CustomColumnDef<TData>[];
    data: TData[];
    itemsLoader: (opts: ItemsLoaderOptions) => Promise<void>;
    totalCount: number;
    filterDefinition?: FilterDefinition[];
    rowDialogContent?: (row: any, onClose: () => void) => React.ReactNode;
    addDialogContent?: (onClose: () => void) => React.ReactNode;
}

export default function DataTable<TData>({
                                             title,
                                             columns,
                                             data,
                                             itemsLoader,
                                             totalCount,
                                             filterDefinition,
                                             rowDialogContent,
                                             addDialogContent,
                                         }: DataTableProps<TData>) {
    const {t} = useTranslation();
    const {addNotification} = useNotification();
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = React.useMemo(() => new URLSearchParams(location.search), [location.search]);

    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [isRowDialogOpen, setIsRowDialogOpen] = React.useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
    const [selectedRow, setSelectedRow] = React.useState<any>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const paginationOptions = [10, 25, 50, 100];
    const [filterManager, setFilterManager] = React.useState<FilterManager>(() => FilterManager.fromQueryParams(searchParams));
    const [pagination, setPagination] = React.useState(() => Pagination.fromQueryParams(searchParams));
    const [sort, setSort] = React.useState(() => Sort.fromQueryParams(searchParams));
    const maxPage = Math.ceil(totalCount / pagination.itemsPerPage);

    React.useEffect(() => {
        setIsLoading(true);
        itemsLoader({filterManager, pagination, sort})
            .then(async () => {
                await updateUrl(filterManager, pagination, sort);
            })
            .catch((err) => {
                addNotification(
                    `Error loading the data${err?.message ? `: ${err.message}` : ""}`,
                    "error"
                );
            })
            .finally(() => setIsLoading(false));
    }, [pagination.page, pagination.itemsPerPage, sort, filterManager.getFilterString()]);

    const updateUrl = async (
        filterManager: FilterManager,
        pagination: Pagination,
        sort: Sort
    ) => {
        const params = new URLSearchParams();

        const filterParams = await filterManager.toQueryParams();
        const pagParams = pagination.toQueryParams();
        const sortParams = sort.toQueryParams();

        Object.entries(filterParams).forEach(([k, v]) => params.set(k, v));
        Object.entries(pagParams).forEach(([k, v]) => params.set(k, v));
        Object.entries(sortParams).forEach(([k, v]) => params.set(k, v));

        navigate(`?${params.toString()}`);
    };

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

    const updatePage = (newPage: number) =>
        setPagination(prev => new Pagination(newPage, prev.itemsPerPage));

    const updateItemsPerPage = (newSize: number) =>
        setPagination(new Pagination(1, newSize));

    const handleSortToggle = (key: string) => {
        const index = sort.items.findIndex(item => item.key === key);
        const updated = [...sort.items];

        if (index !== -1) {
            const current = updated[index];
            current.order === SortDirection.ASC
                ? (updated[index] = {key, order: SortDirection.DESC})
                : updated.splice(index, 1);
        } else {
            updated.push({key, order: SortDirection.ASC});
        }

        setSort(new Sort(updated));
        setPagination(new Pagination(1, defaultPageSize));
    };

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {sorting, columnFilters, columnVisibility, rowSelection},
    });

    return (
        <div className="mt-2 w-full p-4 border rounded-lg border-zinc-900 dark:border-zinc-50">
            <h2 className="font-bold text-lg">{title}</h2>
            <div className="flex items-center pt-3 pb-2">
                {filterDefinition && (
                    <FilterBar
                        filters={filterDefinition}
                        filterManager={filterManager}
                        onChange={(key, selected, type) => {
                            const updated = new FilterManager(filterManager.getFilters());
                            updated.addFilter(key, selected, type);
                            setFilterManager(updated);
                        }}
                    />
                )}
                <Button
                    onClick={handleAddClick}
                    className="ml-auto bg-zinc-300 dark:bg-zinc-800 hover:bg-zinc-400 dark:hover:bg-zinc-600 text-zinc-800 dark:text-white"
                >
                    <Plus className="mr-2 h-4 w-4"/>
                    {t("button.add")}
                </Button>
            </div>

            <div className="rounded-md border border-zinc-900 dark:border-zinc-500">
                <SimpleTable
                    table={table}
                    data={data}
                    isLoading={isLoading}
                    columns={columns}
                    onRowClick={handleRowClick}
                    headers={
                        table.getHeaderGroups().map((group: any) => (
                            <TableRow key={group.id} className="border-zinc-900 dark:border-zinc-500">
                                {group.headers.map((header: any) => {
                                    if (header.isPlaceholder) return <TableHead key={header.id}/>;

                                    const {column} = header;
                                    const key = column.id;
                                    const canSort = column.columnDef.enableSorting ?? true;
                                    const sortItem = sort.items.find(item => item.key === key);
                                    const sortIndex = sort.items.findIndex(item => item.key === key);

                                    return (
                                        <TableHead
                                            key={header.id}
                                            style={{
                                                width: `${column.columnDef.widthPercent ?? (100 / table.getVisibleFlatColumns().length)}%`,
                                            }}
                                            onClick={() => canSort && handleSortToggle(key)}
                                            className={canSort ? "cursor-pointer select-none" : ""}
                                        >
                                            <div className="flex items-center gap-1">
                                                {flexRender(column.columnDef.header, header.getContext())}
                                                {sortItem?.order === SortDirection.ASC &&
                                                    <ArrowUp className="w-4 h-4"/>}
                                                {sortItem?.order === SortDirection.DESC &&
                                                    <ArrowDown className="w-4 h-4"/>}
                                                {sortIndex !== -1 && (
                                                    <span
                                                        className="text-xs text-muted-foreground">{sortIndex + 1}</span>
                                                )}
                                            </div>
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))
                    }
                />
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-4 md:gap-0 py-4 w-full">

                {/* Pagination page label + select */}
                <div className="flex justify-center md:justify-start items-center gap-4 w-full md:w-auto">
                    <span className="text-sm text-muted-foreground">{t("pagination.page")}:</span>
                    <Select value={String(pagination.itemsPerPage)}
                            onValueChange={(v) => updateItemsPerPage(parseInt(v))}>
                        <SelectTrigger className="w-[80px] border-zinc-900 dark:border-zinc-50">
                            <SelectValue placeholder={pagination.itemsPerPage.toString()}/>
                        </SelectTrigger>
                        <SelectContent>
                            {paginationOptions.map((option) => (
                                <SelectItem key={option} value={String(option)}>
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Buttons and pagination info container */}
                <div className="flex items-center w-full md:w-auto justify-center md:justify-end gap-2 px-2">

                    <Button variant="outline" size="sm" onClick={() => updatePage(1)} disabled={pagination.page === 1}>
                        <ChevronsLeft className="w-4 h-4"/>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => updatePage(pagination.page - 1)}
                            disabled={pagination.page === 1}>
                        <ChevronLeft className="w-4 h-4"/>
                    </Button>

                    <span className="text-sm text-muted-foreground whitespace-nowrap text-center">
                      {t("pagination.info", {
                          from: totalCount === 0 ? 0 : (pagination.page - 1) * pagination.itemsPerPage + 1,
                          to: Math.min(totalCount, pagination.page * pagination.itemsPerPage),
                          total: totalCount,
                      })}
                    </span>

                    <Button variant="outline" size="sm" onClick={() => updatePage(pagination.page + 1)}
                            disabled={pagination.page >= maxPage}>
                        <ChevronRight className="w-4 h-4"/>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => updatePage(maxPage)}
                            disabled={pagination.page >= maxPage}>
                        <ChevronsRight className="w-4 h-4"/>
                    </Button>
                </div>
            </div>

            <Dialog open={isRowDialogOpen} onOpenChange={setIsRowDialogOpen}>
                {selectedRow && rowDialogContent?.(selectedRow.original, () => setIsRowDialogOpen(false))}
            </Dialog>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                {addDialogContent?.(() => setIsAddDialogOpen(false))}
            </Dialog>
        </div>
    );
}