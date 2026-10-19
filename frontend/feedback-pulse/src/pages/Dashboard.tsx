import {useEffect, useState, useMemo} from 'react';
import {Card, CardContent} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import {Activity, AlertTriangle, Zap, type LucideIcon} from "lucide-react";
import {api, type FeedbackItem, type DashboardStats} from "@/lib/api";

// Component Imports
import {TopicLandscape} from "@/components/dashboard/TopicLandscape";
import {ChannelIntensity} from "@/components/dashboard/ChannelIntensity";
import {SentimentTrends} from "@/components/dashboard/SentimentTrends";
import {TriageQueue} from "@/components/dashboard/TriageQueue";

// --- STAT CARD COMPONENT ---
const StatCard = ({title, value, trendUp, icon: Icon}: {
    title: string,
    value: string | number,
    trendUp: boolean,
    icon: LucideIcon
}) => (
    <Card
        className="border-zinc-200/60 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm shadow-sm">
        <CardContent className="px-6 py-3 flex items-center justify-between">
            <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 leading-none">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 leading-tight">{value}</h3>
                </div>
            </div>
            <div
                className={`h-8 w-8 rounded-full flex items-center justify-center ${trendUp ? 'bg-emerald-100/50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-100/50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'}`}>
                <Icon size={16}/>
            </div>
        </CardContent>
    </Card>
);

