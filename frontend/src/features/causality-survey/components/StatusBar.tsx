import {Check} from "lucide-react";
import {cn} from "@/features/causality-survey/lib/utils";

const STEP_LABELS: {[key: string]: string} = {
    Introduction: "Intro",
    Choice: "Choice Tasks",
    Details: "Details",
    ThankYou: "Thank You",
};

interface StatusBarProps {
    steps: string[];
    currentStepIndex: number;
}

export function StatusBar({steps, currentStepIndex}: StatusBarProps) {
    const normalizedSteps = steps.map(s => {
        const lower = s.toLowerCase();
        if (lower.includes("thank")) return "ThankYou";
        if (lower.includes("introduction") || lower.includes("intro")) return "Introduction";
        if (lower.includes("choice")) return "Choice";
        return "Details";
    });

    return (
        <ol className="flex items-center justify-center gap-0">
            {normalizedSteps.map((stepKey, index) => {
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const isLast = index === normalizedSteps.length - 1;

                return (
                    <li key={`step-${index}`} className="flex items-center">
                        {/* Step pill */}
                        <div className="flex items-center gap-1.5">
                            <div className={cn(
                                "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 shrink-0",
                                isCompleted && "bg-primary text-primary-foreground",
                                isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/15",
                                !isCompleted && !isCurrent && "bg-muted text-muted-foreground border border-border"
                            )}>
                                {isCompleted ? (
                                    <Check className="w-2.5 h-2.5 stroke-[3]"/>
                                ) : (
                                    <span>{index + 1}</span>
                                )}
                            </div>
                            <span className={cn(
                                "hidden sm:inline text-[11px] font-semibold transition-colors whitespace-nowrap",
                                isCurrent ? "text-foreground" : "text-muted-foreground"
                            )}>
                                {STEP_LABELS[stepKey] || stepKey}
                            </span>
                        </div>
                        {/* Connector */}
                        {!isLast && (
                            <div className={cn(
                                "w-4 sm:w-10 h-px mx-1.5 sm:mx-2 transition-colors duration-500 shrink-0",
                                isCompleted ? "bg-primary" : "bg-border"
                            )}/>
                        )}
                    </li>
                );
            })}
        </ol>
    );
}