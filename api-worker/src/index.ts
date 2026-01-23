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
import {authHandler} from "./handlers/auth";
import {dashboardHandler} from "./handlers/dashboard";

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url)
        const path = url.pathname

        // AUTH / DASHBOARD später
        if (path.startsWith("/auth/")) return authHandler(request, env);

        if (path.startsWith("/dashboard/")) return dashboardHandler(request, env);

        // API ROUTES
        if (path === "/bikemodels") return getBikeModels(env)
        if (path === "/bikes") return bikeHandler(env)
        if (path === "/components") return componentHandler(env)
        if (path === "/customers") return customerHandler(env)
        if (path === "/orders") return orderHandler(env)
        if (path === "/orderitems") return orderItemsHandler(env)
        if (path === "/projects") return projectHandler(env)
        if (path === "/users") return getUsers(env)
        if (path === "/user") return getUser(env)
        if (path === "/warehouseparts") return warehousePartHandler(env)

        return new Response("Not Found", { status: 404 })
    },
}
