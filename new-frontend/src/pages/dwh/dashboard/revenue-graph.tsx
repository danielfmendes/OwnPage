import {useTheme} from "next-themes";
import {Bar, BarChart, Line, LineChart} from "recharts";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {type ChartConfig, ChartContainer} from "@/components/ui/chart";
import type {GraphData} from "@/models/api";
import {Skeleton} from "@/components/ui/skeleton";
import {useTranslation} from "react-i18next";

interface Props {
    graphData: GraphData[];
    graphMeta: {
        currentRevenue: number;
        revenueChangePct: number;
        currentSales: number;
        salesChangePct: number;
    };
    timeRange: string;
    isLoadingGraphMetaData: boolean;
    isLoadingGraphDataData: boolean;
}

export function MetricStats({
                                graphData,
                                graphMeta,
                                timeRange,
                                isLoadingGraphMetaData,
                                isLoadingGraphDataData,
                            }: Props) {
    const {t} = useTranslation();
    const {theme} = useTheme();
    const chartColor = theme === "dark" ? "white" : "black";

    const chartConfig = {
        revenue: {
            label: t("label.revenue"),
            color: "hsl(var(--primary))",
        },
        sales_no: {
            label: t("label.number_of_sales"),
            color: "hsl(var(--primary))",
        },
    } satisfies ChartConfig;

    const formatCurrency = (value: number) =>
        value.toLocaleString("en-US", {style: "currency", currency: "USD"});

    const formatPercentage = (value: number) =>
        `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;

    const timeLabels: Record<Props["timeRange"], string | null> = {
        "1d": t("time.yesterday"),
        "1w": t("time.last_week"),
        "1m": t("time.last_month"),
        "1y": t("time.last_year"),
        "max": null,
    };

    const timeLabel = timeLabels[timeRange];

    const isNoRevenueData = graphData.every((data) => data.revenue === 0);
    const isNoSalesData = graphData.every((data) => data.sales_no === 0);

    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
            {/* Revenue Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-normal">
                        {t("label.total_revenue")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="-mt-5 pb-0">
                    {isLoadingGraphMetaData ? (
                        <>
                            <Skeleton className="h-6 w-32 mb-1"/>
                            {timeLabel && <Skeleton className="h-4 w-40"/>}
                        </>
                    ) : (
                        <>
                            <div className="text-2xl font-bold">
                                {formatCurrency(graphMeta.currentRevenue)}
                            </div>
                            {timeLabel && (
                                <p className="text-xs text-muted-foreground">
                                    {t("from_time_period", {
                                        change: formatPercentage(graphMeta.revenueChangePct),
                                        time: timeLabel,
                                    })}
                                </p>
                            )}
                        </>
                    )}
                    {isLoadingGraphDataData ? (
                        <Skeleton className="h-[80px] w-full mt-4"/>
                    ) : isNoRevenueData ? (
                        <p className="text-sm text-muted-foreground mt-4">
                            {t("no_data_to_display")}
                        </p>
                    ) : (
                        <ChartContainer config={chartConfig} className="h-[80px] w-full mt-2 mb-5 md:mb-2.5">
                            <LineChart data={graphData}>
                                <Line
                                    type="monotone"
                                    strokeWidth={2}
                                    dataKey="revenue"
                                    stroke={chartColor}
                                    activeDot={{r: 6}}
                                />
                            </LineChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>

            {/* Sales Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-normal">
                        {t("label.number_of_sales")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="-mt-5 pb-0">
                    {isLoadingGraphMetaData ? (
                        <>
                            <Skeleton className="h-6 w-24 mb-1"/>
                            {timeLabel && <Skeleton className="h-4 w-40"/>}
                        </>
                    ) : (
                        <>
                            <div className="text-2xl font-bold">
                                +{graphMeta.currentSales}
                            </div>
                            {timeLabel && (
                                <p className="text-xs text-muted-foreground">
                                    {t("from_time_period", {
                                        change: formatPercentage(graphMeta.salesChangePct),
                                        time: timeLabel,
                                    })}
                                </p>
                            )}
                        </>
                    )}
                    {isLoadingGraphDataData ? (
                        <Skeleton className="h-[80px] w-full mt-4"/>
                    ) : isNoSalesData ? (
                        <p className="text-sm text-muted-foreground mt-4">
                            {t("no_data_to_display")}
                        </p>
                    ) : (
                        <ChartContainer config={chartConfig} className="mt-2 h-[80px] w-full">
                            <BarChart data={graphData}>
                                <Bar
                                    dataKey="sales_no"
                                    fill={chartColor}
                                    radius={4}
                                />
                            </BarChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
