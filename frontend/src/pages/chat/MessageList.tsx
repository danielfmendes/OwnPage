import {useState, useRef, useEffect} from "react";
import {Send, Bot, User, Loader2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {ScrollArea} from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import {chatApi, type Message} from "@/models/chat/chatApi.ts";

interface MessageListProps {
    sessionId: string;
    onNewMessageSent: () => void;
}

export function MessageList({sessionId, onNewMessageSent}: MessageListProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);

    const scrollEndRef = useRef<HTMLDivElement>(null);

    const isLimitReached = messages.length >= 20;
    const messagePairs = Math.ceil(messages.length / 2);
    const limitPercentage = (messagePairs / 10) * 100;

    const isLoadingHistory = isLoading && messages.length === 0;

    useEffect(() => {
        setMessages([]);
        if (sessionId) fetchHistory();
    }, [sessionId]);

    useEffect(() => {
        if (scrollEndRef.current) {
            scrollEndRef.current.scrollIntoView({behavior: "smooth"});
        }
    }, [messages, isLoading, isStreaming]);

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            const data = await chatApi.getHistory(sessionId);
            setMessages(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading || isLimitReached) return;

        const isFirstMessage = messages.length === 0;
        const userMsg: Message = {role: "user", content: input};

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await chatApi.streamMessage(sessionId, userMsg.content);
            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            let accumulated = "";

            if (reader) {
                while (true) {
                    const {done, value} = await reader.read();
                    if (done) break;

                    if (!isStreaming) setIsStreaming(true);
                    setIsLoading(false);

                    const chunk = decoder.decode(value);
                    const lines = chunk.split("\n");

                    for (const line of lines) {
                        if (line.startsWith("data: ") && line !== "data: [DONE]") {
                            try {
                                const data = JSON.parse(line.substring(6));
                                if (data.response) accumulated += data.response;

                                setMessages((prev) => {
                                    const updated = [...prev];
                                    if (updated[updated.length - 1]?.role === "assistant") {
                                        updated[updated.length - 1].content = accumulated;
                                        return updated;
                                    }
                                    return [...updated, {role: "assistant", content: accumulated}];
                                });
                            } catch (e) {
                                console.error(e);
                            }
                        }
                    }
                }
                if (isFirstMessage) onNewMessageSent();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
            setIsStreaming(false);
        }
    };

    return (
        <div
            className="flex flex-col h-full w-full bg-white dark:bg-[#09090b] overflow-hidden transition-colors duration-300">
            {/* Messages Area */}
            <div className="flex-1 min-h-0 w-full flex flex-col">
                <ScrollArea className="h-full w-full">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
                        {isLoadingHistory ? (
                            <div className="space-y-6 animate-pulse">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i}
                                         className={`flex items-start gap-4 ${i % 2 === 0 ? "flex-row-reverse" : "flex-row"}`}>
                                        <div className="w-8 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-800/50 shrink-0"/>
                                        <div
                                            className={`h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800/30 w-[40%] ${i % 2 === 0 ? "rounded-tr-none" : "rounded-tl-none"}`}/>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <>
                                {messages.length === 0 && (
                                    <div
                                        className="flex flex-col items-center justify-center h-[50vh] text-center opacity-40">
                                        <Bot size={32} className="text-zinc-400 dark:text-zinc-600 mb-4"/>
                                        <p className="text-sm italic text-zinc-600 dark:text-zinc-400">New session
                                            started. How can I assist you?</p>
                                    </div>
                                )}

                                {messages.map((m, i) => (
                                    <div key={i}
                                         className={`flex items-start gap-3 sm:gap-4 ${m.role === "user" ? "flex-row-reverse" : "flex-row"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                        <div
                                            className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border ${m.role === "user" ? "bg-blue-600 border-blue-400" : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 shadow-sm"}`}>
                                            {m.role === "user" ? <User size={14} className="text-white"/> :
                                                <Bot size={14} className="text-blue-600 dark:text-blue-400"/>}
                                        </div>
                                        <div
                                            className={`text-sm p-4 rounded-2xl border ${m.role === "user" ? "bg-blue-600 border-blue-500 text-white rounded-tr-none shadow-blue-500/10" : "bg-zinc-50 dark:bg-zinc-900/50 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800 rounded-tl-none shadow-sm max-w-[85%]"} backdrop-blur-md`}>
                                            {m.role === "assistant" ? (
                                                <div
                                                    className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-100 dark:prose-pre:bg-zinc-950">
                                                    <ReactMarkdown>{m.content}</ReactMarkdown>
                                                </div>
                                            ) : (
                                                <span className="whitespace-pre-wrap">{m.content}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}

                        {isLoading && !isLoadingHistory && !isStreaming && (
                            <div className="flex gap-4 animate-pulse ml-12">
                                <div
                                    className="h-12 w-24 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl rounded-tl-none"/>
                            </div>
                        )}

                        <div ref={scrollEndRef} className="h-1 w-full"/>
                    </div>
                </ScrollArea>
            </div>

            {/* Input Area */}
            <div
                className="shrink-0 w-full bg-white dark:bg-[#09090b] border-t border-zinc-200 dark:border-zinc-800/50 z-20 transition-colors duration-300">
                <div className="max-w-3xl mx-auto px-4 py-4 sm:py-5 space-y-3">
                    <div
                        className="flex items-center justify-between px-1 opacity-60 dark:opacity-40 hover:opacity-100 transition-opacity">
                        <div className="flex-1 h-[2px] bg-zinc-200 dark:bg-zinc-800 rounded-full mr-4 overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${messagePairs >= 9 ? "bg-red-500" : "bg-blue-600"}`}
                                style={{width: `${limitPercentage}%`}}/>
                        </div>
                        <span
                            className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400">{messagePairs} / 10</span>
                    </div>

                    <div className="relative">
                        <Input
                            className="h-12 sm:h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 focus-visible:ring-1 focus-visible:ring-blue-500/30 text-zinc-900 dark:text-zinc-200 pr-12 placeholder:text-zinc-400"
                            placeholder={isLimitReached ? "Limit reached" : "Type your message..."}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            disabled={isLoading || isLimitReached}
                        />
                        <Button
                            variant="ghost"
                            className="absolute right-2 top-2 h-8 w-8 sm:h-10 sm:w-10 rounded-xl text-zinc-400 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-500 transition-colors"
                            onClick={handleSend}
                            disabled={isLoading || !input.trim() || isLimitReached}
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4"/>}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}