import type { FilterDefinition, FilterItem } from "@/components/helpers/FilterBar";
import {
    BikesService,
    CustomersService,
    OrdersService,
    RoleManagementsService,
    WareHousePartsService
} from "@/models/api";
import type { ItemsLoaderOptions } from "./itemsLoader";
import type { RefObject } from "react";

const createFilterItemLoaderWithManager = (
    itemsLoaderOptionsRef: RefObject<ItemsLoaderOptions | null>
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
        const current = itemsLoaderOptionsRef.current;
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

        return response
            .filter(item => item.value !== undefined && item.value !== null)
            .map(item => ({
                value: item.value!,
                count: item.count || 0,
            }));
    },
    ...options,
});

export const createBikeFilterItemLoader = (itemsLoaderOptionsRef: RefObject<ItemsLoaderOptions | null>) => (
    key: string,
    options?: Partial<Omit<FilterDefinition, "key" | "title" | "itemsLoader">>
) => createFilterItemLoaderWithManager(itemsLoaderOptionsRef)(key, BikesService.getBikes, options);

export const createCustomerFilterItemLoader = (itemsLoaderOptionsRef: RefObject<ItemsLoaderOptions | null>) => (
    key: string,
    options?: Partial<Omit<FilterDefinition, "key" | "title" | "itemsLoader">>
) => createFilterItemLoaderWithManager(itemsLoaderOptionsRef)(key, CustomersService.getCustomers, options);

export const createOrdersFilterItemLoader = (itemsLoaderOptionsRef: RefObject<ItemsLoaderOptions | null>) => (
    key: string,
    options?: Partial<Omit<FilterDefinition, "key" | "title" | "itemsLoader">>
) => createFilterItemLoaderWithManager(itemsLoaderOptionsRef)(key, OrdersService.getOrders, options);

export const createRoleManagementFilterItemLoader = (itemsLoaderOptionsRef: RefObject<ItemsLoaderOptions | null>) => (
    key: string,
    options?: Partial<Omit<FilterDefinition, "key" | "title" | "itemsLoader">>
) => createFilterItemLoaderWithManager(itemsLoaderOptionsRef)(key, RoleManagementsService.getRoleManagements, options);

export const createWareHousePartsFilterItemLoader = (itemsLoaderOptionsRef: RefObject<ItemsLoaderOptions | null>) => (
    key: string,
    options?: Partial<Omit<FilterDefinition, "key" | "title" | "itemsLoader">>
) => createFilterItemLoaderWithManager(itemsLoaderOptionsRef)(key, WareHousePartsService.getWareHouseParts, options);
