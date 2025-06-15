import {defaultPageSize, Pagination} from "@/models/datatable/pagination";
import {Sort} from "@/models/datatable/sort";
import {useCallback} from "react";
import {CancelablePromise} from "@/models/api";
import FilterManager from "@/utils/filtermanager";

export declare interface ItemsLoaderOptions {
    filterManager: FilterManager;
    pagination: Pagination;
    sort: Sort;
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
    ) => CancelablePromise<any>,
    setData: (items: T[]) => void,
    setTotalCount: (count: number) => void,
): Promise<void> {
    const filterString = await options.filterManager.getFilterStringWithProjectIds();
    const sortString = options.sort.toCallOpts().join(",");

    const result = await fetchFunction(
        filterString === "" ? undefined : filterString,
        options.pagination.page,
        options.pagination.itemsPerPage,
        sortString === "" ? undefined : sortString
    );

    setData(result.items ?? []);
    setTotalCount(result.totalCount ?? 0);
}
