import {cn} from "@/features/causality-survey/lib/utils";

/**
 * Pill toggle that mirrors the reference screenshots: black-filled when on,
 * soft-grey track when off, white knob on top.
 */
function MockToggle({on}: {on: boolean}) {
    return (
        <div
            className={cn(
                "relative w-7 h-3.5 rounded-full transition-colors",
                on ? "bg-black" : "bg-[#d6d4dc]",
            )}
        >
            <div
                className={cn(
                    "absolute top-[1px] w-2.5 h-2.5 rounded-full bg-white shadow-sm transition-all",
                    on ? "left-[15px]" : "left-[1px]",
                )}
            />
        </div>
    );
}

export function GranularList({visualStyle}: {visualStyle: string}) {
    const colorCoded = visualStyle === "Color-coded";
    const rows: Array<{label: string; on: boolean; locked?: boolean; tone: string}> = [
        {label: "Necessary", on: true, locked: true, tone: "text-[#1a1535]"},
        {label: "Analytics", on: false, tone: colorCoded ? "text-[#2da4ee]" : "text-[#1a1535]"},
        {label: "Marketing", on: false, tone: colorCoded ? "text-purple-600" : "text-[#1a1535]"},
    ];
    return (
        <div className="space-y-1 py-1.5 my-1 border-y border-[#ececf2]">
            {rows.map((r) => (
                <div
                    key={r.label}
                    className="flex items-center justify-between text-[9px] rounded-md bg-[#f7f7fa] px-1.5 py-1"
                >
                    <span className={cn("font-bold", r.tone)}>
                        {r.label}
                        {r.locked && (
                            <span className="ml-1 font-normal text-[8px] text-[#6b6884]">
                                Always active
                            </span>
                        )}
                    </span>
                    {r.locked ? null : <MockToggle on={r.on}/>}
                </div>
            ))}
        </div>
    );
}
