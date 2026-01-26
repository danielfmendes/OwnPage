import {Plus, MessageSquare, LogOut} from "lucide-react";
import {Button} from "@/components/ui/button";
import {ScrollArea} from "@/components/ui/scroll-area";
import type {Session} from "@/models/chat/chatApi.ts";

interface ChatSidebarProps {
    isOpen: boolean;
    setOpen: (open: boolean) => void;
    sessions: Session[];
    activeId: string;
    setActiveId: (id: string) => void;
    onCreateSession: () => void;
}

export function ChatSidebar({isOpen, setOpen, sessions, activeId, setActiveId, onCreateSession}: ChatSidebarProps) {
    const handleSignOut = () => {
        localStorage.removeItem("chat_token");
        window.location.href = "/chat/login";
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-[40] lg:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`fixed inset-y-0 left-0 z-[50] w-72 
                    bg-white/80 dark:bg-zinc-950/40 
                    backdrop-blur-2xl border-r border-zinc-200 dark:border-zinc-800/50 
                    transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex flex-col h-full p-4">
                    {/* Create Session Button */}
                    <Button
                        onClick={onCreateSession}
                        disabled={sessions.length >= 5}
                        className="w-full justify-start gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl h-12 mb-4 shadow-lg shadow-blue-600/20 disabled:opacity-50"
                    >
                        <Plus size={18}/>
                        New Chat ({sessions.length}/5)
                    </Button>

                    {/* Sessions List */}
                    <ScrollArea className="flex-1 -mx-2 px-2">
                        <div className="space-y-1">
                            {sessions.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => {
                                        setActiveId(s.id);
                                        setOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all border ${
                                        activeId === s.id
                                            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border-zinc-200 dark:border-zinc-700 shadow-sm"
                                            : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 border-transparent"
                                    }`}
                                >
                                    <MessageSquare size={16} className="shrink-0"/>
                                    <span className="truncate block max-w-[180px] text-left">
                                        {s.title || "New Conversation"}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </ScrollArea>

                    {/* Bottom Section */}
                    <div className="pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-800/50">
                        <Button
                            onClick={handleSignOut}
                            variant="ghost"
                            className="w-full justify-start gap-3 text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 rounded-xl"
                        >
                            <LogOut size={18}/> Sign Out
                        </Button>
                    </div>
                </div>
            </aside>
        </>
    );
}