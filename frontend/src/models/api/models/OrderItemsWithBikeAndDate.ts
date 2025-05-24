/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OrderItem } from './OrderItem';
export type OrderItemsWithBikeAndDate = (OrderItem & {
    /**
     * Bike model name
     */
    model_name?: string;
    /**
     * Date when the order was placed
     */
    order_date?: string;
});

