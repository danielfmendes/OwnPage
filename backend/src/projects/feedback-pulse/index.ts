import {IngestionWorkflow} from './workflow';
import {Env} from "./types";

// 1. Centralized CORS & Response Helper
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

const jsonResponse = (data: any, status = 200) => new Response(JSON.stringify(data), {
    status, headers: {...corsHeaders, "Content-Type": "application/json"}
});

export default {
    async fetch(req: Request, env: Env) {
        if (req.method === "OPTIONS") return new Response(null, {headers: corsHeaders});

        const url = new URL(req.url);
        // Normalize path: removes '/api' prefix to make routing cleaner
        const path = url.pathname.replace('/api', '');

        try {
            // --- POST ROUTES ---
            if (req.method === 'POST' && path === '/ingest') {
                const body: any = await req.json();
                const id = crypto.randomUUID();

                await env.INGESTION_WORKFLOW.create({
                    id, // Match DB ID for easier lookup
                    params: {
                        id,
                        content: body.content,
                        source: body.source || 'Unknown',
                        author: body.author || 'Anon',
                        timestamp: body.timestamp || new Date().toISOString()
                    }
                });
                return jsonResponse({success: true, id, status: "queued"});
            }

            // --- GET ROUTES ---
            if (req.method === 'GET') {
                if (path === '/stats') {
                    const total = await env.FEEDBACK_DB.prepare("SELECT COUNT(*) as count FROM feedback").first('count');
                    const critical = await env.FEEDBACK_DB.prepare("SELECT COUNT(*) as count FROM feedback WHERE urgency_score >= 4").first('count');
                    const sentiment: any = await env.FEEDBACK_DB.prepare("SELECT sentiment_score FROM feedback GROUP BY sentiment_score ORDER BY COUNT(*) DESC LIMIT 1").first();
                    return jsonResponse({total, critical, top_sentiment: sentiment?.sentiment_score || 'neutral'});
                }

                if (path === '/list') {
                    const {results} = await env.FEEDBACK_DB.prepare("SELECT * FROM feedback ORDER BY created_at DESC LIMIT 20").all();
                    return jsonResponse(results);
                }

                if (path === '/charts') {
                    const {results} = await env.FEEDBACK_DB.prepare("SELECT sentiment_score, COUNT(*) as count FROM feedback GROUP BY sentiment_score").all();
                    return jsonResponse(results);
                }

                // Handle dynamic ID routes (issue/xyz or status/xyz)
                if (path.startsWith('/issue/')) {
                    const id = path.split('/').pop();
                    const item = await env.FEEDBACK_DB.prepare("SELECT * FROM feedback WHERE id = ?").bind(id).first();
                    return item ? jsonResponse(item) : jsonResponse({error: "Not Found"}, 404);
                }

                if (path.startsWith('/status/')) {
                    const id = path.split('/').pop();
                    try {
                        const instance = await env.INGESTION_WORKFLOW.get(id!);
                        return jsonResponse(await instance.status());
                    } catch {
                        return jsonResponse({status: "unknown", error: "Workflow not found"}, 404);
                    }
                }
            }

            return jsonResponse({error: "Not Found"}, 404);

        } catch (e: any) {
            return jsonResponse({error: e.message}, 500);
        }
    }
};

export {IngestionWorkflow};