import {Env} from "../types";
import {
    bikeHandler,
    componentHandler,
    customerHandler,
    getBikeModels,
    getUser,
    getUsers,
    orderHandler,
    orderItemsHandler,
    projectHandler,
    warehousePartHandler
} from "./dwh/handlers";
import {authHandler} from "./dwh/auth";
import {dashboardHandler} from "./dwh/dashboard";

export async function dwhHandler(fullPath: string, env: Env, request: Request): Promise<Response> {
    const path = fullPath.replace(/^\/dwh/, "");

    if (path.startsWith("/auth/")) {
        return await authHandler(request, env);
    }

    if (path.startsWith("/dashboard/")) {
        return await dashboardHandler(request, env);
    }

    switch (path) {
        case "/bikemodels":
            return await getBikeModels(env);
        case "/bikes":
            return await bikeHandler(env);
        case "/components":
            return await componentHandler(env);
        case "/customers":
            return await customerHandler(env);
        case "/orders":
            return await orderHandler(env);
        case "/orderitems":
            return await orderItemsHandler(env);
        case "/projects":
            return await projectHandler(env);
        case "/users":
            return await getUsers(env);
        case "/user":
            return await getUser(env);
        case "/warehouseparts":
            return await warehousePartHandler(env);
        default:
            return new Response(`DWH Sub-path "${path}" Not Found`, {status: 404});
    }
}