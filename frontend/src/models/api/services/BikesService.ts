/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Bike } from '../models/Bike';
import type { BikeModel } from '../models/BikeModel';
import type { BikeWithModelName } from '../models/BikeWithModelName';
import type { Fork } from '../models/Fork';
import type { Frame } from '../models/Frame';
import type { Saddle } from '../models/Saddle';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BikesService {
    /**
     * Retrieve a list of bikes
     * @param filter Query filter string, e.g. project_id:$eq.1|2|3
     * @param page Specifying the page of the result set.
     * @param pageSize Specifying the size of the result set.
     * @param orderBy Specifying the sort order. The sort definition can use the keywords 'asc' for ascending and 'desc' for descending sort order.
     * @returns any A list of bikes with total count
     * @throws ApiError
     */
    public static getBikes(
        filter?: string,
        page?: number,
        pageSize?: number,
        orderBy?: string,
    ): CancelablePromise<{
        totalCount?: number;
        items?: Array<BikeWithModelName>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/bikes',
            query: {
                'filter': filter,
                'page': page,
                'pageSize': pageSize,
                'orderBy': orderBy,
            },
            errors: {
                401: `Unauthorized – missing or invalid token`,
                403: `Forbidden – insufficient permissions for projects`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Delete a bike by ID
     * @param id ID of the primary key to delete
     * @param cascade Whether to delete related data as well
     * @returns void
     * @throws ApiError
     */
    public static deleteBike(
        id: number,
        cascade?: boolean,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/bikes',
            query: {
                'id': id,
                'cascade': cascade,
            },
            errors: {
                400: `Bad request – missing or invalid ID`,
                401: `Unauthorized – missing or invalid token`,
                409: `Conflict – related data exists; use cascade=true to force delete`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Update a bike
     * @param requestBody
     * @returns any Bike updated successfully
     * @throws ApiError
     */
    public static updateBike(
        requestBody: Bike,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/bikes',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request – missing or invalid fields`,
                401: `Unauthorized – missing or invalid token`,
                404: `Bike not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Create a new bike
     * @param requestBody
     * @returns any Bike created successfully
     * @throws ApiError
     */
    public static createBike(
        requestBody: Bike,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/bikes',
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
    /**
     * Retrieve a list of bike models
     * @param filter Query filter string, e.g. project_id:$eq.1|2|3
     * @returns BikeModel A list of bike models
     * @throws ApiError
     */
    public static getBikeModels(
        filter?: string,
    ): CancelablePromise<Array<BikeModel>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/bikemodels',
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
     * Retrieve a list of bike components (saddles, frames, forks)
     * @param filter Query filter string, e.g. project_id:$eq.1|2|3
     * @returns any A list of bike components (saddles, frames, forks)
     * @throws ApiError
     */
    public static getBikeComponents(
        filter?: string,
    ): CancelablePromise<(Array<Frame> | Array<Fork> | Array<Saddle>)> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/components',
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
}
