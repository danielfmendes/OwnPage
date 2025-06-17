/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Project } from '../models/Project';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ProjectsService {
    /**
     * Create a new project
     * @param requestBody
     * @returns any Project created successfully
     * @throws ApiError
     */
    public static createProject(
        requestBody: Project,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/projects',
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
}