// --- SKELETON COMPONENT ---
function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-zinc-50/50 dark:bg-black p-4 transition-colors">
            <div className="mx-auto max-w-7xl space-y-4">
                <div className="flex justify-between items-center py-2">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48 rounded-lg dark:bg-zinc-800"/>
                        <Skeleton className="h-3 w-32 rounded-lg dark:bg-zinc-800"/>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {[1, 2, 3].map(i => (
                        <div key={i}
                             className="h-24 w-full rounded-xl bg-white dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800 p-6 flex justify-between items-center">
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-20 dark:bg-zinc-800"/>
                                <Skeleton className="h-8 w-12 dark:bg-zinc-800"/>
                            </div>
                            <Skeleton className="h-8 w-8 rounded-full dark:bg-zinc-800"/>
                        </div>
                    ))}
                </div>
                {/* ... (rest of the skeleton with similar dark mode updates) ... */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div
                        className="h-[340px] w-full rounded-xl bg-white dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800 p-6 space-y-4">
                        <Skeleton className="h-6 w-32 dark:bg-zinc-800"/>
                        <Skeleton className="h-full w-full rounded-lg dark:bg-zinc-800"/>
                    </div>
                    <div
                        className="h-[340px] w-full rounded-xl bg-white dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800 p-6 space-y-4">
                        <Skeleton className="h-6 w-32 dark:bg-zinc-800"/>
                        <div className="space-y-4 pt-4">
                            {[1, 2, 3, 4].map(j => (
                                <div key={j} className="flex items-center justify-between gap-4">
                                    <Skeleton className="h-4 w-16 dark:bg-zinc-800"/>
                                    <div className="flex gap-2 flex-1">
                                        {[1, 2, 3, 4].map(k => <Skeleton key={k}
                                                                         className="h-8 w-full rounded-md dark:bg-zinc-800"/>)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div
                        className="h-[400px] w-full rounded-xl bg-white dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800 p-6 space-y-4">
                        <Skeleton className="h-6 w-32 dark:bg-zinc-800"/>
                        <Skeleton className="h-[300px] w-full rounded-lg dark:bg-zinc-800"/>
                    </div>
                    <div
                        className="h-[400px] w-full rounded-xl bg-white dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800 flex flex-col">
                        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
                            <Skeleton className="h-6 w-32 dark:bg-zinc-800"/>
                        </div>
                        <div className="p-0 flex-1">
                            {[1, 2, 3, 4, 5].map(k => (
                                <div key={k}
                                     className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
                                    <Skeleton className="h-4 w-8 dark:bg-zinc-800"/>
                                    <Skeleton className="h-4 w-48 dark:bg-zinc-800"/>
                                    <Skeleton className="h-4 w-16 dark:bg-zinc-800"/>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- MAIN PAGE ---
export default function Dashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats>({total: 0, critical: 0, top_sentiment: '-'});
    const [items, setItems] = useState<FeedbackItem[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [clusterData, setClusterData] = useState<any[]>([]);

    const [filterUrgency, setFilterUrgency] = useState<number | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({
        key: 'created_at',
        direction: 'desc'
    });

    async function loadData() {
        setIsLoading(true);
        try {
            const [statsRes, listRes, chartsRes] = await Promise.all([
                api.getStats(),
                api.getList(),
                api.getCharts()
            ]);

            setStats(statsRes);
            setItems(listRes);

            // Sentiment Chart Data
            const sentimentMap = {positive: 0, negative: 0, neutral: 0};
            chartsRes.forEach(c => {
                const key = c.sentiment_score as keyof typeof sentimentMap;
                if (sentimentMap[key] !== undefined) sentimentMap[key] = c.count;
            });
            setChartData([
                {
                    day: 'Mon',
                    positive: Math.round(sentimentMap.positive * 0.6),
                    negative: Math.round(sentimentMap.negative * 0.5)
                },
                {
                    day: 'Tue',
                    positive: Math.round(sentimentMap.positive * 0.8),
                    negative: Math.round(sentimentMap.negative * 0.7)
                },
                {
                    day: 'Wed',
                    positive: Math.round(sentimentMap.positive * 0.5),
                    negative: Math.round(sentimentMap.negative * 0.9)
                },
                {
                    day: 'Thu',
                    positive: Math.round(sentimentMap.positive * 0.9),
                    negative: Math.round(sentimentMap.negative * 0.6)
                },
                {day: 'Fri', positive: sentimentMap.positive, negative: sentimentMap.negative},
            ]);

            // Topic Landscape Data
            const clusters = listRes.map((item) => {
                const jitterX = (Math.random() - 0.5) * 0.4;
                const jitterY = (Math.random() - 0.5) * 2;
                let basePathY = 0;
                if (item.sentiment_score === 'positive') basePathY = 7;
                else if (item.sentiment_score === 'negative') basePathY = -7;

                return {
                    x: item.urgency_score + jitterX,
                    y: basePathY + jitterY,
                    z: 50 + (item.urgency_score * 100),
                    originalUrgency: item.urgency_score,
                    sentiment: item.sentiment_score,
                    fullName: item.summary,
                    name: item.summary.slice(0, 15) + "...",
                    fill: item.sentiment_score === 'negative' ? '#f43f5e' : item.sentiment_score === 'neutral' ? '#f59e0b' : '#10b981'
                };
            });
            setClusterData(clusters);

        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadData();
        window.addEventListener("feedback-updated", loadData);
        return () => window.removeEventListener("feedback-updated", loadData);
    }, []);

    const handleSort = (key: string) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const filteredItems = useMemo(() => {
        let res = [...items];
        if (filterUrgency) {
            if (filterUrgency === 5) res = res.filter(i => i.urgency_score === 5);
            else if (filterUrgency === 4) res = res.filter(i => i.urgency_score >= 4);
        }
        res.sort((a: any, b: any) => {
            let aVal = a[sortConfig.key];
            let bVal = b[sortConfig.key];
            if (typeof aVal === 'string') aVal = aVal.toLowerCase();
            if (typeof bVal === 'string') bVal = bVal.toLowerCase();
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return res;
    }, [items, filterUrgency, sortConfig]);

    if (isLoading) return <DashboardSkeleton/>;

    return (
        <div
            className="min-h-screen bg-zinc-50/50 dark:bg-black p-4 font-sans text-zinc-900 dark:text-zinc-100 transition-colors">
            <div className="mx-auto max-w-7xl space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Feedback
                            Pulse</h1>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Real-time AI analysis.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <StatCard title="Total Feedback" value={stats.total} trendUp={true} icon={Activity}/>
                    <StatCard title="Critical Issues" value={stats.critical} trendUp={false} icon={AlertTriangle}/>
                    <StatCard title="Avg Sentiment" value={stats.top_sentiment}
                              trendUp={stats.top_sentiment !== 'negative'} icon={Zap}/>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TopicLandscape data={clusterData}/>
                    <ChannelIntensity items={items}/>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <SentimentTrends data={chartData}/>
                    <TriageQueue
                        items={filteredItems}
                        sortConfig={sortConfig}
                        onSort={handleSort}
                        filterUrgency={filterUrgency}
                        setFilterUrgency={setFilterUrgency}
                    />
                </div>
            </div>
        </div>
    );
}