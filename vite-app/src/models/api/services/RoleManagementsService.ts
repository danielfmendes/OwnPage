/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CountByResult } from '../models/CountByResult';
import type { RoleManagement } from '../models/RoleManagement';
import type { RoleManagementListResponse } from '../models/RoleManagementListResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RoleManagementsService {
    /**
     * Retrieve a list of role managements with project names
     * @param filter Query filter string, e.g. project_id:$eq.1|2|3
     * @param page Specifying the page of the result set.
     * @param pageSize Specifying the size of the result set.
     * @param orderBy Specifying the sort order. The sort definition can use the keywords 'asc' for ascending and 'desc' for descending sort order.
     * @param countBy Returns the count for that column
     * @returns any A list of role managements with project names with total count
     * @throws ApiError
     */
    public static getRoleManagements(
        filter?: string,
        page?: number,
        pageSize?: number,
        orderBy?: string,
        countBy?: string,
    ): CancelablePromise<(RoleManagementListResponse | Array<CountByResult>)> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/rolemanagements',
            query: {
                'filter': filter,
                'page': page,
                'pageSize': pageSize,
                'orderBy': orderBy,
                'countBy': countBy,
            },
            errors: {
                401: `Unauthorized – missing or invalid token`,
                403: `Forbidden – insufficient permissions for projects`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Delete a role management by email and project ID
     * @param email Email address of the user to retrieve or modify
     * @param projectId Project ID of the primary key to delete
     * @returns void
     * @throws ApiError
     */
    public static deleteRoleManagementByEmailAndProjectId(
        email: string,
        projectId: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/rolemanagements',
            query: {
                'email': email,
                'project_id': projectId,
            },
            errors: {
                400: `Bad request – missing or invalid ID`,
                401: `Unauthorized – missing or invalid token`,
                403: `Forbidden – with current permissions not allowed to delete`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Update a role management
     * @param requestBody
     * @returns any Role management updated successfully
     * @throws ApiError
     */
    public static updateRoleManagement(
        requestBody: RoleManagement,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/rolemanagements',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request – missing or invalid fields`,
                401: `Unauthorized – missing or invalid token`,
                404: `Role management not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Create a new role management
     * @param requestBody
     * @returns any Role management created successfully
     * @throws ApiError
     */
    public static createRoleManagement(
        requestBody: RoleManagement,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/rolemanagements',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request – missing or invalid fields`,
                401: `Unauthorized – missing or invalid token`,
                409: `Conflict – duplicate or invalid data`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Retrieve a list of role managements for a given ID
     * @param id ID of the primary key to retrieve
     * @returns RoleManagement A list of role management entries
     * @throws ApiError
     */
    public static getRoleManagementsById(
        id: number,
    ): CancelablePromise<Array<RoleManagement>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/rolemanagements/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized – missing or invalid token`,
                403: `Forbidden – insufficient permissions`,
                404: `Not Found – no role managements for the given ID`,
                500: `Internal server error`,
            },
        });
    }
}
