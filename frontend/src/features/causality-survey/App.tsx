import {useState, useMemo, useEffect} from "react";
import {ThemeProvider} from "@/features/causality-survey/components/theme-provider";
import {StatusBar} from "@/features/causality-survey/components/StatusBar";
import {Introduction} from "@/features/causality-survey/components/Introduction";
import {ChoiceTask} from "@/features/causality-survey/components/ChoiceTask";
import {DemographicsForm} from "@/features/causality-survey/components/DemographicsForm";
import {Gallery} from "@/features/causality-survey/components/Gallery";
import {Button} from "@/features/causality-survey/components/ui/button";
import {PartyPopper, Loader2, AlertCircle} from "lucide-react";
import {
    TOTAL_ROUNDS,
    generateRounds,
    submitToWorker,
    toChoiceTaskRecord,
} from "@/features/causality-survey/lib/conjoint";
import type {
    ChoiceTaskRecord,
    ChosenAction,
    Demographics,
    SubmissionPayload,
} from "@/features/causality-survey/lib/conjoint";
import {detectDevice} from "@/features/causality-survey/lib/deviceDetect";

export const SHELL = "w-full max-w-5xl mx-auto";

type Phase = "intro" | "choice" | "demographics" | "submitting" | "done" | "error";

export default function App() {
    const isGallery =
        typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).get("gallery") === "1";
    if (isGallery) {
        return (
            <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
                <Gallery/>
            </ThemeProvider>
        );
    }
    return <Survey/>;
}

