import {useEffect} from "react";
import {ConjointBanner} from "@/components/cookie-banner";
import {MiniStorefront} from "@/components/cookie-banner/storefront";
import {PositionedBanner} from "@/components/cookie-banner/banner";
import {toRenderProfile} from "@/lib/conjoint";
import {
    CONJOINT_ATTRIBUTES,
    ENVIRONMENTS,
} from "@/lib/conjoint";
import type {ConjointProfile, Environment} from "@/lib/conjoint";

const slug = (s: string) =>
    s.replace(/&/g, "and").replace(/[^a-zA-Z0-9]+/g, "-").replace(/(^-|-$)/g, "").toLowerCase();

interface Cell {
    environment: Environment;
    profile: ConjointProfile;
    id: string;
}

function buildCells(): Cell[] {
    const colors = CONJOINT_ATTRIBUTES.acceptColor.levels;
    const positions = CONJOINT_ATTRIBUTES.acceptPosition.levels;
    const cells: Cell[] = [];
    for (const environment of ENVIRONMENTS) {
        for (const acceptColor of colors) {
            for (const acceptPosition of positions) {
                cells.push({
                    environment,
                    profile: {acceptColor, acceptPosition},
                    id: `${slug(environment)}__${slug(acceptColor)}__${slug(acceptPosition)}`,
                });
            }
        }
    }
    return cells;
}

// eslint-disable-next-line react-refresh/only-export-components -- constant derived from the same cell layout, kept next to the component
export const GALLERY_CELL_IDS = buildCells().map((c) => c.id);

export function Gallery() {
    const cells = buildCells();
    const params = new URLSearchParams(window.location.search);
    const cellId = params.get("cell");

    useEffect(() => {
        const root = document.documentElement;
        const body = document.body;
        root.classList.remove("dark");
        root.classList.add("light");
        root.style.colorScheme = "light";
        root.style.background = "white";
        root.style.margin = "0";
        root.style.padding = "0";
        body.style.background = "white";
        body.style.margin = "0";
        body.style.padding = "0";
    }, []);

    if (cellId) {
        const cell = cells.find((c) => c.id === cellId);
        if (!cell) {
            return (
                <div className="p-6 text-sm">
                    Unknown cell id: <code>{cellId}</code>. Available ids:
                    <ul className="list-disc ml-6 mt-2">
                        {cells.map((c) => <li key={c.id}><code>{c.id}</code></li>)}
                    </ul>
                </div>
            );
        }
        return (
            <div style={{
                background: "white",
                minHeight: "100vh",
                padding: 0,
                margin: 0,
                colorScheme: "light",
            }}>
                <div
                    id={cell.id}
                    style={{
                        width: 600,
                        height: 320,
                        position: "relative",
                        overflow: "hidden",
                        background: "#f4f4f5",
                    }}
                >
                    <MiniStorefront environment={cell.environment}/>
                    <PositionedBanner
                        profile={toRenderProfile(cell.profile)}
                        environment={cell.environment}
                        onAction={() => undefined}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground p-6">
            <header className="max-w-5xl mx-auto mb-6">
                <h1 className="text-xl font-bold tracking-tight">Banner Gallery</h1>
                <p className="text-sm text-muted-foreground">
                    Deterministic render of every (environment × accept-color × accept-position) cell
                    for screenshot capture. Append <code>&amp;cell=&lt;id&gt;</code> to render any single
                    cell full-viewport.
                </p>
            </header>

            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                {cells.map((c) => (
                    <div key={c.id} id={c.id} className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wider">
                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">{c.environment}</span>
                            <span className="px-2 py-0.5 rounded-full bg-muted">{c.profile.acceptColor}</span>
                            <span className="px-2 py-0.5 rounded-full bg-muted">{c.profile.acceptPosition}</span>
                        </div>
                        <ConjointBanner
                            profile={c.profile}
                            environment={c.environment}
                            onAction={() => undefined}
                        />
                        <code className="text-[10px] text-muted-foreground break-all">{c.id}</code>
                    </div>
                ))}
            </div>
        </div>
    );
}
