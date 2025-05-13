import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2 } from "lucide-react";
import { CityData } from "@/types/custom";

interface Props {
    citiesData: CityData[];
    isLoading: boolean;
}

export default function CitiesList({ citiesData, isLoading }: Props) {
    return (
        <Card className="col-span-3 h-[440px] flex flex-col">
            <CardHeader>
                <CardTitle>Top 5 Cities per Revenue</CardTitle>
                <CardDescription>
                    {isLoading
                        ? "Loading cities..."
                        : citiesData.length > 0
                            ? `You made sales to ${citiesData.length} different cities`
                            : "No sales data available for any cities."}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow overflow-auto">
                <div className="space-y-7">
                    {isLoading ? (
                        // Show 5 skeleton items while loading
                        Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="flex items-center space-x-4">
                                <Skeleton className="w-10 h-10 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                                <Skeleton className="h-4 w-16 ml-auto" />
                            </div>
                        ))
                    ) : citiesData.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No data to display.</p>
                    ) : (
                        citiesData.map((cityData, index) => {
                            const percentageChange =
                                cityData.previous_revenue === 0
                                    ? 100
                                    : ((cityData.current_revenue - cityData.previous_revenue) /
                                        cityData.previous_revenue) *
                                    100;

                            const formattedPercentage = percentageChange.toFixed(1);

                            return (
                                <div key={index} className="flex items-center">
                                    <Avatar className="w-10 h-10">
                                        <AvatarFallback>
                                            <Building2 size={20} />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {cityData.city}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {percentageChange > 0
                                                ? `Up ${formattedPercentage}%`
                                                : `Down ${Math.abs(parseFloat(formattedPercentage)).toFixed(1)}%`}
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium">
                                        ${cityData.current_revenue.toFixed(2)}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
