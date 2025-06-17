/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { User } from '../models/User';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthsService {
    /**
     * User login
     * @param requestBody
     * @returns any Successful login with token returned
     * @throws ApiError
     */
    public static userLogin(
        requestBody: {
            email?: string;
            password?: string;
        },
    ): CancelablePromise<{
        token?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request – missing or invalid fields`,
                401: `Unauthorized – invalid credentials`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * User registration
     * @param requestBody
     * @returns any User registered successfully
     * @throws ApiError
     */
    public static userRegister(
        requestBody: User,
    ): CancelablePromise<{
        token?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request – missing or invalid fields`,
                409: `Conflict – user already exists`,
                500: `Internal server error`,
            },
        });
    }
}
