/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type WarehousePart = {
    /**
     * Unique ID of the part in the warehouse
     */
    id?: number;
    /**
     * Type/category of the part
     */
    part_type: string;
    /**
     * ID of the specific part
     */
    part_id: number;
    /**
     * Quantity available in stock
     */
    quantity: number;
    /**
     * Location of the part in the warehouse
     */
    storage_location: string;
    /**
     * Associated project ID
     */
    project_id: number;
};

