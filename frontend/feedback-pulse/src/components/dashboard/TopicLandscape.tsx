import {
    ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {LayoutGrid} from "lucide-react";

const ClusterTooltip = ({active, payload}: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div
                className="z-50 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 p-3 shadow-xl backdrop-blur-md max-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-2.5 w-2.5 rounded-full shrink-0 shadow-sm border border-white/20"
                         style={{backgroundColor: data.fill}}/>
                    <span
                        className="font-bold text-xs text-zinc-900 dark:text-zinc-100 leading-tight line-clamp-2">{data.fullName}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="flex flex-col bg-zinc-50 dark:bg-zinc-900 p-1.5 rounded">
                        <span className="text-zinc-500 dark:text-zinc-400">Urgency</span>
                        <span
                            className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{data.originalUrgency}/5</span>
                    </div>
                    <div className="flex flex-col bg-zinc-50 dark:bg-zinc-900 p-1.5 rounded">
                        <span className="text-zinc-500 dark:text-zinc-400">Sentiment</span>
                        <span
                            className="font-medium capitalize text-zinc-900 dark:text-zinc-100">{data.sentiment}</span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

export function TopicLandscape({data}: { data: any[] }) {
    return (
        <Card
            className="border-zinc-200/60 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900/50 backdrop-blur-sm flex flex-col h-[340px]">
            <CardHeader className="pt-3 pb-1 px-6 border-b border-zinc-100 dark:border-zinc-800/50">
                <CardTitle
                    className="text-lg font-bold flex items-center gap-2 leading-none text-zinc-900 dark:text-zinc-100">
                    <LayoutGrid size={18} className="text-zinc-500 dark:text-zinc-400"/> Topic Landscape
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 relative">
                {/* Quadrant Labels - Improved contrast for dark mode */}
                <div
                    className="absolute top-2 right-6 text-[9px] font-bold text-emerald-600 dark:text-emerald-500 opacity-60 text-right leading-tight pointer-events-none">FEATURE<br/>REQUESTS
                </div>
                <div
                    className="absolute bottom-2 right-6 text-[9px] font-bold text-rose-600 dark:text-rose-500 opacity-60 text-right leading-tight pointer-events-none">CRITICAL<br/>ISSUES
                </div>
                <div
                    className="absolute top-2 left-6 text-[9px] font-bold text-zinc-400 dark:text-zinc-500 opacity-60 leading-tight pointer-events-none">MINOR<br/>PRAISE
                </div>
                <div
                    className="absolute bottom-2 left-6 text-[9px] font-bold text-zinc-400 dark:text-zinc-500 opacity-60 leading-tight pointer-events-none">MINOR<br/>BUGS
                </div>

                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{top: 15, right: 30, bottom: 15, left: 30}}>
                        {/* Grid and Lines - Using theme-aware colors */}
                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor"
                                       className="text-zinc-200 dark:text-zinc-800"/>
                        <XAxis type="number" dataKey="x" domain={[0.5, 5.5]} hide/>
                        <YAxis type="number" dataKey="y" domain={[-12, 12]} hide/>
                        <ZAxis type="number" dataKey="z" range={[50, 400]}/>
                        <Tooltip cursor={{
                            strokeDasharray: '3 3',
                            stroke: 'currentColor',
                            className: 'text-zinc-300 dark:text-zinc-700'
                        }} content={<ClusterTooltip/>}/>
                        <ReferenceLine y={0} stroke="currentColor" strokeWidth={1}
                                       className="text-zinc-300 dark:text-zinc-700"/>
                        <ReferenceLine x={3} stroke="currentColor" strokeWidth={1}
                                       className="text-zinc-300 dark:text-zinc-700"/>
                        <Scatter name="Issues" data={data}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} stroke="white" strokeWidth={1.5}
                                      className="dark:stroke-zinc-900 opacity-90 hover:opacity-100 transition-opacity cursor-pointer"/>
                            ))}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}