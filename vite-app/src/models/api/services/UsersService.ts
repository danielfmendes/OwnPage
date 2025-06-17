/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { User } from '../models/User';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UsersService {
    /**
     * Retrieve a user's information by email
     * @param filter Query filter string, e.g. project_id:$eq.1|2|3
     * @returns User User information retrieved successfully
     * @throws ApiError
     */
    public static getUserInfo(
        filter?: string,
    ): CancelablePromise<Array<User>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/user',
            query: {
                'filter': filter,
            },
            errors: {
                400: `Bad request – missing or invalid email`,
                500: `Internal server error`,
            },
        });
    }
}
