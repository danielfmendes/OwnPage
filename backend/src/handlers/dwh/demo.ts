import { Env } from "../../types";

// Demo projects seeded by database/*/V3 and V6. Only their orders are ever shifted.
const DEMO_PROJECT_IDS = [1, 2];

// Per isolate: the shift is checked at most once per UTC day.
let lastCheckedDay: string | null = null;

const todayUtc = (): string => new Date().toISOString().slice(0, 10);

const daysBetween = (from: string, to: string): number =>
    Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);

// Keeps the demo orders "current": if the newest demo order is older than today, every demo
// order moves forward by the same gap. Forward-only, idempotent (the guard only matches while
// the newest date is still the one that was read), and it never touches other projects.
export async function keepDemoDataCurrent(env: Env): Promise<void> {
    const today = todayUtc();
    if (lastCheckedDay === today) return;

    const ids = DEMO_PROJECT_IDS;
    const placeholders = ids.map(() => "?").join(", ");

    const row = await env.DB.prepare(
        `SELECT MAX(date(order_date)) AS latest FROM orders WHERE project_id IN (${placeholders})`,
    ).bind(...ids).first<{ latest: string | null }>();

    const latest = row?.latest;
    if (latest) {
        const gap = daysBetween(latest, today);
        if (gap > 0) {
            await env.DB.prepare(
                `UPDATE orders SET order_date = date(order_date, ?)
                 WHERE project_id IN (${placeholders})
                   AND (SELECT MAX(date(order_date)) FROM orders WHERE project_id IN (${placeholders})) = ?`,
            ).bind(`+${gap} days`, ...ids, ...ids, latest).run();
        }
    }

    lastCheckedDay = today;
}
