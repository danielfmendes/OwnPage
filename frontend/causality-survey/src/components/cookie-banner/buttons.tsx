import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import type {ChosenAction, RenderProfile} from "@/lib/conjoint";

/**
 * Cookie-banner CTAs.
 *
 * Two design factors are composed here:
 *
 *   1. `acceptColor`     — visual emphasis on Accept: filled black (high),
 *                          filled grey (mid), or outlined (low, matches
 *                          Reject). Reject is always outlined.
 *   2. `acceptPosition`  — horizontal slot of the Accept button. "Left"
 *                          places Accept first in the row, "Right" places
 *                          Reject first. The two-button layout is fixed.
 *
 * Wording is pinned to "Standard" so only the two manipulated levers move.
 * Buttons are real click targets — clicking one fires `onAction(action)`
 * so the parent can record the chosen behaviour (Accept / Reject).
 */

const WORDING = {
    accept: "Accept cookies",
    reject: "Decline cookies",
};

type Tone = "black" | "grey" | "outlined";

function toneFor(color: string): Tone {
    switch (color) {
        case "Black":
            return "black";
        case "Grey":
            return "grey";
        case "Outlined":
        default:
            return "outlined";
    }
}

const TONE_CLS: Record<Tone, string> = {
    black:
        "bg-black text-white hover:bg-black/90 border border-black",
    grey:
        "bg-[#9a98a8] text-white hover:bg-[#888699] border border-[#9a98a8]",
    outlined:
        "bg-white text-black border border-black hover:bg-neutral-50",
};

const BASE_CLS =
    "min-h-7 h-auto py-1 text-[10px] leading-tight text-center cursor-pointer px-2 font-bold flex-1 min-w-0 rounded-md whitespace-normal break-words transition-colors";

interface BannerButtonsProps {
    profile: RenderProfile;
    onAction: (action: ChosenAction) => void;
}

const fire = (action: ChosenAction, onAction: (action: ChosenAction) => void) =>
    (e: React.MouseEvent | React.KeyboardEvent) => {
        e.stopPropagation();
        onAction(action);
    };

export function BannerButtons({profile, onAction}: BannerButtonsProps) {
    const {acceptColor, acceptPosition} = profile;
    const acceptTone = toneFor(acceptColor);
    const rejectTone: Tone = "outlined";

    const acceptCls = cn(BASE_CLS, TONE_CLS[acceptTone]);
    const rejectCls = cn(BASE_CLS, TONE_CLS[rejectTone]);

    const onAccept = fire("Accept", onAction);
    const onReject = fire("Reject", onAction);

    const acceptButton = (
        <Button size="sm" className={acceptCls} onClick={onAccept}>
            {WORDING.accept}
        </Button>
    );
    const rejectButton = (
        <Button size="sm" className={rejectCls} onClick={onReject}>
            {WORDING.reject}
        </Button>
    );

    return (
        <div className="flex gap-1.5 pt-0.5">
            {acceptPosition === "Left" ? (
                <>{acceptButton}{rejectButton}</>
            ) : (
                <>{rejectButton}{acceptButton}</>
            )}
        </div>
    );
}
