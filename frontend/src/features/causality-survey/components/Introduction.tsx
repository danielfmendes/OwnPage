import {Cookie, CheckCircle2, ArrowRight, Clock, Lock} from "lucide-react";
import {Button} from "@/features/causality-survey/components/ui/button";
import {TOTAL_ROUNDS} from "@/features/causality-survey/lib/conjoint";

export function Introduction({onNext}: {onNext: () => void}) {
    const tasks = [
        {label: "You'll see one cookie banner per round", sub: "On a real-looking website, just like in everyday browsing"},
        {label: "Two website contexts", sub: "A clothing shop you might revisit, and a one-off currency converter"},
        {label: "Click whatever you'd actually press", sub: `${TOTAL_ROUNDS} rounds total · we submit your responses anonymously`},
    ];

    return (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            {/* Top accent */}
            <div className="h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60"/>

            <div className="p-5 sm:p-8 lg:p-10 flex flex-col md:flex-row gap-6 md:gap-10 lg:gap-12">

                {/* LEFT: branding side */}
                <div className="flex flex-col gap-4 sm:gap-6 md:w-5/12">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Cookie className="w-5 h-5 text-primary"/>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Behavioural Study</p>
                            <p className="text-sm font-semibold">Cookie Banner Behaviour</p>
                        </div>
                    </div>

                    <div>
                        <h1 className="text-xl sm:text-3xl font-bold tracking-tight leading-tight mb-2 sm:mb-3">
                            How would you<br/>
                            <span className="text-primary">click this banner?</span>
                        </h1>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            We'll show you {TOTAL_ROUNDS} short scenarios, each with a cookie banner on a website. Just click the button you'd actually press.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5"/>
                            <span>2–3 minutes</span>
                        </div>
                        <div className="w-px h-3 bg-border"/>
                        <div className="flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5"/>
                            <span>Anonymous & private</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT: steps + CTA */}
                <div className="flex flex-col gap-5 md:flex-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">How it works</p>

                    <ol className="flex flex-col gap-2 sm:gap-3">
                        {tasks.map((t, i) => (
                            <li key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/50 border border-border/60">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-primary"/>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold leading-snug">{t.label}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{t.sub}</p>
                                </div>
                            </li>
                        ))}
                    </ol>

                    <Button
                        onClick={onNext}
                        size="lg"
                        className="w-full h-11 text-sm font-semibold rounded-xl group mt-1"
                    >
                        Begin
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform"/>
                    </Button>
                </div>
            </div>
        </div>
    );
}