import {Progress} from "@/features/causality-survey/components/ui/progress";
import {Shirt, Calculator} from "lucide-react";
import {ConjointBanner} from "@/features/causality-survey/components/cookie-banner";
import type {ChosenAction, ConjointProfile, Environment} from "@/features/causality-survey/lib/conjoint";

interface ChoiceTaskProps {
    roundNumber: number;
    totalRounds: number;
    environment: Environment;
    profile: ConjointProfile;
    onChoose: (action: ChosenAction) => void;
}

interface EnvironmentCopy {
    label: string;
    tagline: string;
    cookieBenefits: string[];
    Icon: typeof Shirt;
    accent: string;
}

const ENVIRONMENT_COPY: Record<Environment, EnvironmentCopy> = {
    Clothing: {
        label: "Clothing shop",
        tagline: "You're browsing an online clothing store you might come back to.",
        cookieBenefits: [
            "Remember your size",
            "Save items in your cart",
            "Personalise recommendations across visits",
        ],
        Icon: Shirt,
        accent: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
    },
    "Currency Converter": {
        label: "Currency converter",
        tagline: "You're using a one-shot currency converter — you only need it for this single task.",
        cookieBenefits: [
            "Nothing meaningful — this is a one-off visit, no preferences worth remembering",
        ],
        Icon: Calculator,
        accent: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30",
    },
};

export function ChoiceTask({
    roundNumber,
    totalRounds,
    environment,
    profile,
    onChoose,
}: ChoiceTaskProps) {
    const progress = (roundNumber / totalRounds) * 100;
    const {label, tagline, cookieBenefits, Icon, accent} = ENVIRONMENT_COPY[environment];

    return (
        <div className="flex flex-col gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

            {/* Round progress */}
            <div className="rounded-2xl border border-border bg-card shadow-sm px-4 sm:px-7 py-4 sm:py-5">
                <div className="flex items-center justify-between mb-2.5 gap-3 flex-wrap">
                    <div className="min-w-0 flex items-center gap-3">
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                                Choice Task
                            </p>
                            <h2 className="text-base sm:text-xl font-bold tracking-tight">
                                Round {roundNumber} of {totalRounds}
                            </h2>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <span className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full border ${accent}`}>
                            <Icon className="w-3.5 h-3.5"/>
                            {label}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-primary bg-primary/10 px-2.5 sm:px-3 py-1 rounded-full tabular-nums">
                            {roundNumber}/{totalRounds}
                        </span>
                    </div>
                </div>
                <Progress value={progress} className="h-1.5"/>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 rounded-xl bg-muted/50 border border-border/60 px-3 py-2.5">
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            Scenario
                        </p>
                        <p className="text-sm leading-snug mt-0.5">
                            <span className="font-semibold">{tagline}</span>{" "}
                            <span className="text-muted-foreground">Imagine you just landed here. Click whatever button you'd actually press on the cookie banner.</span>
                        </p>
                    </div>
                    <div className="md:border-l md:border-border/60 md:pl-3 md:max-w-[260px]">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            What cookies could do here
                        </p>
                        <ul className="mt-1 space-y-0.5">
                            {cookieBenefits.map((b, i) => (
                                <li key={i} className="text-xs leading-snug flex items-start gap-1.5">
                                    <span className="text-muted-foreground mt-[1px]">•</span>
                                    <span>{b}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Single banner, full-width within the page shell */}
            <ConjointBanner
                profile={profile}
                environment={environment}
                onAction={onChoose}
            />
        </div>
    );
}
