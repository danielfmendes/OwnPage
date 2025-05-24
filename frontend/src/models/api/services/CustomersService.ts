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
     * @returns Customer A list of customers
     * @throws ApiError
     */
    public static getCustomers(
        filter?: string,
    ): CancelablePromise<Array<Customer>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/customers',
            query: {
                'filter': filter,
            },
            errors: {
                401: `Unauthorized – missing or invalid token`,
                500: `Internal server error`,
            },
        });
    }
}
