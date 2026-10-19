/**
 * Cookie-banner experiment configuration.
 *
 * Two manipulated banner attributes producing 3 × 2 = **6 distinct profiles**:
 *
 *   - `acceptColor`     — visual emphasis on the Accept button. Three levels:
 *                            • "Black"     — filled-black primary button,
 *                              high contrast against the white banner
 *                            • "Grey"      — filled medium-grey button,
 *                              intermediate emphasis
 *                            • "Outlined"  — white background with black
 *                              border, lowest emphasis (matches Reject)
 *                          Three-level dose-response on visual emphasis;
 *                          tested as a linear-trend contrast (Black > Grey
 *                          > Outlined) with pairwise steps as secondary.
 *
 *   - `acceptPosition`  — left/right slot of the Accept button in the
 *                          two-button row. Two levels:
 *                            • "Left"   — Accept on the left of Reject
 *                            • "Right"  — Accept on the right of Reject
 *                          Independent of `acceptColor`. Color and Position
 *                          are now decoupled (the previous design paired
 *                          them, which confounded the visual-default and
 *                          spatial-position levers).
 *
 * Plus a third **within-subjects** factor that does not vary the banner but
 * varies the surrounding website context:
 *
 *   - `environment`     — Clothing (returning visit; banner explicitly
 *                          states cookies remember size, cart, and
 *                          recommendations) vs. Currency Converter
 *                          (one-time utility visit; banner uses generic
 *                          copy because there is no benefit to claim)
 *
 * Each participant sees both environments (within-subjects), blocked into
 * two halves so the context shift is salient. Order is randomised per
 * participant. **Total cells across the design: 6 × 2 = 12.**
 *
 * Each round shows a **single** banner over a blurred mock website for the
 * round's environment. The participant clicks one of two controls
 * (Accept / Reject) on that banner. The per-round outcome is the chosen
 * action; the primary outcome is `accept` (=1 if action is Accept).
 *
 * The remaining banner dimensions (banner position, button wording, visual
 * style, granular toggles) are pinned to a single baseline level each, so
 * every rendered banner shares the same framing and only the two tested
 * banner dimensions move within an environment.
 */
export const CONJOINT_ATTRIBUTES = {
    acceptColor: {
        label: "Accept Color",
        levels: ["Black", "Grey", "Outlined"],
    },
    acceptPosition: {
        label: "Accept Position",
        levels: ["Left", "Right"],
    },
} as const;

export type ConjointAttributeKey = keyof typeof CONJOINT_ATTRIBUTES;

export const ATTRIBUTE_KEYS = Object.keys(
    CONJOINT_ATTRIBUTES,
) as ConjointAttributeKey[];

export type ConjointProfile = {
    [K in ConjointAttributeKey]: string;
};

/**
 * Within-subjects context factor. Each participant sees both levels.
 *  - `Clothing`            — fashion shop where cookies plausibly remember
 *                            sizes, preferences, cart, etc.
 *  - `Currency Converter`  — one-shot utility (no return value to a cookie).
 */
export const ENVIRONMENTS = ["Clothing", "Currency Converter"] as const;
export type Environment = (typeof ENVIRONMENTS)[number];

/**
 * Banner attributes that are *not* varied in the study but still required to
 * render a banner. Pinning them keeps every cell visually comparable: only
 * the two tested banner dimensions move (within an environment).
 */
export interface FixedLevels {
    bannerPosition: string;
    buttonWording: string;
    visualStyle: string;
    granularToggles: string;
}

export const FIXED_LEVELS: FixedLevels = {
    bannerPosition: "Center Modal",
    buttonWording: "Standard",
    visualStyle: "Minimalist",
    granularToggles: "Hidden",
};

/**
 * What the renderer actually consumes — the varied profile combined with
 * the fixed baseline. Components inside `cookie-banner/` accept this
 * shape so they don't need to know which dimensions are study-varied.
 */
export type RenderProfile = ConjointProfile & FixedLevels;

export function toRenderProfile(profile: ConjointProfile): RenderProfile {
    return {...profile, ...FIXED_LEVELS};
}

/**
 * Behavioural action the participant takes on the banner shown in a round.
 *
 *  - `Accept`  — the Accept button (color set by `acceptColor`)
 *  - `Reject`  — the Reject button (always outlined)
 */
export const CHOSEN_ACTIONS = ["Accept", "Reject"] as const;
export type ChosenAction = (typeof CHOSEN_ACTIONS)[number];

