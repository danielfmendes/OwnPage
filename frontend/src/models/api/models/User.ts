/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type User = {
    /**
     * User's email address
     */
    email: string;
    /**
     * Hashed user password
     */
    password: string;
    /**
     * Username chosen by the user
     */
    username: string;
    /**
     * Date of birth in YYYY-MM-DD format
     */
    dob: string;
    /**
     * Indicates whether the user has been verified
     */
    is_verified?: boolean;
    /**
     * Expiration timestamp of the verification token
     */
    verification_expires?: string;
    /**
     * Token used for email verification
     */
    verification_token?: string;
};

