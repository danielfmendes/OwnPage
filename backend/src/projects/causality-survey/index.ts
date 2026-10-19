import {Env} from "./types";

/**
 * Wire format produced by the CBC frontend (see frontend/src/lib/conjoint.ts).
 * One participant + N choice tasks per submission.
 */
interface Demographics {
    age: number;
    nationality: string;
    profession: string;
    isCatolicaMaster: boolean | null;
}

type Environment = "Clothing" | "Currency Converter";
type ChosenAction = "Accept" | "Reject";
const CHOSEN_ACTIONS: readonly ChosenAction[] = ["Accept", "Reject"];
const COLOR_LEVELS = ["Black", "Grey", "Outlined"] as const;
const POSITION_LEVELS = ["Left", "Right"] as const;

interface ChoiceTaskRecord {
    sessionId: string;
    roundNumber: number;
    environment: Environment;
    acceptColor: string;
    acceptPosition: string;
    chosenAction: ChosenAction;
    timeTakenMs: number;
}

type DeviceClass = "Mobile" | "Desktop";
const DEVICE_CLASSES: readonly DeviceClass[] = ["Mobile", "Desktop"];

interface SubmissionPayload {
    sessionId: string;
    demographics: Demographics;
    choiceTasks: ChoiceTaskRecord[];
    device: DeviceClass;
}

const getCorsHeaders = (env: Env) => ({
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
});

const json = (body: unknown, status: number, env: Env) =>
    new Response(JSON.stringify(body), {
        status,
        headers: {"Content-Type": "application/json", ...getCorsHeaders(env)},
    });

function validate(payload: unknown): SubmissionPayload | string {
    if (!payload || typeof payload !== "object") return "payload must be an object";
    const p = payload as Partial<SubmissionPayload>;
    if (typeof p.sessionId !== "string" || !p.sessionId) return "sessionId is required";
    if (!p.demographics || typeof p.demographics !== "object") return "demographics is required";
    if (!Array.isArray(p.choiceTasks) || p.choiceTasks.length === 0) return "choiceTasks must be a non-empty array";
    if (!DEVICE_CLASSES.includes(p.device as DeviceClass)) return "device must be one of Mobile/Desktop";

    const d = p.demographics;
    if (typeof d.age !== "number") return "demographics.age must be a number";
    if (typeof d.nationality !== "string") return "demographics.nationality must be a string";
    if (typeof d.profession !== "string") return "demographics.profession must be a string";

    for (const t of p.choiceTasks) {
        if (t.environment !== "Clothing" && t.environment !== "Currency Converter") {
            return "choiceTasks[].environment must be 'Clothing' or 'Currency Converter'";
        }
        if (!CHOSEN_ACTIONS.includes(t.chosenAction)) {
            return "choiceTasks[].chosenAction must be one of Accept/Reject";
        }
        if (!COLOR_LEVELS.includes(t.acceptColor as (typeof COLOR_LEVELS)[number])) {
            return "choiceTasks[].acceptColor must be one of Black/Grey/Outlined";
        }
        if (!POSITION_LEVELS.includes(t.acceptPosition as (typeof POSITION_LEVELS)[number])) {
            return "choiceTasks[].acceptPosition must be one of Left/Right";
        }
    }

    return p as SubmissionPayload;
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        if (request.method === "OPTIONS") {
            return new Response(null, {headers: getCorsHeaders(env)});
        }
        if (request.method !== "POST") {
            return new Response("Method Not Allowed", {status: 405, headers: getCorsHeaders(env)});
        }

        let raw: unknown;
        try {
            raw = await request.json();
        } catch {
            return json({error: "invalid JSON body"}, 400, env);
        }

        const validated = validate(raw);
        if (typeof validated === "string") {
            return json({error: validated}, 400, env);
        }
        const {sessionId, demographics, choiceTasks, device} = validated;

        try {
            const participantStmt = env.DB.prepare(
                `INSERT INTO participants
                     (session_id, age, nationality, profession, is_catolica_master, device)
                 VALUES (?, ?, ?, ?, ?, ?)
                 ON CONFLICT(session_id) DO UPDATE SET
                     age                = excluded.age,
                     nationality        = excluded.nationality,
                     profession         = excluded.profession,
                     is_catolica_master = excluded.is_catolica_master,
                     device             = excluded.device`,
            ).bind(
                sessionId,
                demographics.age,
                demographics.nationality,
                demographics.profession,
                demographics.isCatolicaMaster === null ? null : demographics.isCatolicaMaster ? 1 : 0,
                device,
            );

            const choiceStmts = choiceTasks.map((t) =>
                env.DB.prepare(
                    `INSERT INTO choice_tasks
                         (session_id, round_number, environment,
                          accept_color, accept_position,
                          chosen_action, time_taken_ms)
                     VALUES (?, ?, ?, ?, ?, ?, ?)
                     ON CONFLICT(session_id, round_number) DO NOTHING`,
                ).bind(
                    sessionId,
                    t.roundNumber,
                    t.environment,
                    t.acceptColor,
                    t.acceptPosition,
                    t.chosenAction,
                    t.timeTakenMs,
                ),
            );

            await env.DB.batch([participantStmt, ...choiceStmts]);
            return json({success: true, inserted: choiceTasks.length}, 200, env);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Database error";
            console.error("CBC insert failed", message);
            return json({error: message}, 500, env);
        }
    },
};
