import { Env } from "./types"
import {
    getBikeModels,
    bikeHandler,
    componentHandler,
    customerHandler,
    orderHandler,
    orderItemsHandler,
    projectHandler,
    warehousePartHandler,
    getUsers,
    getUser,
} from "./handlers"
import { authHandler } from "./handlers/auth";
import { dashboardHandler } from "./handlers/dashboard";
import { addCorsHeaders } from "./utils/cors";

async function handleRequest(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname

    if (path.startsWith("/auth/")) return await authHandler(request, env);
    if (path.startsWith("/dashboard/")) return await dashboardHandler(request, env);

    if (path === "/bikemodels") return await getBikeModels(env)
    if (path === "/bikes") return await bikeHandler(env)
    if (path === "/components") return await componentHandler(env)
    if (path === "/customers") return await customerHandler(env)
    if (path === "/orders") return await orderHandler(env)
    if (path === "/orderitems") return await orderItemsHandler(env)
    if (path === "/projects") return await projectHandler(env)
    if (path === "/users") return await getUsers(env)
    if (path === "/user") return await getUser(env)
    if (path === "/warehouseparts") return await warehousePartHandler(env)

    return new Response("Not Found", { status: 404 })
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        if (request.method === "OPTIONS") {
            return addCorsHeaders(request, new Response(null, { status: 204 }));
        }

        const response = await handleRequest(request, env);

        return addCorsHeaders(request, response);
    },
}