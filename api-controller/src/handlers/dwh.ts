import { Env } from "../types";
import {
    bikeModelsHandler,
    componentsHandler,
    customersHandler,
    projectsHandler,
    usersHandler,
    userHandler,
    warehousePartsHandler
} from "./dwh/crud";
import { bikeHandler } from "./dwh/bikes";
import { ordersHandler, orderItemsHandler } from "./dwh/orders";
import { partCostsHandler, roleManagementHandler } from "./dwh/roles_and_costs";
import { authHandler } from "./dwh/auth";
import { dashboardHandler } from "./dwh/dashboard";
import { requireUser, toResponse } from "../utils/auth";

export async function dwhHandler(fullPath: string, env: Env, request: Request): Promise<Response> {
    const path = fullPath.replace(/^\/dwh/, "");

    // /auth/* (register, login, refresh, logout, me, verify) is the only un-gated area.
    if (path.startsWith("/auth")) {
        return await authHandler(path, request, env);
    }

    try {
        // Every other DWH endpoint requires a valid token — matches the Go controller, where
        // fetchData/HandleInsert/HandleUpdate/HandleDelete all call ValidateToken first.
        // Per-write admin-role checks happen inside the individual handlers.
        await requireUser(request, env);

        if (path.startsWith("/dashboard/")) {
            return await dashboardHandler(request, env);
        }

        if (path.startsWith("/bikemodels")) return await bikeModelsHandler(request, env);
        if (path.startsWith("/bikes")) return await bikeHandler(request, env);
        if (path.startsWith("/components")) return await componentsHandler(request, env);
        if (path.startsWith("/customers")) return await customersHandler(request, env);
        if (path.startsWith("/orders")) return await ordersHandler(request, env);
        if (path.startsWith("/orderitems")) return await orderItemsHandler(request, env);
        if (path.startsWith("/partcosts")) return await partCostsHandler(request, env);
        if (path.startsWith("/projects")) return await projectsHandler(request, env);
        if (path.startsWith("/rolemanagements")) return await roleManagementHandler(request, env);
        if (path.startsWith("/users")) return await usersHandler(request, env);
        if (path.startsWith("/user")) return await userHandler(request, env);
        if (path.startsWith("/warehouseparts")) return await warehousePartsHandler(request, env);

        return new Response(`DWH Sub-path "${path}" Not Found`, { status: 404 });
    } catch (e) {
        // Converts HttpError thrown by requireUser/requireProjectRole/resolveProjectId etc.
        return toResponse(e);
    }
}