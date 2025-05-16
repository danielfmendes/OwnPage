import {useMemo, useState, useEffect} from "react";
import {Line, LineChart, Tooltip, XAxis} from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandGroup,
    CommandItem,
} from "@/components/ui/command";
import {Button} from "@/components/ui/button";
import {Check, ChevronDown} from "lucide-react";
import {cn} from "@/lib/utils";
import {ChartContainer, ChartConfig} from "@/components/ui/chart";
import {BikeSales} from "@/types/custom";
import {Skeleton} from "@/components/ui/skeleton";
import {Switch} from "@/components/ui/switch";

interface Props {
    bikeData: BikeSales[] | null;
    isLoading: boolean;
}

export function BikeModels({bikeData, isLoading}: Props) {
    // Finde alle Modelle, die Verkäufe haben
    const modelsWithSales = Array.from(new Set(
        (bikeData || []).filter((b) => b.total_sales > 0).map((b) => b.bike_model)
    ));
    const [selectedModels, setSelectedModels] = useState<string[]>(modelsWithSales);

    // State for metric-typ: "total_sales" or "revenue"
    const [metric, setMetric] = useState<"total_sales" | "revenue">("total_sales");

    const modelColors = [
        "#3b82f6", "#10b981", "#f59e0b", "#6366f1",
        "#ec4899", "#14b8a6", "#8b5cf6", "#f97316"
    ];

    useEffect(() => {
        setSelectedModels(modelsWithSales);
    }, [bikeData]);

    // Prepare chart data, depending on the selected metric (total_sales / revenue)
    const chartData = useMemo(() => {
        if (!bikeData) return [];

        const grouped: Record<string, Record<string, number>> = {};

        bikeData.forEach((entry) => {
            const date = entry.order_date.split("T")[0];
            if (!grouped[date]) grouped[date] = {};
            grouped[date][entry.bike_model] =
                metric === "total_sales" ? entry.total_sales : entry.revenue;
        });

        const sortedDates = Object.keys(grouped).sort();

        return sortedDates.map((date) => {
            const base: Record<string, any> = {
                date,
                formattedDate: new Intl.DateTimeFormat("de-DE", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                }).format(new Date(date)),
            };

            modelsWithSales.forEach((model) => {
                base[model] = grouped[date][model] ?? 0;
            });

            return base;
        });
    }, [bikeData, modelsWithSales, metric]);

    const chartConfig = {} satisfies ChartConfig;

    const toggleModel = (model: string) => {
        setSelectedModels((prev) =>
            prev.includes(model)
                ? prev.filter((m) => m !== model)
                : [...prev, model]
        );
    };

    // Überprüfen, ob es Daten gibt
    const isNoSalesData = chartData.every((data) =>
        modelsWithSales.every((model) => data[model] === 0)
    );

    return (
        <Card className="h-[440px] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                    <CardTitle>
                        {metric === "revenue" ? "Bike Model Revenue" : "Bike Model Sales"}
                    </CardTitle>
                    <CardDescription>
                        {metric === "revenue"
                            ? "Revenue per model over time. Select models to view."
                            : "Sales per model over time. Select models to view."}
                    </CardDescription>
                </div>

                <div className="flex items-center space-x-4">
                    {/* Metric Switch */}
                    {!isLoading && (
                        <div className="flex items-center space-x-1">
                            <span
                              className={cn(
                                  "text-sm text-muted-foreground",
                                  metric === "total_sales" && "font-semibold"
                              )}
                            >
                                Sales
                            </span>
                            <Switch
                                checked={metric === "revenue"}
                                onCheckedChange={(checked) =>
                                    setMetric(checked ? "revenue" : "total_sales")
                                }
                            />
                            <span
                                className={cn(
                                    "text-sm text-muted-foreground",
                                    metric === "revenue" && "font-semibold"
                                )}
                            >
                                Revenue
                            </span>
                        </div>
                    )}

                    {/* Filter Models */}
                    {!isLoading && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="text-sm h-8 px-3">
                                    Filter Models
                                    <ChevronDown className="ml-2 h-4 w-4"/>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0">
                                <Command>
                                    <CommandGroup>
                                        {modelsWithSales.map((model) => (
                                            <CommandItem key={model} onSelect={() => toggleModel(model)}>
                                                <div
                                                    className={cn(
                                                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                        selectedModels.includes(model)
                                                            ? "bg-primary text-primary-foreground"
                                                            : "opacity-50"
                                                    )}
                                                >
                                                    {selectedModels.includes(model) && (
                                                        <Check className="h-3 w-3"/>
                                                    )}
                                                </div>
                                                {model}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pb-4 flex-grow">
                {isLoading ? (
                    <Skeleton className="w-full h-[300px]"/>
                ) : isNoSalesData ? (
                    <p className="text-sm text-muted-foreground mt-4">No data to display.</p>
                ) : (
                    <ChartContainer config={chartConfig} className="w-full h-[300px]">
                        <LineChart
                            data={chartData}
                            margin={{top: 5, right: 10, left: 10, bottom: 0}}
                        >
                            {selectedModels.map((modelName, index) => (
                                <Line
                                    key={modelName}
                                    type="monotone"
                                    dataKey={modelName}
                                    stroke={modelColors[index % modelColors.length]}
                                    strokeWidth={2}
                                    activeDot={{
                                        r: 6,
                                        fill: modelColors[index % modelColors.length],
                                    }}
                                />
                            ))}
                            <XAxis
                                dataKey="formattedDate"
                                tickFormatter={(tick) => tick}
                                axisLine={false}
                                tickLine={false}
                                tick={{fontSize: 12, fill: "#555"}}
                            />
                            <Tooltip
                                content={({active, payload}) => {
                                    if (!active || !payload || payload.length === 0) return null;
                                    const currentPoint = payload[0].payload;
                                    return (
                                        <div className="rounded-md border bg-background p-2 shadow-sm text-sm">
                                            <div className="text-muted-foreground mb-1 font-medium">
                                                {currentPoint.formattedDate}
                                            </div>
                                            <div className="space-y-1">
                                                {payload.map((entry, index) => (
                                                    <div key={index} className="flex items-center gap-2">
                                                        <span
                                                            className="h-2 w-2 rounded-full"
                                                            style={{
                                                                backgroundColor: entry.color,
                                                            }}
                                                        />
                                                        <span>{entry.name}</span>
                                                        <span className="ml-auto font-medium">
                                                          {metric === "revenue"
                                                              ? `$${(entry.value as number).toFixed(2)}`
                                                              : entry.value}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                }}
                            />
                        </LineChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}
