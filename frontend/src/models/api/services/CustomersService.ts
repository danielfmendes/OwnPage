/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Customer } from '../models/Customer';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CustomersService {
    /**
     * Retrieve a list of customers
     * @param filter Query filter string, e.g. project_id:$eq.1|2|3
     * @param pageSize Specifying the size of the result set.
     * @param page Specifying the page of the result set.
     * @param orderBy Specifying the sort order. The sort definition can use the keywords 'asc' for ascending and 'desc' for descending sort order.
     * @returns any A list of customers with total count
     * @throws ApiError
     */
    public static getCustomers(
        filter?: string,
        pageSize?: number,
        page?: number,
        orderBy?: string,
    ): CancelablePromise<{
        totalCount?: number;
        items?: Array<Customer>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/customers',
            query: {
                'filter': filter,
                'pageSize': pageSize,
                'page': page,
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
     * Delete a customer by ID
     * @param id ID of the primary key to delete
     * @param cascade Whether to delete related data as well
     * @returns void
     * @throws ApiError
     */
    public static deleteCustomer(
        id: number,
        cascade?: boolean,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/customers',
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
     * Update a customer
     * @param requestBody
     * @returns any Customer updated successfully
     * @throws ApiError
     */
    public static updateCustomer(
        requestBody: Customer,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/customers',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request – missing or invalid fields`,
                401: `Unauthorized – missing or invalid token`,
                404: `Customer not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Create a new customer
     * @param requestBody
     * @returns any Customer created successfully
     * @throws ApiError
     */
    public static createCustomer(
        requestBody: Customer,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/customers',
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
