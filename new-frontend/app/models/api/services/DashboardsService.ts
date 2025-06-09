/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BikeSales } from '../models/BikeSales';
import type { CityData } from '../models/CityData';
import type { GraphData } from '../models/GraphData';
import type { GraphMeta } from '../models/GraphMeta';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DashboardsService {
    /**
     * Retrieve a list of bike sales by model
     * @param filter Query filter string, e.g. project_id:$eq.1|2|3
     * @returns BikeSales A list of bike sales by model and date
     * @throws ApiError
     */
    public static getBikeSales(
        filter?: string,
    ): CancelablePromise<Array<BikeSales>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/dashboard/bikemodels',
            query: {
                'filter': filter,
            },
            errors: {
                401: `Unauthorized – missing or invalid token`,
                403: `Forbidden – insufficient permissions for projects`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Retrieve a list of city data
     * @param filter Query filter string, e.g. project_id:$eq.1|2|3
     * @returns CityData A list of city data (current and previous revenue from top 5 cities)
     * @throws ApiError
     */
    public static getCityData(
        filter?: string,
    ): CancelablePromise<Array<CityData>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/dashboard/citydata',
            query: {
                'filter': filter,
            },
            errors: {
                401: `Unauthorized – missing or invalid token`,
                403: `Forbidden – insufficient permissions for projects`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Retrieve a list of graph data
     * @param filter Query filter string, e.g. project_id:$eq.1|2|3
     * @returns GraphData A list of graph data (time buckets with revenue and sales)
     * @throws ApiError
     */
    public static getGraphData(
        filter?: string,
    ): CancelablePromise<Array<GraphData>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/dashboard/graphdata',
            query: {
                'filter': filter,
            },
            errors: {
                401: `Unauthorized – missing or invalid token`,
                403: `Forbidden – insufficient permissions for projects`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Retrieve a list of graph meta
     * @param filter Query filter string, e.g. project_id:$eq.1|2|3
     * @returns GraphMeta A list of graph meta (current and previous revenue/sales)
     * @throws ApiError
     */
    public static getGraphMeta(
        filter?: string,
    ): CancelablePromise<Array<GraphMeta>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/dashboard/graphmeta',
            query: {
                'filter': filter,
            },
            errors: {
                401: `Unauthorized – missing or invalid token`,
                403: `Forbidden – insufficient permissions for projects`,
                500: `Internal server error`,
            },
        });
    }
}
