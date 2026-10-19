import {useState, useEffect} from "react";
import {Moon, Sun} from "lucide-react";
import {Button} from "@/components/ui/button";
import {IngestionPlayground} from "./IngestionPlayground";

export function Header() {
    const [isDark, setIsDark] = useState(false);

    // Toggle Dark Mode Class on <html>
    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    return (
        <header
            className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
            <div className="flex h-16 items-center justify-between px-6 md:px-8">

                {/* 1. Logo Section */}
                <div className="flex items-center gap-3">
                    <a
                        href="https://danielfreiremendes.com"
                        className="transition-opacity hover:opacity-80"
                    >
                        <div
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <img src="/static/feedback-pulse/png/black.png" alt="Logo" className="h-5 w-5 dark:hidden"/>
                            <img src="/static/feedback-pulse/png/white.png" alt="Logo" className="hidden h-5 w-5 dark:block"/>
                        </div>
                    </a>
                    <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                        Feedback Prototype
                    </span>
                </div>

                {/* 2. Controls Section */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsDark(!isDark)}
                        className="rounded-full text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                    >
                        {isDark ? <Sun size={20}/> : <Moon size={20}/>}
                    </Button>

                    <div className="hidden h-6 w-px bg-zinc-200 dark:bg-zinc-800 md:block"/>

                    <IngestionPlayground/>
                </div>
            </div>
        </header>
    );
}