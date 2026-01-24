import { Env } from "../../types";
import { runQuery, jsonResponse, errorResponse } from "../../utils/response";
import {bikeModelsSalesSQL, cityDataSQL, graphDataSQL, graphMetaSQL} from "../../selects";
import {GraphMeta} from "../../models/GraphMeta";
import {GraphData} from "../../models/GraphData";
import {CityData} from "../../models/CityData";
import {BikeSales} from "../../models/BikeSales";

function extractRange(request: Request): string {
    const range = new URL(request.url).searchParams.get("range");
    if (!range) throw new Error("Range missing");
    return range;
}

export async function dashboardHandler(request: Request, env: Env): Promise<Response> {
    const path = new URL(request.url).pathname;

    try {
        switch (path) {
            case "/dashboard/graphmeta":
                return jsonResponse(await runQuery<GraphMeta>(env.DB, graphMetaSQL, extractRange(request)));
            case "/dashboard/graphdata":
                return jsonResponse(await runQuery<GraphData>(env.DB, graphDataSQL, extractRange(request)));
            case "/dashboard/citydata":
                return jsonResponse(await runQuery<CityData>(env.DB, cityDataSQL, extractRange(request)));
            case "/dashboard/bikemodels":
                return jsonResponse(await runQuery<BikeSales>(env.DB, bikeModelsSalesSQL, extractRange(request)));
            default:
                return errorResponse("Not Found", 404);
        }
    } catch (err: any) {
        return errorResponse(err.message || "Unknown error", 400);
    }
}
