import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { Send, Bot, User, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";

// Subcomponent for the "thinking" state
const TypingSkeleton = () => (
    <div className="flex items-start gap-4 animate-in fade-in duration-500">
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 shadow-sm">
            <Bot size={14} className="text-muted-foreground animate-pulse" />
        </div>
        <div className="bg-muted p-4 rounded-2xl rounded-tl-none w-24 space-y-2 border border-border/40">
            <div className="h-2 bg-muted-foreground/20 rounded-full animate-pulse" />
            <div className="h-2 bg-muted-foreground/10 rounded-full animate-pulse w-2/3" />
        </div>
    </div>
);

export default function MinimalChat() {
    const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
    const [input, setInput] = useState("");
    const [sessionId, setSessionId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [aiResponseCount, setAiResponseCount] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let id = localStorage.getItem("chat_session_id");
        if (!id) {
            id = uuidv4();
            localStorage.setItem("chat_session_id", id);
        }
        setSessionId(id);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages, isLoading, isStreaming]);

    const handleSend = async () => {
        if (!input.trim() || isLoading || aiResponseCount >= 10) return;

        const userMsg = { role: "user", content: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);
        setIsStreaming(false);

        try {
            const res = await fetch("https://danielfreiremendes.com/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId, message: input }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                alert(errorData.error || "Failed to send message");
                setIsLoading(false);
                return;
            }

            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            let accumulatedContent = "";

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    // Switch from Loading (Skeleton) to Streaming (Text) as soon as data arrives
                    if (!isStreaming) setIsStreaming(true);
                    if (isLoading) setIsLoading(false);

                    const chunk = decoder.decode(value);
                    const lines = chunk.split("\n");

                    for (const line of lines) {
                        if (line.startsWith("data: ") && line !== "data: [DONE]") {
                            try {
                                const data = JSON.parse(line.substring(6));
                                if (data.response && data.response !== "null") {
                                    accumulatedContent += data.response;
                                }

                                setMessages((prev) => {
                                    const updated = [...prev];
                                    const lastMsg = updated[updated.length - 1];

                                    if (lastMsg?.role === "assistant") {
                                        lastMsg.content = accumulatedContent;
                                        return updated;
                                    } else {
                                        return [...updated, { role: "assistant", content: accumulatedContent }];
                                    }
                                });
                            } catch (e) {
                                console.error("Error parsing chunk", e);
                            }
                        }
                    }
                }
                setAiResponseCount((prev) => prev + 1);
            }
        } catch (err) {
            console.error("Streaming error:", err);
        } finally {
            setIsLoading(false);
            setIsStreaming(false);
        }
    };

    return (
        <div className="flex flex-col h-screen max-w-4xl mx-auto bg-background text-foreground font-sans">
            <header className="flex items-center justify-between px-6 py-4 border-b bg-background/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="font-semibold text-sm leading-none">AI Assistant</h1>
                        <p className="text-[10px] text-muted-foreground mt-1 tracking-wider uppercase">Llama 3.1 8B Stream</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Badge variant={aiResponseCount >= 10 ? "destructive" : "outline"} className="px-3 py-1 font-mono text-xs">
                        {aiResponseCount} / 10
                    </Badge>
                    <Button variant="ghost" size="icon" className="hover:bg-destructive/10 group" onClick={() => {
                        const newId = uuidv4();
                        localStorage.setItem("chat_session_id", newId);
                        setSessionId(newId);
                        setMessages([]);
                        setAiResponseCount(0);
                    }}>
                        <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-destructive transition-colors" />
                    </Button>
                </div>
            </header>

            <ScrollArea className="flex-1 px-4 py-8" ref={scrollRef}>
                <div className="space-y-8 max-w-3xl mx-auto pb-10">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
                            <div className="p-4 rounded-full bg-muted/30">
                                <Bot className="w-10 h-10 text-muted-foreground/40" />
                            </div>
                            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed italic">
                                Welcome to the Nebuladw assistant. How can I help you today?
                            </p>
                        </div>
                    )}

                    {messages.map((m, i) => (
                        <div key={i} className={`flex items-start gap-4 ${m.role === "user" ? "flex-row-reverse" : "flex-row"} animate-in fade-in duration-300`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border ${
                                m.role === "user" ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-border"
                            }`}>
                                {m.role === "user" ? <User size={14} /> : <Bot size={14} />}
                            </div>
                            <div className={`leading-relaxed text-sm p-4 rounded-2xl shadow-sm border ${
                                m.role === "user"
                                    ? "bg-primary text-primary-foreground rounded-tr-none border-primary/20"
                                    : "bg-muted text-foreground rounded-tl-none border-border/40 max-w-[85%]"
                            }`}>
                                {m.role === "assistant" ? (
                                    <div className="prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-pre:bg-zinc-900 prose-pre:p-2 prose-ol:list-decimal prose-ul:list-disc">
                                        <ReactMarkdown>
                                            {m.content}
                                        </ReactMarkdown>
                                    </div>
                                ) : (
                                    m.content
                                )}
                            </div>
                        </div>
                    ))}

                    {isLoading && !isStreaming && <TypingSkeleton />}
                </div>
            </ScrollArea>

            <footer className="p-6 bg-gradient-to-t from-background via-background to-transparent border-t border-border/20">
                <div className="max-w-3xl mx-auto relative group">
                    <Input
                        className="h-14 pl-6 pr-14 rounded-2xl shadow-sm border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary transition-all bg-background/50 backdrop-blur-sm"
                        placeholder={aiResponseCount >= 10 ? "Daily limit reached" : "Ask about the database..."}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        disabled={isLoading || aiResponseCount >= 10}
                    />
                    <Button
                        size="icon"
                        className="absolute right-2 top-2 h-10 w-10 rounded-xl transition-transform active:scale-95 shadow-md"
                        onClick={handleSend}
                        disabled={isLoading || !input.trim() || aiResponseCount >= 10}
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                </div>
            </footer>
        </div>
    );
}