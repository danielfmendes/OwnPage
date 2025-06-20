import {useEffect, useState, type ReactNode, useMemo} from "react";
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
import {Sort, SortDirection, type SortDirectionType} from "@/models/datatable/sort";
import {type ItemsLoaderOptions} from "@/models/datatable/itemsLoader";
import {useNotification} from "@/components/helpers/NotificationProvider";
import {type CustomColumnDef} from "@/models/datatable/column";
import {FilterBar, type  FilterDefinition} from "./FilterBar";
import FilterManager, {type FilterType} from "@/utils/filtermanager";
import {useNavigate} from "react-router-dom";
import {useDataTableStore} from "@/models/datatable/dataTableStore";
import MobileFilterDialog from "@/components/helpers/MobileFilterBar";

interface DataTableProps<TData> {
    title: string;
    columns: CustomColumnDef<TData>[];
    data: TData[];
    itemsLoader: (opts: ItemsLoaderOptions) => Promise<void>;
    totalCount: number;
    filterDefinition?: FilterDefinition[];
    rowDialogContent?: (row: any, onClose: () => void) => ReactNode;
    addDialogContent?: (onClose: () => void) => ReactNode;
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
    const navigate = useNavigate();

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [isRowDialogOpen, setIsRowDialogOpen] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const {
        filterManager,
        pagination,
        sort,
        setFilterManager,
        setPagination,
        setSort,
        toItemsLoaderOptions,
        toQueryParams,
    } = useDataTableStore();

    const paginationOptions = useMemo(() => {
        const baseOptions = [10, 25, 50, 100];
        if (pagination.itemsPerPage && !baseOptions.includes(pagination.itemsPerPage)) {
            return [...baseOptions, pagination.itemsPerPage].sort((a, b) => a - b);
        }
        return baseOptions;
    }, [pagination.itemsPerPage]);
    const maxPage = Math.ceil(totalCount / pagination.itemsPerPage);

    useEffect(() => {
        setIsLoading(true);

        const loadData = async () => {
            try {
                await itemsLoader(toItemsLoaderOptions());
                const queryParams = toQueryParams();
                navigate(`?${queryParams.toString()}`);
            } catch (err: any) {
                addNotification(
                    `Error loading the data${err?.message ? `: ${err.message}` : ""}`,
                    "error"
                );
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [
        pagination.page,
        pagination.itemsPerPage,
        sort.items.map(item => `${item.key}=${item.order}`).join(","),
        filterManager.getFilterString(),
    ]);

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

    const updatePage = (newPage: number) => {
        setPagination(new Pagination(newPage, pagination.itemsPerPage));
    };

    const updateItemsPerPage = (newSize: number) => {
        setPagination(new Pagination(1, newSize));
    };

    const updateSort = (key: string, sortDirection?: SortDirectionType) => {
        const updated = [...sort.items];
        const index = updated.findIndex(item => item.key === key);

        if (index !== -1) {
            if (sortDirection === SortDirection.ASC || sortDirection === SortDirection.DESC) {
                updated[index] = {key, order: sortDirection};
            } else {
                updated.splice(index, 1);
            }
        } else if (sortDirection) {
            updated.push({key, order: sortDirection});
        }

        setSort(new Sort(updated));
        setPagination(new Pagination(1, defaultPageSize));
    };

    const handleSortToggle = (key: string) => {
        const currentSortItem = sort.items.find(item => item.key === key);

        if (!currentSortItem) {
            updateSort(key, SortDirection.ASC);
        } else if (currentSortItem.order === SortDirection.ASC) {
            updateSort(key, SortDirection.DESC);
        } else {
            updateSort(key);
        }
    };

    const onFilterChange = (key: string, selected: any[], type: FilterType) => {
        const newManager = new FilterManager(filterManager.getFilters());
        newManager.addFilter(key, selected, type);
        setFilterManager(newManager);
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
                {/* Mobile filter/sort button - hidden on desktop */}
                {filterDefinition && (
                    <MobileFilterDialog
                        filters={filterDefinition}
                        filterManager={filterManager}
                        onChange={onFilterChange}
                        columns={columns}
                        sort={sort}
                        updateSort={updateSort}
                    />
                )}

                {/* Desktop filter bar - hidden on mobile */}
                {filterDefinition && (
                    <div className="hidden sm:block">
                        <FilterBar
                            filters={filterDefinition}
                            filterManager={filterManager}
                            onChange={onFilterChange}
                        />
                    </div>
                )}

                <Button
                    onClick={handleAddClick}
                    className="ml-auto bg-zinc-300 dark:bg-zinc-800 hover:bg-zinc-400 dark:hover:bg-zinc-600 text-zinc-800 dark:text-white"
                >
                    <Plus className="h-4 w-4"/>
                    {t("button.add")}
                </Button>
            </div>

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

                    <Button variant="outline" size="sm" onClick={() => updatePage(1)}
                            disabled={pagination.page === 1}>
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