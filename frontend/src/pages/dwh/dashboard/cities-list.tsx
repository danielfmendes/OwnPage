import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, MapPinOff } from "lucide-react";
import type { CityData } from "@/models/api";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { useIsMobile } from "@/utils/use-mobile";

interface Props {
    citiesData: CityData[];
    isLoading: boolean;
    maxHeight: number;
}

export default function CitiesList({ citiesData, isLoading, maxHeight }: Props) {
    const { t } = useTranslation();
    const isMobile = useIsMobile();

    const visibleCount = useMemo(() => {
        if (isMobile) {
            return 5;
        }
        const heightTitle = 100;
        const itemHeight = 52; // Reduced item height for dashboard logic
        return maxHeight ? Math.floor((maxHeight - heightTitle) / itemHeight) : 0;
    }, [maxHeight, isMobile]);

    const visibleCities = useMemo(() => {
        return citiesData.slice(0, visibleCount);
    }, [citiesData, visibleCount]);

    function calculatePercentageChange(current: number, previous: number): number | undefined {
        if (previous === 0) {
            return undefined;
        }
        return ((current - previous) / previous) * 100;
    }

    return (
        <Card className="col-span-3 flex flex-col h-full">
            <CardHeader>
                <CardTitle>{t("cities_list_title", { count: visibleCities.length })}</CardTitle>
                <CardDescription>
                    {isLoading
                        ? t("loading_cities")
                        : visibleCities.length > 0
                            ? t("sales_to_cities", { count: visibleCities.length })
                            : t("no_sales_data")}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow overflow-auto">
                <div className="space-y-5 pt-2">
                    {isLoading ? (
                        // Show as many skeleton items as fit
                        Array.from({ length: visibleCount }).map((_, index) => (
                            <div key={index} className="flex items-center space-x-4">
                                <Skeleton className="w-10 h-10 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                                <Skeleton className="h-4 w-20 ml-auto" />
                            </div>
                        ))
                    ) : visibleCities.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-muted-foreground h-full min-h-[150px]">
                            <div className="rounded-full bg-muted p-4 mb-3 mt-4">
                                <MapPinOff className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-medium">{t("no_data_to_display")}</p>
                        </div>
                    ) : (
                        visibleCities.map((cityData, index) => {
                            const percentageChange = calculatePercentageChange(
                                cityData.current_revenue,
                                cityData.previous_revenue
                            );
                            const formattedPercentage =
                                percentageChange !== undefined ? percentageChange.toFixed(1) : "";

                            let avatarClass = 'bg-muted text-muted-foreground';
                            if (index === 0) {
                                avatarClass = 'ring-2 ring-yellow-500 ring-offset-2 ring-offset-background bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
                            } else if (index === 1) {
                                avatarClass = 'ring-2 ring-gray-400 ring-offset-2 ring-offset-background bg-gray-400/10 text-gray-600 dark:text-gray-300';
                            } else if (index === 2) {
                                avatarClass = 'ring-2 ring-orange-500 ring-offset-2 ring-offset-background bg-orange-500/10 text-orange-600 dark:text-orange-400';
                            }

                            return (
                                <div key={index} className="flex items-center space-x-4">
                                    <Avatar className={`w-10 h-10 ${avatarClass}`}>
                                        <AvatarFallback className="bg-transparent flex items-center justify-center">
                                            <Building2 className="w-5 h-5" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {cityData.city}
                                        </p>
                                        {percentageChange !== undefined && (
                                            <p className="text-xs text-muted-foreground">
                                                {percentageChange > 0
                                                    ? t("up_percentage", { value: formattedPercentage })
                                                    : t("down_percentage", { value: Math.abs(parseFloat(formattedPercentage)).toFixed(2) })}
                                            </p>
                                        )}
                                    </div>
                                    <div className="ml-auto font-medium">
                                        ${cityData.current_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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