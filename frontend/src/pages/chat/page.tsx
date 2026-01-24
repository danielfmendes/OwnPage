import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { Send, Bot, User, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function MinimalChat() {
    const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
    const [input, setInput] = useState("");
    const [sessionId, setSessionId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [aiResponseCount, setAiResponseCount] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Session Management
    useEffect(() => {
        let id = localStorage.getItem("chat_session_id");
        if (!id) {
            id = uuidv4();
            localStorage.setItem("chat_session_id", id);
        }
        setSessionId(id);
    }, []);

    // Auto-Scroll Logic
    useEffect(() => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || isLoading || aiResponseCount >= 10) return;

        const userMsg = { role: "user", content: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("https://danielfreiremendes.com/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId, message: input }),
            });
            const data = await res.json();

            if (res.ok) {
                setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
                setAiResponseCount((prev) => prev + 1);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen max-w-4xl mx-auto bg-background text-foreground">
            {/* Header - Minimal & Clean */}
            <header className="flex items-center justify-between px-6 py-4 border-b bg-background/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="font-semibold text-sm">AI Assistant</h1>
                        <p className="text-xs text-muted-foreground">Llama 3.1 Powered</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Badge variant={aiResponseCount >= 10 ? "destructive" : "outline"} className="px-3 py-1">
                        {aiResponseCount} / 10
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => {
                        const newId = uuidv4();
                        localStorage.setItem("chat_session_id", newId);
                        setSessionId(newId);
                        setMessages([]);
                        setAiResponseCount(0);
                    }}>
                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                </div>
            </header>

            {/* Chat Area */}
            <ScrollArea className="flex-1 px-6 py-8" ref={scrollRef}>
                <div className="space-y-8 max-w-3xl mx-auto">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
                            <Bot className="w-12 h-12 text-muted-foreground/20" />
                            <p className="text-muted-foreground text-sm max-w-xs">
                                Wie kann ich dir heute helfen? Deine Konversation wird über D1 gespeichert.
                            </p>
                        </div>
                    )}

                    {messages.map((m, i) => (
                        <div key={i} className={`flex items-start gap-4 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}>
                                {m.role === "user" ? <User size={14} /> : <Bot size={14} />}
                            </div>
                            <div className={`leading-relaxed text-sm p-4 rounded-2xl ${
                                m.role === "user"
                                    ? "bg-primary text-primary-foreground rounded-tr-none"
                                    : "bg-muted text-foreground rounded-tl-none"
                            }`}>
                                {m.content}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                            </div>
                            <div className="bg-muted h-10 w-24 rounded-2xl rounded-tl-none animate-pulse" />
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Footer - Floating Input Look */}
            <footer className="p-6 bg-gradient-to-t from-background via-background to-transparent">
                <div className="max-w-3xl mx-auto relative group">
                    <Input
                        className="h-14 pl-6 pr-14 rounded-2xl shadow-sm border-muted-foreground/20 focus-visible:ring-primary transition-all bg-muted/30 backdrop-blur-sm"
                        placeholder={aiResponseCount >= 10 ? "Limit erreicht" : "Frage etwas..."}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        disabled={isLoading || aiResponseCount >= 10}
                    />
                    <Button
                        size="icon"
                        className="absolute right-2 top-2 h-10 w-10 rounded-xl transition-transform active:scale-95"
                        onClick={handleSend}
                        disabled={isLoading || !input.trim() || aiResponseCount >= 10}
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
                <p className="text-[10px] text-center text-muted-foreground mt-4 uppercase tracking-widest font-medium">
                    DANIELFREIREMENDES AI • 10 Antworten Limit
                </p>
            </footer>
        </div>
    );
}