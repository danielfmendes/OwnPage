import { Env } from "../types";
import { dashboardHandler } from "./dwh/dashboard";
import {
    bikeHandler,
    componentHandler,
    customerHandler,
    getBikeModels, getUser, getUsers,
    orderHandler,
    orderItemsHandler, projectHandler, warehousePartHandler
} from "./dwh/handlers";

export async function dwhHandler(path: string, env: Env, request: Request): Promise<Response> {

    if (path.startsWith("/dashboard/")) {
        return await dashboardHandler(request, env);
    }

    if (path === "/bikemodels") return await getBikeModels(env);
    if (path === "/bikes") return await bikeHandler(env);
    if (path === "/components") return await componentHandler(env);
    if (path === "/customers") return await customerHandler(env);
    if (path === "/orders") return await orderHandler(env);
    if (path === "/orderitems") return await orderItemsHandler(env);
    if (path === "/projects") return await projectHandler(env);
    if (path === "/users") return await getUsers(env);
    if (path === "/user") return await getUser(env);
    if (path === "/warehouseparts") return await warehousePartHandler(env);

    return new Response(`DWH Path "${path}" Not Found`, { status: 404 });
}