/**
 * 3 rounds per environment × 2 environments = 6 rounds per participant.
 * Each participant sees 6 of the 12 design cells, sampled without
 * replacement (3 cells per environment).
 */
export const ROUNDS_PER_ENVIRONMENT = 3;
export const TOTAL_ROUNDS = ROUNDS_PER_ENVIRONMENT * ENVIRONMENTS.length;

/**
 * Flat record for one round — one row per (session, round). Captures the
 * banner the participant saw and the action they took. The fixed baseline
 * is implicit.
 */
export type ChoiceTaskRecord = {
    sessionId: string;
    roundNumber: number;
    environment: Environment;
    acceptColor: string;
    acceptPosition: string;
    chosenAction: ChosenAction;
    timeTakenMs: number;
};

const shuffle = <T,>(xs: readonly T[]): T[] => {
    const out = xs.slice();
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
};

/**
 * Enumerate all 6 banner profiles (3 colors × 2 positions).
 */
const allProfiles = (): ConjointProfile[] => {
    const profiles: ConjointProfile[] = [];
    for (const acceptColor of CONJOINT_ATTRIBUTES.acceptColor.levels) {
        for (const acceptPosition of CONJOINT_ATTRIBUTES.acceptPosition.levels) {
            profiles.push({acceptColor, acceptPosition});
        }
    }
    return profiles;
};

export interface RoundProfile {
    environment: Environment;
    profile: ConjointProfile;
}

/**
 * Build the round sequence for one participant: blocked by environment
 * (3 rounds in one, then 3 in the other), with a fair coin flip on which
 * environment comes first to counter-balance order effects against the
 * environment-moderation hypothesis.
 *
 * Within each environment block, sample 3 of the 6 banner profiles
 * uniformly without replacement and present them in a random order. Each
 * participant therefore sees 6 of the 12 design cells, with cell-level
 * coverage balanced across the participant pool by the uniform sampling.
 */
export function generateRounds(): RoundProfile[] {
    const firstEnvironment: Environment =
        Math.random() < 0.5 ? "Clothing" : "Currency Converter";
    const order: Environment[] = [
        firstEnvironment,
        firstEnvironment === "Clothing" ? "Currency Converter" : "Clothing",
    ];
    return order.flatMap((environment) =>
        shuffle(allProfiles())
            .slice(0, ROUNDS_PER_ENVIRONMENT)
            .map((profile) => ({environment, profile})),
    );
}

/**
 * Flatten the in-memory round state into the wide D1-friendly record.
 */
export function toChoiceTaskRecord(args: {
    sessionId: string;
    roundNumber: number;
    environment: Environment;
    profile: ConjointProfile;
    chosenAction: ChosenAction;
    timeTakenMs: number;
}): ChoiceTaskRecord {
    const {sessionId, roundNumber, environment, profile, chosenAction, timeTakenMs} = args;
    return {
        sessionId,
        roundNumber,
        environment,
        acceptColor: profile.acceptColor,
        acceptPosition: profile.acceptPosition,
        chosenAction,
        timeTakenMs,
    };
}

/**
 * Demographic data captured after the choice tasks. The CLSBE-master flag
 * is conditional on `profession === "Student"` and is nullable otherwise.
 *
 * Persisted to a separate `participants` table in D1, keyed by `session_id`,
 * so each participant has 1 demographics row + N choice rows.
 */
export interface Demographics {
    age: number;
    nationality: string;
    profession: string;
    isCatolicaMaster: boolean | null;
}

/**
 * Wire format the Cloudflare Worker receives. Demographics live alongside
 * the array of choice tasks so the Worker can do one batched transaction:
 * INSERT participant + INSERT choice rows.
 */
export interface SubmissionPayload {
    sessionId: string;
    demographics: Demographics;
    choiceTasks: ChoiceTaskRecord[];
    device: "Mobile" | "Desktop";
}

/**
 * POST the full submission to the Cloudflare Worker.
 * Reads the endpoint from `VITE_API_URL` so the same build can target
 * preview / production environments. Falls back to a placeholder constant.
 */
export const WORKER_ENDPOINT =
    `${import.meta.env.VITE_API_ENV || "http://localhost:8080"}/causality-survey/cbc`;

export async function submitToWorker(payload: SubmissionPayload): Promise<void> {
    const response = await fetch(WORKER_ENDPOINT, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        throw new Error(`Submission failed: ${response.status} ${response.statusText}`);
    }
}
