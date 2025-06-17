/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type OrderItem = {
    /**
     * Unique ID of the order item
     */
    id?: number;
    /**
     * ID of the related order
     */
    order_id: number;
    /**
     * ID of the ordered bike
     */
    bike_id: number;
    /**
     * Quantity of bikes in this item
     */
    number: number;
    /**
     * Price per unit of the bike
     */
    price: number;
};

