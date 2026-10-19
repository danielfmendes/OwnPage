import { defaultPageSize, Pagination } from "@/models/datatable/pagination";
import { Sort } from "@/models/datatable/sort";
import { useCallback } from "react";
import FilterManager from "@/utils/filtermanager";

export declare interface ItemsLoaderOptions {
    filterManager: FilterManager;
    pagination: Pagination;
    sort: Sort;
    ignoreGlobalProjectFilter?: boolean;
}

export declare type ItemsLoader = (_: ItemsLoaderOptions) => Promise<void>;

export function useRefreshData(itemsLoader: ItemsLoader) {
    return useCallback(() => {
        return itemsLoader({
            filterManager: new FilterManager(),
            pagination: new Pagination(1, defaultPageSize),
            sort: new Sort(),
        });
    }, [itemsLoader]);
}

export async function genericItemsLoader<T>(
    options: ItemsLoaderOptions,
    fetchFunction: (
        filter: string | undefined,
        page: number,
        pageSize: number,
        sort: string | undefined
    ) => Promise<unknown>,
    setData: (items: T[]) => void,
    setTotalCount: (count: number) => void,
): Promise<void> {
    const filterString = options.ignoreGlobalProjectFilter
        ? options.filterManager.getFilterString()
        : options.filterManager.getFilterStringWithProjectIds();
    const sortString = options.sort.toCallOpts().join(",");

    // Some endpoints return a count-by list instead of a paged list; the paged shape is the one used here
    const result = (await fetchFunction(
        filterString === "" ? undefined : filterString,
        options.pagination.page,
        options.pagination.itemsPerPage,
        sortString === "" ? undefined : sortString
    )) as { items?: T[]; totalCount?: number };

    setData(result.items ?? []);
    setTotalCount(result.totalCount ?? 0);
}
