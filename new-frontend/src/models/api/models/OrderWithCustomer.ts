/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Order } from './Order';
export type OrderWithCustomer = (Order & {
    /**
     * Full name of the customer
     */
    customer_name: string;
    /**
     * Email address of the customer
     */
    customer_email: string;
});

