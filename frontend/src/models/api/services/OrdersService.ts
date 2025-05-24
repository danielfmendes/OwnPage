/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Order } from '../models/Order';
import type { OrderItem } from '../models/OrderItem';
import type { OrderItemsWithBikeAndDate } from '../models/OrderItemsWithBikeAndDate';
import type { OrderItemsWithBikeName } from '../models/OrderItemsWithBikeName';
import type { OrderWithCustomer } from '../models/OrderWithCustomer';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OrdersService {
    /**
     * Retrieve a list of orders (various response types possible)
     * @param filter Query filter string, e.g. project_id:$eq.1|2|3
     * @returns any A list of orders
     * @throws ApiError
     */
    public static getOrders(
        filter?: string,
    ): CancelablePromise<(Array<OrderWithCustomer> | Array<OrderItemsWithBikeAndDate>)> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/orders',
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
     * Delete a order by ID
     * @param id ID of the primary key to delete
     * @param cascade Whether to delete related data as well
     * @returns void
     * @throws ApiError
     */
    public static deleteOrder(
        id: number,
        cascade?: boolean,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/orders',
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
     * Update a order
     * @param requestBody
     * @returns any Order updated successfully
     * @throws ApiError
     */
    public static updateOrder(
        requestBody: Order,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/orders',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request – missing or invalid fields`,
                401: `Unauthorized – missing or invalid token`,
                404: `Order not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Create a new order
     * @param requestBody
     * @returns any Order created successfully
     * @throws ApiError
     */
    public static createOrder(
        requestBody: Order,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/orders',
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
     * Retrieve a list of order items
     * @param filter Query filter string, e.g. project_id:$eq.1|2|3
     * @returns OrderItemsWithBikeName A list of order items
     * @throws ApiError
     */
    public static getOrderItems(
        filter?: string,
    ): CancelablePromise<Array<OrderItemsWithBikeName>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/orderitems',
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
     * Update a order item
     * @param requestBody
     * @returns any Order item updated successfully
     * @throws ApiError
     */
    public static updateOrderItem(
        requestBody: OrderItem,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/orderitems',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request – missing or invalid fields`,
                401: `Unauthorized – missing or invalid token`,
                404: `Order not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Create a new order item
     * @param requestBody
     * @returns any Order item created successfully
     * @throws ApiError
     */
    public static createOrderItem(
        requestBody: OrderItem,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/orderitems',
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
     * Delete a order item by ID
     * @param id ID of the primary key to delete
     * @returns void
     * @throws ApiError
     */
    public static deleteOrderItem(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/orderitems',
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
}
