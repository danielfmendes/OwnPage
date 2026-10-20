import {BarChart3, ShieldCheck, Target} from "lucide-react";

const ROW_BASE = "flex items-center gap-1.5 text-[9px] font-semibold";

export function CategoryChips({visualStyle}: {visualStyle: string}) {
    if (visualStyle === "Minimalist") {
        return (
            <p className="text-[9px] leading-snug text-[#6b6884]">
                Categories: necessary, analytics, marketing.
            </p>
        );
    }
    if (visualStyle === "Iconographic") {
        return (
            <ul className="leading-snug space-y-0.5">
                <li className={`${ROW_BASE} text-[#1a1535]`}>
                    <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-sm bg-[#ebebef]">
                        <ShieldCheck className="w-2.5 h-2.5 text-[#1a1535]"/>
                    </span>
                    Necessary
                </li>
                <li className={`${ROW_BASE} text-[#1a1535]`}>
                    <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-sm bg-[#ebebef]">
                        <BarChart3 className="w-2.5 h-2.5 text-[#1a1535]"/>
                    </span>
                    Analytics
                </li>
                <li className={`${ROW_BASE} text-[#1a1535]`}>
                    <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-sm bg-[#ebebef]">
                        <Target className="w-2.5 h-2.5 text-[#1a1535]"/>
                    </span>
                    Marketing
                </li>
            </ul>
        );
    }
    // Color-coded
    return (
        <div className="flex flex-wrap gap-1">
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                Necessary
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-700">
                Analytics
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                Marketing
            </span>
        </div>
    );
}
