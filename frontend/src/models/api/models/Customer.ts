/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Customer = {
    /**
     * Unique identifier for the customer
     */
    id?: number;
    /**
     * Customer's email address
     */
    email: string;
    /**
     * Hashed password for authentication
     */
    password: string;
    /**
     * Customer's given name
     */
    first_name: string;
    /**
     * Customer's family name
     */
    name: string;
    /**
     * Date of birth (YYYY-MM-DD)
     */
    dob: string;
    /**
     * City of residence
     */
    city: string;
    /**
     * Project ID associated with the customer
     */
    project_id: number;
};

