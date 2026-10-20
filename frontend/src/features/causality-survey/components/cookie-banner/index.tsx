import {Card, CardContent} from "@/features/causality-survey/components/ui/card";
import {MousePointerClick} from "lucide-react";
import type {ChosenAction, ConjointProfile, Environment} from "@/features/causality-survey/lib/conjoint";
import {toRenderProfile} from "@/features/causality-survey/lib/conjoint";
import {MiniStorefront} from "./storefront";
import {PositionedBanner} from "./banner";

interface ConjointBannerProps {
    profile: ConjointProfile;
    environment: Environment;
    onAction: (action: ChosenAction) => void;
}

export function ConjointBanner({profile, environment, onAction}: ConjointBannerProps) {
    return (
        <Card
            className="group/card overflow-hidden flex flex-col gap-0 py-0 transition-all duration-200 border-2 hover:border-primary hover:shadow-xl hover:shadow-primary/20"
        >
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Website Preview
                </span>
            </div>

            <CardContent className="px-0 py-0">
                <div className="relative w-full h-[260px] sm:h-[300px] overflow-hidden">
                    <MiniStorefront environment={environment}/>
                    <PositionedBanner
                        profile={toRenderProfile(profile)}
                        environment={environment}
                        onAction={onAction}
                    />
                </div>
            </CardContent>

            <div className="px-3 sm:px-4 py-2.5 bg-muted/30 border-t border-border flex items-center justify-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                <MousePointerClick className="w-3.5 h-3.5"/>
                <span>Click whatever button you'd actually press</span>
            </div>
        </Card>
    );
}
