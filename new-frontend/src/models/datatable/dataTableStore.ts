import {create} from "zustand";
import FilterManager from "@/utils/filtermanager";
import {Pagination} from "@/models/datatable/pagination";
import {Sort} from "@/models/datatable/sort";
import type {ItemsLoaderOptions} from "@/models/datatable/itemsLoader";

interface DataTableStore {
    filterManager: FilterManager;
    pagination: Pagination;
    sort: Sort;

    setFilterManager: (fm: FilterManager) => void;
    setPagination: (pg: Pagination) => void;
    setSort: (sort: Sort) => void;

    fromQueryParams: (params: URLSearchParams) => void;
    toItemsLoaderOptions: () => ItemsLoaderOptions;
    toQueryParams: () => URLSearchParams;
}

export const useDataTableStore = create<DataTableStore>((set, get) => ({
    filterManager: new FilterManager(),
    pagination: new Pagination(),
    sort: new Sort(),

    setFilterManager: (fm) => set({filterManager: fm}),
    setPagination: (pg) => set({pagination: pg}),
    setSort: (sort) => set({sort}),

    fromQueryParams: (params) => {
        const filterManager = FilterManager.fromQueryParams(params);
        const pagination = Pagination.fromQueryParams(params);
        const sort = Sort.fromQueryParams(params);
        set({filterManager, pagination, sort});
    },

    toItemsLoaderOptions: () => {
        const {filterManager, pagination, sort} = get();
        return {filterManager, pagination, sort};
    },

    toQueryParams: () => {
        const {filterManager, pagination, sort} = get();
        const params = new URLSearchParams();

        const filterParams = filterManager.toQueryParams();
        const pagParams = pagination.toQueryParams();
        const sortParams = sort.toQueryParams();

        Object.entries(filterParams).forEach(([k, v]) => params.set(k, v));
        Object.entries(pagParams).forEach(([k, v]) => params.set(k, v));
        Object.entries(sortParams).forEach(([k, v]) => params.set(k, v));

        return params;
    },
}));
