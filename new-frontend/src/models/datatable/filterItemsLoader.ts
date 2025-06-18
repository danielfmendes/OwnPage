import type {FilterDefinition, FilterItem} from "@/components/helpers/FilterBar";
import {
    BikesService,
    CustomersService,
    OrdersService,
    RoleManagementsService,
    WareHousePartsService
} from "@/models/api";
import type {ItemsLoaderOptions} from "./itemsLoader";

const createFilterItemLoaderWithManager = (
    itemsLoaderOptions: ItemsLoaderOptions
) => (
    key: string,
    loader: (
        filter?: string,
        page?: number,
        pageSize?: number,
        orderBy?: string,
        countBy?: string,
    ) => Promise<any>,
    options?: Partial<Omit<FilterDefinition, "key" | "title" | "itemsLoader">>,
): FilterDefinition => ({
    key,
    title: `label.${key}`,
    itemsLoader: async (): Promise<FilterItem[]> => {
        const filterString = itemsLoaderOptions.filterManager.getFilterStringWithProjectIds();
        const response = await loader(
            filterString || undefined,
            undefined,
            undefined,
            undefined,
            key,
        );

        if (!Array.isArray(response)) return [];

        return response
            .filter(item => item.value !== undefined && item.value !== null)
            .map(item => ({
                value: item.value!,
                count: item.count || 0,
            }));
    },
    ...options,
});

export const createBikeFilterItemLoader = (itemsLoaderOptions: ItemsLoaderOptions) => (
    key: string,
    options?: Partial<Omit<FilterDefinition, "key" | "title" | "itemsLoader">>
) => createFilterItemLoaderWithManager(itemsLoaderOptions)(key, BikesService.getBikes, options);

export const createCustomerFilterItemLoader = (itemsLoaderOptions: ItemsLoaderOptions) => (
    key: string,
    options?: Partial<Omit<FilterDefinition, "key" | "title" | "itemsLoader">>
) => createFilterItemLoaderWithManager(itemsLoaderOptions)(key, CustomersService.getCustomers, options);

export const createOrdersFilterItemLoader = (itemsLoaderOptions: ItemsLoaderOptions) => (
    key: string,
    options?: Partial<Omit<FilterDefinition, "key" | "title" | "itemsLoader">>
) => createFilterItemLoaderWithManager(itemsLoaderOptions)(key, OrdersService.getOrders, options);

export const createRoleManagementFilterItemLoader = (itemsLoaderOptions: ItemsLoaderOptions) => (
    key: string,
    options?: Partial<Omit<FilterDefinition, "key" | "title" | "itemsLoader">>
) => createFilterItemLoaderWithManager(itemsLoaderOptions)(key, RoleManagementsService.getRoleManagements, options);

export const createWareHousePartsFilterItemLoader = (itemsLoaderOptions: ItemsLoaderOptions) => (
    key: string,
    options?: Partial<Omit<FilterDefinition, "key" | "title" | "itemsLoader">>
) => createFilterItemLoaderWithManager(itemsLoaderOptions)(key, WareHousePartsService.getWareHouseParts, options);
