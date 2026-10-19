import {Cookie} from "lucide-react";
import {cn} from "@/lib/utils";
import type {ChosenAction, Environment, RenderProfile} from "@/lib/conjoint";
import {BannerButtons} from "./buttons";

/**
 * Visual language (icon-in-soft-grey-square, navy heading, lavender body,
 * sky-blue underlined link, black/grey/outlined CTAs) is taken directly
 * from the reference screenshots in `ui/` — the canonical design source
 * produced by the team.
 *
 * Every CTA inside the banner fires `onAction` with the corresponding
 * `ChosenAction` so the parent can record the participant's behavioural
 * outcome.
 */

const HEADING_CLS = "text-[11px] font-bold tracking-tight text-[#1a1535]";
const BODY_CLS = "text-[10px] leading-snug text-[#6b6884]";
const LINK_CLS = "text-[#2da4ee] underline underline-offset-2";

function CookieIconBadge() {
    return (
        <div className="shrink-0 flex items-center justify-center rounded-md w-5 h-5 bg-[#ebebef]">
            <Cookie className="w-3 h-3 text-[#1a1535]"/>
        </div>
    );
}

/**
 * Environment-specific banner body copy. The Clothing variant explicitly
 * names the functional benefits cookies provide on a returning-visit site
 * (saved size, cart, recommendations) so participants can weigh a stated
 * benefit against the cost of consenting. The Currency Converter variant
 * is intentionally generic — the one-shot context offers no return value
 * for cookies to deliver, and stating a fake benefit there would muddy the
 * environment contrast.
 */
function BannerBody({environment}: {environment: Environment}) {
    if (environment === "Clothing") {
        return (
            <p className={BODY_CLS}>
                We use cookies to remember your size, save items in your cart, and
                personalise recommendations across visits. See our{" "}
                <span className={LINK_CLS}>Privacy Policy.</span>
            </p>
        );
    }
    return (
        <p className={BODY_CLS}>
            Our website uses cookies. By continuing, we assume your permission to
            deploy cookies as detailed in our{" "}
            <span className={LINK_CLS}>Privacy Policy.</span>
        </p>
    );
}

function CookieBanner({
    profile,
    environment,
    onAction,
}: {
    profile: RenderProfile;
    environment: Environment;
    onAction: (action: ChosenAction) => void;
}) {
    return (
        <div className="rounded-xl border bg-white text-[#1a1535] shadow-2xl px-2.5 py-2 space-y-1.5 border-[#e5e5ec] ring-1 ring-black/5">
            <div className="flex items-center gap-1.5 min-w-0">
                <CookieIconBadge/>
                <h4 className={cn(HEADING_CLS, "truncate")}>Our website uses cookies</h4>
            </div>

            <BannerBody environment={environment}/>

            <p className="text-[9px] leading-snug text-[#6b6884]">
                Categories: necessary, analytics, marketing.
            </p>

            <BannerButtons profile={profile} onAction={onAction}/>
        </div>
    );
}

export function PositionedBanner({
    profile,
    environment,
    onAction,
}: {
    profile: RenderProfile;
    environment: Environment;
    onAction: (action: ChosenAction) => void;
}) {
    return (
        <div className="absolute inset-0 flex items-center justify-center px-3">
            <div className="absolute inset-0 bg-foreground/40 backdrop-blur-[1px] pointer-events-none"/>
            <div className="relative w-full max-w-[260px]">
                <CookieBanner profile={profile} environment={environment} onAction={onAction}/>
            </div>
        </div>
    );
}
