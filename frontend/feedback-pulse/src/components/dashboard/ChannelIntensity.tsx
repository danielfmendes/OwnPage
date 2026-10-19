import {useMemo} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {BarChart3, MessageCircle, Mail} from "lucide-react";
import {Twitter, Github} from "lucide-legacy";
import type {FeedbackItem} from "@/lib/api";

interface ChannelIntensityProps {
    items: FeedbackItem[];
}

export function ChannelIntensity({items}: ChannelIntensityProps) {
    const processedData = useMemo(() => {
        const topics = ['Auth', 'Billing', 'API', 'UI/UX'];
        const channels = ['Twitter', 'Discord', 'Github', 'Email'];
        const matrix: any = {};
        topics.forEach(t => {
            matrix[t] = {};
            channels.forEach(c => {
                matrix[t][c] = {count: 0, sumUrgency: 0, criticals: 0, highs: 0, lows: 0};
            });
        });

        let maxVolume = 0;

        items.forEach(item => {
            let topic = 'UI/UX';
            const txt = item.content.toLowerCase();
            if (txt.includes('login') || txt.includes('auth') || txt.includes('sign')) topic = 'Auth';
            else if (txt.includes('pay') || txt.includes('bill') || txt.includes('invoice')) topic = 'Billing';
            else if (txt.includes('api') || txt.includes('key') || txt.includes('webhook')) topic = 'API';

            let channel = 'Email';
            const s = (item.source || '').toLowerCase();
            if (s.includes('twitter')) channel = 'Twitter';
            else if (s.includes('discord')) channel = 'Discord';
            else if (s.includes('github') || s.includes('issue')) channel = 'Github';

            if (matrix[topic] && matrix[topic][channel]) {
                const cell = matrix[topic][channel];
                cell.count++;
                cell.sumUrgency += item.urgency_score;
                if (item.urgency_score === 5) cell.criticals++;
                else if (item.urgency_score >= 3) cell.highs++;
                else cell.lows++;

                if (cell.count > maxVolume) maxVolume = cell.count;
            }
        });

        return {matrix, topics, channels, maxVolume};
    }, [items]);

    // Helper to determine color based on Avg Urgency
    const getCellColor = (avgUrgency: number) => {
        if (avgUrgency >= 4.5) return 'bg-rose-500 dark:bg-rose-600 shadow-[0_0_10px_-2px_rgba(244,63,94,0.6)] dark:shadow-[0_0_10px_-2px_rgba(225,29,72,0.4)]';
        if (avgUrgency >= 3.5) return 'bg-orange-500 dark:bg-orange-600 shadow-[0_0_10px_-2px_rgba(249,115,22,0.6)] dark:shadow-[0_0_10px_-2px_rgba(234,88,12,0.4)]';
        if (avgUrgency >= 2.5) return 'bg-amber-400 dark:bg-amber-500 shadow-[0_0_10px_-2px_rgba(251,191,36,0.6)] dark:shadow-[0_0_10px_-2px_rgba(245,158,11,0.4)]';
        return 'bg-emerald-500 dark:bg-emerald-600 shadow-[0_0_10px_-2px_rgba(16,185,129,0.6)] dark:shadow-[0_0_10px_-2px_rgba(5,150,105,0.4)]';
    };

    // Helper for tooltip dot color
    const getDotColor = (avgUrgency: number) => {
        if (avgUrgency >= 4.5) return 'bg-rose-500';
        if (avgUrgency >= 3.5) return 'bg-orange-500';
        if (avgUrgency >= 2.5) return 'bg-amber-400';
        return 'bg-emerald-500';
    };

    return (
        <Card
            className="gap-0 border-zinc-200/60 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900/50 backdrop-blur-sm flex flex-col h-[340px]">
            <CardHeader className="pt-3 pb-1 px-6 shrink-0 border-b border-zinc-100 dark:border-zinc-800/50">
                <CardTitle
                    className="text-lg font-bold flex items-center gap-2 leading-none text-zinc-900 dark:text-zinc-100">
                    <BarChart3 size={18} className="text-zinc-500 dark:text-zinc-400"/> Channel Intensity
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 px-6 py-2 flex flex-col justify-center">
                <div className="w-full h-full flex flex-col justify-center">
                    {/* Header Icons */}
                    <div
                        className="grid grid-cols-[1fr_repeat(4,minmax(0,1fr))] mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                        <div
                            className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider self-end leading-none">Topic
                        </div>
                        <div className="flex justify-center"><Twitter size={14}
                                                                      className="text-zinc-400 dark:text-zinc-500"/>
                        </div>
                        <div className="flex justify-center"><MessageCircle size={14}
                                                                            className="text-zinc-400 dark:text-zinc-500"/>
                        </div>
                        <div className="flex justify-center"><Github size={14}
                                                                     className="text-zinc-400 dark:text-zinc-500"/>
                        </div>
                        <div className="flex justify-center"><Mail size={14}
                                                                   className="text-zinc-400 dark:text-zinc-500"/></div>
                    </div>

                    {/* Rows */}
                    <div className="flex flex-col gap-3">
                        {processedData.topics.map((topic, i) => (
                            <div key={i}
                                 className="grid grid-cols-[1fr_repeat(4,minmax(0,1fr))] items-center gap-3 h-10">
                                {/* Row Label */}
                                <div
                                    className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300 truncate pr-2 leading-none">
                                    {topic}
                                </div>

                                {/* Cells */}
                                {processedData.channels.map((channel, j) => {
                                    const cell = processedData.matrix[topic][channel];
                                    const count = cell.count;
                                    const avgUrgency = count > 0 ? cell.sumUrgency / count : 0;
                                    const opacity = count === 0 ? 0.05 : 0.3 + ((count / (processedData.maxVolume || 1)) * 0.7);
                                    const colorClass = getCellColor(avgUrgency);
                                    const dotColor = getDotColor(avgUrgency);

                                    return (
                                        <div key={j} className="h-full w-full relative group">
                                            {/* The Heatmap Tile */}
                                            <div
                                                className={`h-full w-full rounded-md flex items-center justify-center transition-all duration-300 
                                                ${count > 0 ? colorClass : 'bg-zinc-100 dark:bg-zinc-800/50'}`}
                                                style={{opacity: opacity}}
                                            />

                                            {/* Number Overlay */}
                                            {count > 0 ? (
                                                <div
                                                    className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-sm pointer-events-none">
                                                    {count}
                                                </div>
                                            ) : (
                                                <div
                                                    className="absolute inset-0 flex items-center justify-center text-[10px] text-zinc-300 dark:text-zinc-600 font-medium">
                                                    -
                                                </div>
                                            )}

                                            {/* Tooltip - Consistent Style */}
                                            {count > 0 && (
                                                <div
                                                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[180px] z-50 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 p-3 shadow-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div
                                                            className={`h-2.5 w-2.5 rounded-full shrink-0 shadow-sm ${dotColor}`}/>
                                                        <span
                                                            className="font-bold text-xs text-zinc-900 dark:text-zinc-100 leading-tight">
                                                            {topic} <span
                                                            className="text-zinc-400 dark:text-zinc-500 font-normal">via</span> {channel}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                                                        <div
                                                            className="flex flex-col bg-zinc-50 dark:bg-zinc-900 p-1.5 rounded">
                                                            <span className="text-zinc-500 dark:text-zinc-400">Avg Urgency</span>
                                                            <span
                                                                className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{avgUrgency.toFixed(1)}/5</span>
                                                        </div>
                                                        <div
                                                            className="flex flex-col bg-zinc-50 dark:bg-zinc-900 p-1.5 rounded">
                                                            <span className="text-zinc-500 dark:text-zinc-400">Total Issues</span>
                                                            <span
                                                                className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{count}</span>
                                                        </div>
                                                        <div
                                                            className="col-span-2 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900 p-1.5 rounded px-2">
                                                            <div className="flex items-center gap-1.5" title="Critical">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500"/>
                                                                <span
                                                                    className="font-medium text-zinc-700 dark:text-zinc-300">{cell.criticals}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5" title="High">
                                                                <div
                                                                    className="w-1.5 h-1.5 rounded-full bg-orange-500"/>
                                                                <span
                                                                    className="font-medium text-zinc-700 dark:text-zinc-300">{cell.highs}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5" title="Low">
                                                                <div
                                                                    className="w-1.5 h-1.5 rounded-full bg-emerald-500"/>
                                                                <span
                                                                    className="font-medium text-zinc-700 dark:text-zinc-300">{cell.lows}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}