function Survey() {
    const [sessionId] = useState(() => crypto.randomUUID());
    const [device] = useState(() => detectDevice());
    const [phase, setPhase] = useState<Phase>("intro");
    const [roundIndex, setRoundIndex] = useState(0); // 0-based
    const [startTime, setStartTime] = useState<number>(0);
    const [records, setRecords] = useState<ChoiceTaskRecord[]>([]);
    const [demographics, setDemographics] = useState<Demographics | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Pre-generate the full round sequence (3 rounds in each environment,
    // order randomised) up-front so re-rendering for any reason will not
    // re-roll the design for the participant.
    const [rounds] = useState(() => generateRounds());

    const steps = useMemo(
        () => ["Introduction", "Choice Tasks", "Details", "Thank You"],
        [],
    );
    const stepIndex =
        phase === "intro" ? 0
        : phase === "choice" ? 1
        : phase === "demographics" ? 2
        : phase === "done" ? 3
        : 2; // submitting / error sit on the demographics step

    // Capture the start time whenever a new round renders.
    useEffect(() => {
        if (phase === "choice") {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- records when the round appears; it is only read on submit
            setStartTime(Date.now());
        }
    }, [phase, roundIndex]);

    const handleStart = () => {
        setRoundIndex(0);
        setPhase("choice");
    };

    const handleChoose = (action: ChosenAction) => {
        const timeTakenMs = Date.now() - startTime;
        const {profile, environment} = rounds[roundIndex];

        const record = toChoiceTaskRecord({
            sessionId,
            roundNumber: roundIndex + 1,
            environment,
            profile,
            chosenAction: action,
            timeTakenMs,
        });

        const updated = [...records, record];
        setRecords(updated);

        if (roundIndex + 1 < TOTAL_ROUNDS) {
            setRoundIndex(roundIndex + 1);
        } else {
            setPhase("demographics");
        }
    };

    const handleDemographicsSubmit = (data: Demographics) => {
        setDemographics(data);
        void finishAndSubmit(records, data);
    };

    const finishAndSubmit = async (
        allRecords: ChoiceTaskRecord[],
        demo: Demographics,
    ) => {
        setPhase("submitting");
        setSubmitError(null);
        const payload: SubmissionPayload = {
            sessionId,
            demographics: demo,
            choiceTasks: allRecords,
            device,
        };
        try {
            await submitToWorker(payload);
            setPhase("done");
        } catch (err) {
            console.error("CBC submission failed", err);
            setSubmitError(err instanceof Error ? err.message : "Unknown error");
            setPhase("error");
        }
    };

    const handleRetry = () => {
        if (demographics) {
            void finishAndSubmit(records, demographics);
        }
    };

    return (
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <div className="min-h-screen bg-background text-foreground flex flex-col">

                {/* Decorative background */}
                <div
                    className="fixed inset-0 pointer-events-none select-none opacity-[0.03] dark:opacity-[0.05]"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                        backgroundSize: "32px 32px",
                    }}
                />

                {/* Header */}
                <header className="relative z-20 w-full flex justify-center px-3 sm:px-6 pt-3 sm:pt-6">
                    <div className="w-full max-w-5xl bg-card border border-border shadow-sm rounded-2xl flex flex-col md:flex-row items-center justify-between px-4 sm:px-5 py-3 sm:py-4 gap-3 md:gap-6 backdrop-blur-sm">
                        <div className="flex flex-col items-center md:items-start shrink-0 text-center md:text-left">
                            <span className="font-bold text-[12px] sm:text-sm tracking-tight text-foreground uppercase leading-none mb-1 sm:mb-1.5">
                                Cookie Banner Behaviour Study
                            </span>
                            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider leading-none">
                                Católica Lisbon
                            </span>
                        </div>

                        {phase !== "done" && (
                            <div className="w-full overflow-x-auto pb-1 md:pb-0 flex justify-center md:justify-end [mask-image:linear-gradient(to_right,transparent,black_10px,black_calc(100%-10px),transparent)] md:[mask-image:none]">
                                <StatusBar steps={steps} currentStepIndex={stepIndex}/>
                            </div>
                        )}
                    </div>
                </header>

                {/* Page content */}
                <main className="relative z-10 flex-1 flex flex-col items-center px-3 sm:px-6 pb-8 sm:pb-10 pt-5 sm:pt-8">
                    <div className={`${SHELL} flex flex-col gap-0`}>

                        {phase === "intro" && <Introduction onNext={handleStart}/>}

                        {phase === "choice" && (
                            <ChoiceTask
                                key={roundIndex}
                                roundNumber={roundIndex + 1}
                                totalRounds={TOTAL_ROUNDS}
                                environment={rounds[roundIndex].environment}
                                profile={rounds[roundIndex].profile}
                                onChoose={handleChoose}
                            />
                        )}

                        {phase === "demographics" && (
                            <DemographicsForm onSubmit={handleDemographicsSubmit} isLoading={false}/>
                        )}

                        {phase === "submitting" && (
                            <div className="rounded-2xl border border-border bg-card shadow-sm p-8 sm:p-12 flex flex-col items-center text-center gap-4">
                                <Loader2 className="w-8 h-8 text-primary animate-spin"/>
                                <h2 className="text-lg sm:text-xl font-bold tracking-tight">Submitting your responses…</h2>
                                <p className="text-muted-foreground text-sm">Please don't close this tab.</p>
                            </div>
                        )}

                        {phase === "error" && (
                            <div className="rounded-2xl border border-destructive/30 bg-card shadow-sm p-6 sm:p-10 flex flex-col items-center text-center gap-4">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
                                    <AlertCircle className="w-6 h-6 sm:w-7 sm:h-7 text-destructive"/>
                                </div>
                                <h2 className="text-lg sm:text-xl font-bold tracking-tight">Submission failed</h2>
                                <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
                                    {submitError ?? "We couldn't reach the server."} You can try again — your answers are still saved locally.
                                </p>
                                <Button onClick={handleRetry} className="rounded-xl">Retry submission</Button>
                            </div>
                        )}

                        {phase === "done" && (
                            <div className="rounded-2xl border border-border bg-card shadow-sm p-8 sm:p-12 flex flex-col items-center text-center gap-4">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-1 sm:mb-2">
                                    <PartyPopper className="w-7 h-7 sm:w-8 sm:h-8 text-primary"/>
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Thank you!</h2>
                                <p className="text-muted-foreground text-sm sm:text-base max-w-sm leading-relaxed">
                                    You completed all {TOTAL_ROUNDS} rounds. Your responses help us
                                    understand how people actually interact with cookie banners.
                                </p>
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-2">
                                    <span>Anonymous</span>
                                    <span className="opacity-40">•</span>
                                    <span>Submitted</span>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </ThemeProvider>
    );
}
