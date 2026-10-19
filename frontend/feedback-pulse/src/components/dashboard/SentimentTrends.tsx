import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Activity} from "lucide-react";

export function SentimentTrends({data}: { data: any[] }) {
    return (
        <Card
            className="border-zinc-200/60 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900/50 backdrop-blur-sm flex flex-col h-[400px] min-w-0">
            <CardHeader className="pt-3 pb-1 px-6 border-b border-zinc-100 dark:border-zinc-800/50">
                <CardTitle
                    className="text-lg font-bold flex items-center gap-2 leading-none text-zinc-900 dark:text-zinc-100">
                    <Activity size={18} className="text-zinc-500 dark:text-zinc-400"/> Sentiment Trends
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 w-full p-4 pl-0">
                <div className="h-full w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{top: 10, right: 10, left: 0, bottom: 0}}>
                            <defs>
                                <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorNeg" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            {/* Grid and Axes - theme-aware colors */}
                            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="currentColor"
                                           className="text-zinc-200 dark:text-zinc-800"/>
                            <XAxis dataKey="day" axisLine={false} tickLine={false}
                                   tick={{fontSize: 10, fill: 'currentColor'}}
                                   className="text-zinc-500 dark:text-zinc-400" dy={10}/>
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: 'currentColor'}}
                                   className="text-zinc-500 dark:text-zinc-400"/>
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '8px',
                                    border: 'none',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}
                                itemStyle={{fontSize: '12px', fontWeight: 600}}
                                wrapperClassName="dark:bg-zinc-950/95 dark:border dark:border-zinc-800 dark:text-zinc-100"
                            />
                            <Area type="monotone" dataKey="negative" stroke="#f43f5e" strokeWidth={2}
                                  fill="url(#colorNeg)"/>
                            <Area type="monotone" dataKey="positive" stroke="#10b981" strokeWidth={2}
                                  fill="url(#colorPos)"/>
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}