import type { FilterDefinition, FilterItem } from "@/components/helpers/FilterBar";
import {
    BikesService,
    CustomersService,
    OrdersService,
    RoleManagementsService,
    WareHousePartsService
} from "@/models/api";
import type { ItemsLoaderOptions } from "./itemsLoader";

const createFilterItemLoaderWithManager = (
    getItemsLoaderOptions: () => ItemsLoaderOptions | null
) => (
    key: string,
    loader: (
        filter?: string,
        page?: number,
        pageSize?: number,
        orderBy?: string,
        countBy?: string,
    ) => Promise<unknown>,
    options?: Partial<Omit<FilterDefinition, "key" | "title" | "itemsLoader">>,
): FilterDefinition => ({
    key,
    title: `label.${key}`,
    itemsLoader: async (): Promise<FilterItem[]> => {
        const current = getItemsLoaderOptions();
        if (!current) return [];
        const filterString = current.filterManager.getFilterStringWithProjectIds();
        const response = await loader(
            filterString || undefined,
            undefined,
            undefined,
            undefined,
            key,
        );

        if (!Array.isArray(response)) return [];

        // The API returns either a paged list or a count-by list; only count-by rows are used here
        return (response as { value?: string | null; count?: number }[])
            .filter(item => item.value !== undefined && item.value !== null)
            .map(item => ({
                value: item.value!,
                count: item.count || 0,
            }));
    },
    ...options,
});

export const createBikeFilterItemLoader = (getItemsLoaderOptions: () => ItemsLoaderOptions | null) => (
    key: string,
    options?: Partial<Omit<FilterDefinition, "key" | "title" | "itemsLoader">>
) => createFilterItemLoaderWithManager(getItemsLoaderOptions)(key, BikesService.getBikes, options);

export const createCustomerFilterItemLoader = (getItemsLoaderOptions: () => ItemsLoaderOptions | null) => (
    key: string,
    options?: Partial<Omit<FilterDefinition, "key" | "title" | "itemsLoader">>
) => createFilterItemLoaderWithManager(getItemsLoaderOptions)(key, CustomersService.getCustomers, options);

export const createOrdersFilterItemLoader = (getItemsLoaderOptions: () => ItemsLoaderOptions | null) => (
    key: string,
    options?: Partial<Omit<FilterDefinition, "key" | "title" | "itemsLoader">>
) => createFilterItemLoaderWithManager(getItemsLoaderOptions)(key, OrdersService.getOrders, options);

export const createRoleManagementFilterItemLoader = (getItemsLoaderOptions: () => ItemsLoaderOptions | null) => (
    key: string,
    options?: Partial<Omit<FilterDefinition, "key" | "title" | "itemsLoader">>
) => createFilterItemLoaderWithManager(getItemsLoaderOptions)(key, RoleManagementsService.getRoleManagements, options);

export const createWareHousePartsFilterItemLoader = (getItemsLoaderOptions: () => ItemsLoaderOptions | null) => (
    key: string,
    options?: Partial<Omit<FilterDefinition, "key" | "title" | "itemsLoader">>
) => createFilterItemLoaderWithManager(getItemsLoaderOptions)(key, WareHousePartsService.getWareHouseParts, options);
