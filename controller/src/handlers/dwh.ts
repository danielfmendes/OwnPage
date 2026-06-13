import { Env } from "../types";
import {
    projectsHandler,
    usersHandler,
    userHandler,
} from "./dwh/crud";
import { roleManagementHandler } from "./dwh/roles_and_costs";
import { authHandler } from "./dwh/auth";
import { entitiesHandler } from "./dwh/schema/entities";
import { schemasHandler } from "./dwh/schema/schemas";
import { dashboardsHandler } from "./dwh/dashboards";
import { columnsHandler } from "./dwh/schema/columns";
import { relationshipsHandler } from "./dwh/schema/relationships";
import { dataHandler } from "./dwh/data/data";
import { sqlConsoleHandler } from "./dwh/sql/console";
import { aggregateHandler } from "./dwh/aggregate";
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

        // --- Generic, user-definable DWH (schema/catalog-driven) ---
        if (path.startsWith("/schemas")) return await schemasHandler(request, env);
        if (path.startsWith("/dashboards")) return await dashboardsHandler(request, env);
        if (path.startsWith("/entities")) return await entitiesHandler(request, env);
        if (path.startsWith("/columns")) return await columnsHandler(request, env);
        if (path.startsWith("/relationships")) return await relationshipsHandler(request, env);
        if (path.startsWith("/data/")) return await dataHandler(request, env, path);
        if (path.startsWith("/sql")) return await sqlConsoleHandler(request, env);
        if (path.startsWith("/aggregate/")) return await aggregateHandler(request, env, path);

        // --- Platform (project / role / user management) ---
        if (path.startsWith("/projects")) return await projectsHandler(request, env);
        if (path.startsWith("/rolemanagements")) return await roleManagementHandler(request, env);
        if (path.startsWith("/users")) return await usersHandler(request, env);
        if (path.startsWith("/user")) return await userHandler(request, env);

        return new Response(`DWH Sub-path "${path}" Not Found`, { status: 404 });
    } catch (e) {
        // Converts HttpError thrown by requireUser/requireProjectRole/resolveProjectId etc.
        return toResponse(e);
    }
}