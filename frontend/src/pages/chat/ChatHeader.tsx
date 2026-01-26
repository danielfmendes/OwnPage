import {Menu, User, ChevronDown, Check, Moon, Sun} from "lucide-react";
import {Link} from "react-router-dom";
import {useTheme} from "next-themes";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";

interface ChatHeaderProps {
    toggleSidebar: () => void;
    aiMode: string;
    setAiMode: (mode: string) => void;
    userEmail?: string;
}

export function ChatHeader({toggleSidebar, aiMode, setAiMode, userEmail}: ChatHeaderProps) {
    const modes = ['balanced', 'creative', 'precise', 'technical'];
    const {theme, setTheme} = useTheme();

    return (
        <header
            className="h-20 border-b border-zinc-200 dark:border-zinc-800/50 bg-white/80 dark:bg-black/20 backdrop-blur-xl flex items-center justify-between px-4 sm:px-8 z-30 relative transition-colors duration-300">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="lg:hidden text-zinc-500 dark:text-zinc-400"
                        onClick={toggleSidebar}>
                    <Menu size={20}/>
                </Button>

                <Link to="/" className="flex items-center gap-2 group transition-all">
                    <div className="p-2 rounded-lg group-hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all">
                        <img src="/logo/white.png" alt="DFM Logo" className="w-8 h-8 dark:hidden block"/>
                        <img src="/logo/black.png" alt="DFM Logo" className="w-8 h-8 hidden dark:block"/>
                    </div>
                    <span className="font-bold text-xl tracking-tighter hidden xs:block text-zinc-900 dark:text-white">
                        DFM
                    </span>
                </Link>
            </div>

            <div className="flex items-center gap-3">
                {/* 1. AI MODE DROPDOWN */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            className="rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/50 text-xs h-9 gap-2 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-all"
                        >
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"/>
                            {aiMode.charAt(0).toUpperCase() + aiMode.slice(1)}
                            <ChevronDown size={14} className="text-zinc-500"/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end"
                                         className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl w-44 p-1 shadow-2xl backdrop-blur-xl">
                        <div
                            className="px-2 py-1.5 text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">AI
                            Personality
                        </div>
                        {modes.map((mode) => (
                            <DropdownMenuItem
                                key={mode}
                                onClick={() => setAiMode(mode)}
                                className={`capitalize cursor-pointer rounded-lg mb-0.5 flex justify-between items-center transition-colors ${
                                    aiMode === mode ? "bg-blue-600/10 text-blue-600 dark:text-blue-400 font-medium" : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                                }`}
                            >
                                {mode}
                                {aiMode === mode && <Check size={14}
                                                           className="text-blue-600 dark:text-blue-500 animate-in zoom-in duration-200"/>}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* 2. VISIBLE THEME TOGGLE */}
                <div className="pl-3 border-l border-zinc-200 dark:border-zinc-800/50">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl text-zinc-500 hover:text-blue-500 hover:bg-blue-500/10 transition-all"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    >
                        <Sun
                            className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"/>
                        <Moon
                            className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"/>
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                </div>

                {/* 3. USER PROFILE */}
                <div className="flex items-center gap-3">
                    <div className="hidden sm:block text-right">
                        <p className="text-xs font-medium text-zinc-900 dark:text-white leading-none mb-1 truncate max-w-[120px]">{userEmail || "Guest"}</p>
                        <p className="text-[10px] text-zinc-500 leading-none">Free Account</p>
                    </div>
                    <div
                        className="w-9 h-9 rounded-full bg-gradient-to-tr bg-blue-600 border-blue-400 flex items-center justify-center border shadow-lg cursor-pointer">
                        <User size={18} className="text-white"/>
                    </div>
                </div>
            </div>
        </header>
    );
}