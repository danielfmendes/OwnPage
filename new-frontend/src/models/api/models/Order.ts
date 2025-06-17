/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Order = {
    /**
     * Unique order ID
     */
    id?: number;
    /**
     * ID of the customer who placed the order
     */
    customer_id: number;
    /**
     * Date when the order was placed
     */
    order_date: string;
    /**
     * Associated project ID
     */
    project_id: number;
};

