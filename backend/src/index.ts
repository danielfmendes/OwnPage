import {Env} from "./types";
import {chatHandler} from "./handlers/chat/chat";
import {dwhHandler} from "./handlers/dwh";
import {authHandler} from "./handlers/dwh/auth";
import {addCorsHeaders} from "./utils/cors";
import feedbackPulse from "./projects/feedback-pulse";
import lisbonHousePrices from "./projects/lisbon-house-prices/app";
import causalitySurvey from "./projects/causality-survey";

export {IngestionWorkflow} from "./projects/feedback-pulse/workflow";

// Same request (method, headers, body, query) on a different path, so a project router sees its own URL shape
function rewritePath(request: Request, pathname: string): Request {
    const url = new URL(request.url);
    return new Request(new URL(pathname + url.search, url.origin), request);
}

async function handleRequest(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/api/, "");

    // 1. KI Chatbot
    if (path.startsWith("/chat")) return await chatHandler(request, env);

    // 2. Data Warehouse
    if (path.startsWith("/dwh")) return await dwhHandler(path, env, request);

    // 3. Shared login for Chat and the DWH (the /dwh/auth/* alias keeps working through dwhHandler)
    if (path.startsWith("/auth")) return await authHandler(path, request, env);

    // 4. Feedback Pulse: its router matches paths without the project prefix
    if (path.startsWith("/feedback-pulse/")) {
        return await feedbackPulse.fetch(rewritePath(request, path.slice("/feedback-pulse".length)), env);
    }

    // 5. Lisbon House Prices: the Hono app matches /api/* on its own database
    if (path.startsWith("/lisbon-house-prices/")) {
        const rewritten = rewritePath(request, "/api" + path.slice("/lisbon-house-prices".length));
        return await lisbonHousePrices.fetch(rewritten, {...env, DB: env.AVALIA_DB}, ctx);
    }

    // 6. Causality Survey: single POST endpoint on its own database
    if (path.startsWith("/causality-survey/")) {
        return await causalitySurvey.fetch(request, {...env, DB: env.SURVEY_DB});
    }

    return new Response("Not Found", {status: 404});
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        if (request.method === "OPTIONS") {
            return addCorsHeaders(request, new Response(null, {status: 204}));
        }

        const response = await handleRequest(request, env, ctx);
        return addCorsHeaders(request, response);
    },
}
