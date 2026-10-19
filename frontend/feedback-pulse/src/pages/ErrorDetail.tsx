import {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {
    Zap, ArrowLeft,
    Clock, User, Terminal, Copy, Check, Loader2
} from "lucide-react";
import {api, type FeedbackItem} from "@/lib/api";
import {SourceIcon} from "@/components/SourceIcon";

export default function ErrorDetail() {
    const {id} = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState<FeedbackItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLinkCopied, setIsLinkCopied] = useState(false);

    // 1. Fetch Data
    useEffect(() => {
        if (id) {
            setIsLoading(true);
            api.getDetail(id)
                .then((data) => setItem(data))
                .catch(() => setItem(null))
                .finally(() => setIsLoading(false));
        }
    }, [id]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setIsLinkCopied(true);
        setTimeout(() => setIsLinkCopied(false), 2000);
    };

    if (isLoading) return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400"/>
        </div>
    );

    if (!item) return (
        <div className="p-8 text-center text-zinc-500">
            <h2 className="text-xl font-bold mb-2">Issue Not Found</h2>
            <Button onClick={() => navigate('/')}>Return to Dashboard</Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8F9FA] dark:bg-black p-4 md:p-8 animate-in fade-in duration-300">
            <div className="mx-auto max-w-4xl space-y-6">

                {/* Header Navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate("/")}
                            className="h-9 w-9 rounded-full shadow-sm bg-white dark:bg-zinc-900">
                        <ArrowLeft size={16}/>
                    </Button>
                    <div>
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                            Issue <span className="font-mono text-base opacity-50">#{item.id.slice(0, 8)}</span>
                        </h2>
                        <p className="text-xs text-zinc-500">AI Investigation Report</p>
                    </div>

                    <div className="sm:ml-auto">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyLink}
                            className={`gap-2 text-xs bg-white dark:bg-zinc-900 transition-all duration-300 ${isLinkCopied ? "border-emerald-500 text-emerald-600 dark:text-emerald-400" : ""}`}
                        >
                            {isLinkCopied ? <Check size={12}/> : <Copy size={12}/>}
                            {isLinkCopied ? "Copied Link" : "Copy Link"}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Analysis Card */}
                    <Card className="lg:col-span-2 border-0 shadow-sm bg-white dark:bg-zinc-900/50">
                        <CardHeader className="pb-3 pt-5 px-5">
                            <div className="flex justify-between items-start">
                                <Badge variant="outline"
                                       className={`mb-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border-0 ${item.urgency_score >= 5 ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                                    Urgency Level {item.urgency_score}
                                </Badge>
                                <span className="text-xs font-mono text-zinc-400">
                                    {new Date(item.created_at).toLocaleString()}
                                </span>
                            </div>
                            <CardTitle className="text-lg leading-tight">{item.summary}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 px-5 pb-6">
                            <div
                                className="rounded-lg bg-zinc-50 p-4 text-sm text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300 italic border border-zinc-100 dark:border-zinc-800 leading-relaxed">
                                "{item.content}"
                            </div>

                            {item.root_cause && (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                        <Zap size={14} className="text-amber-500" fill="currentColor"/> AI Root Cause
                                        Analysis
                                    </h4>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                        {item.root_cause}
                                    </p>
                                </div>
                            )}

                            {/* Simple Text Field for Suggested Fix */}
                            {item.suggested_fix && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                            <Terminal size={14} className="text-emerald-500"/> Suggested Fix
                                        </h4>
                                    </div>

                                    <div
                                        className="rounded-md border bg-zinc-50 p-4 text-xs font-mono text-zinc-700 shadow-inner dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800 overflow-x-auto whitespace-pre-wrap">
                                        {item.suggested_fix}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Metadata Sidebar */}
                    <div className="space-y-4">
                        <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900/50">
                            <CardHeader className="pb-3 pt-4 px-4">
                                <CardTitle className="text-sm">Metadata</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 px-4 pb-4 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-zinc-500 flex items-center gap-2 text-xs"><User size={12}/> Author</span>
                                    <span className="font-medium text-xs">{item.author || 'Anonymous'}</span>
                                </div>
                                <Separator/>
                                <div className="flex items-center justify-between">
                                    <span className="text-zinc-500 flex items-center gap-2 text-xs"><Clock size={12}/> Sentiment</span>
                                    <Badge variant="secondary"
                                           className={`capitalize ${item.sentiment_score === 'negative' ? 'text-red-500' : 'text-green-500'}`}>
                                        {item.sentiment_score}
                                    </Badge>
                                </div>
                                <Separator/>
                                <div className="flex items-center justify-between">
                                    <span className="text-zinc-500 flex items-center gap-2 text-xs">
                                        <SourceIcon source={item.source} size={12}/> Source
                                    </span>
                                    <span className="font-medium text-xs capitalize">{item.source}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}