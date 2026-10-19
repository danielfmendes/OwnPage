import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Zap, ArrowUpDown, ArrowUp, ArrowDown} from "lucide-react";
import {Link} from "react-router-dom";
import {SourceIcon} from "@/components/SourceIcon";
import type {FeedbackItem} from "@/lib/api";

const SortIcon = ({active, direction}: { active: boolean, direction: 'asc' | 'desc' }) => {
    if (!active) return <ArrowUpDown size={12} className="ml-1 text-zinc-300 dark:text-zinc-600 opacity-50"/>;
    return direction === 'asc'
        ? <ArrowUp size={12} className="ml-1 text-zinc-900 dark:text-zinc-100"/>
        : <ArrowDown size={12} className="ml-1 text-zinc-900 dark:text-zinc-100"/>;
}

interface TriageQueueProps {
    items: FeedbackItem[];
    sortConfig: { key: string, direction: 'asc' | 'desc' };
    onSort: (key: string) => void;
    filterUrgency: number | null;
    setFilterUrgency: (val: number | null) => void;
}

export function TriageQueue({items, sortConfig, onSort, filterUrgency, setFilterUrgency}: TriageQueueProps) {
    const timeAgo = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.RelativeTimeFormat('en', {numeric: 'auto'}).format(
            Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)), 'day'
        ).replace('0 days ago', 'Today');
    };

    return (
        <Card
            className="gap-0 border-zinc-200/60 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900/50 backdrop-blur-sm flex flex-col overflow-hidden h-[400px]">
            {/* Removed nested bg classes here to fix the dark mode layering bug */}
            <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 pt-3 pb-2 px-6 shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Zap size={18} className="text-amber-500" fill="currentColor"/>
                        <div>
                            <CardTitle className="text-lg font-bold leading-none text-zinc-900 dark:text-zinc-100">Triage
                                Queue</CardTitle>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-md">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setFilterUrgency(null)}
                                className={`h-5 text-[10px] px-2 ${filterUrgency === null ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'}`}
                            >
                                All
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setFilterUrgency(5)}
                                className={`h-5 text-[10px] px-2 ${filterUrgency === 5 ? 'bg-white dark:bg-zinc-700 shadow-sm text-rose-600 dark:text-rose-300' : 'text-zinc-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-300'}`}
                            >
                                Critical
                            </Button>
                        </div>
                    </div>
                </div>
            </CardHeader>

            {/* Removed nested bg classes here as well */}
            <CardContent className="p-0 flex-1 relative overflow-hidden">
                <ScrollArea className="h-full">
                    <table className="w-full text-left text-xs">
                        {/* sticky header bg matches the card bg (zinc-900/90) for transparency consistency */}
                        <thead
                            className="sticky top-0 bg-zinc-50/90 dark:bg-zinc-900/90 z-10 shadow-sm backdrop-blur-sm">
                        <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
                            <th
                                className="px-6 py-2 font-medium w-[90px] cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
                                onClick={() => onSort('urgency_score')}
                            >
                                <div className="flex items-center">Urgency <SortIcon
                                    active={sortConfig.key === 'urgency_score'} direction={sortConfig.direction}/></div>
                            </th>
                            <th
                                className="px-6 py-2 font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
                                onClick={() => onSort('summary')}
                            >
                                <div className="flex items-center">Issue Summary <SortIcon
                                    active={sortConfig.key === 'summary'} direction={sortConfig.direction}/></div>
                            </th>
                            <th
                                className="px-6 py-2 font-medium w-[100px] cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
                                onClick={() => onSort('source')}
                            >
                                <div className="flex items-center">Source <SortIcon active={sortConfig.key === 'source'}
                                                                                    direction={sortConfig.direction}/>
                                </div>
                            </th>
                            <th
                                className="px-6 py-2 font-medium text-right w-[80px] cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
                                onClick={() => onSort('created_at')}
                            >
                                <div className="flex items-center justify-end">Date <SortIcon
                                    active={sortConfig.key === 'created_at'} direction={sortConfig.direction}/></div>
                            </th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-zinc-400 dark:text-zinc-500">No issues
                                    found.
                                </td>
                            </tr>
                        ) : items.map((item) => (
                            <tr key={item.id}
                                className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                <td className="px-6 py-2 align-top">
                                    <Badge
                                        variant="secondary"
                                        className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 h-4 rounded-sm border w-fit ${
                                            item.urgency_score >= 5
                                                ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-300 border-rose-100 dark:border-rose-900/50' :
                                                item.urgency_score >= 4
                                                    ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-300 border-orange-100 dark:border-orange-900/50' :
                                                    'bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                                        }`}
                                    >
                                        {item.urgency_score}
                                    </Badge>
                                </td>
                                <td className="px-6 py-2">
                                    <div className="flex items-start gap-2">
                                        <div
                                            className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${item.sentiment_score === 'negative' ? 'bg-rose-500' :
                                                item.sentiment_score === 'positive' ? 'bg-emerald-500' :
                                                    'bg-zinc-300 dark:bg-zinc-600'
                                            }`}/>
                                        <Link
                                            to={`/issues/${item.id}`}
                                            className="font-medium text-zinc-700 dark:text-zinc-300 line-clamp-2 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition-colors cursor-pointer"
                                        >
                                            {item.summary}
                                        </Link>
                                    </div>
                                </td>
                                <td className="px-6 py-2 align-top text-zinc-500 dark:text-zinc-400">
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <SourceIcon source={item.source} size={12}/>
                                        <span className="capitalize">{item.source}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-2 align-top text-right text-zinc-400 dark:text-zinc-500 font-mono text-[10px]">
                                    <span className="mt-0.5 block">{timeAgo(item.created_at)}</span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}