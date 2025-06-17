/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Bike = {
    /**
     * Unique ID of the bike
     */
    id?: number;
    /**
     * ID of the bike model
     */
    model_id: number;
    /**
     * Serial number of the bike
     */
    serial_number: string;
    /**
     * Date when the bike was produced
     */
    production_date: string;
    /**
     * Quantity produced or available
     */
    quantity: number;
    /**
     * Location in the warehouse
     */
    warehouse_location: string;
    /**
     * ID of the associated project
     */
    project_id: number;
};

