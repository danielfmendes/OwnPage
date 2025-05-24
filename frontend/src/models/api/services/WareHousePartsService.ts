/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { WarehousePart } from '../models/WarehousePart';
import type { WarehousePartWithName } from '../models/WarehousePartWithName';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class WareHousePartsService {
    /**
     * Retrieve a list of warehouse parts
     * @param filter Query filter string, e.g. project_id:$eq.1|2|3
     * @returns WarehousePartWithName A list of warehouse parts
     * @throws ApiError
     */
    public static getWareHouseParts(
        filter?: string,
    ): CancelablePromise<Array<WarehousePartWithName>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/warehouseparts',
            query: {
                'filter': filter,
            },
            errors: {
                401: `Unauthorized – missing or invalid token`,
                403: `Forbidden – insufficient permissions for projects`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Delete a warehouse part by ID
     * @param id ID of the primary key to delete
     * @returns void
     * @throws ApiError
     */
    public static deleteWareHousePart(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/warehouseparts',
            query: {
                'id': id,
            },
            errors: {
                400: `Bad request – missing or invalid ID`,
                401: `Unauthorized – missing or invalid token`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Update a warehouse part
     * @param requestBody
     * @returns any WareHousePart updated successfully
     * @throws ApiError
     */
    public static updateWareHousePart(
        requestBody: WarehousePart,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/warehouseparts',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request – missing or invalid fields`,
                401: `Unauthorized – missing or invalid token`,
                404: `WareHousePart not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Create a new warehouse part
     * @param requestBody
     * @returns any WareHousePart created successfully
     * @throws ApiError
     */
    public static createWareHousePart(
        requestBody: WarehousePart,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/warehouseparts',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request – missing or invalid fields`,
                401: `Unauthorized – missing or invalid token`,
                409: `Conflict – duplicate or invalid data`,
                500: `Internal server error`,
            },
        });
    }
}
