import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {Skeleton} from "@/components/ui/skeleton";
import {Building2} from "lucide-react";
import type {CityData} from "@/models/api";
import {useTranslation} from "react-i18next";

interface Props {
    citiesData: CityData[];
    isLoading: boolean;
}

export default function CitiesList({citiesData, isLoading}: Props) {
    const {t} = useTranslation();

    function calculatePercentageChange(current: number, previous: number): number | undefined {
        if (previous === 0) {
            return undefined;
        }
        return ((current - previous) / previous) * 100;
    }

    return (
        <Card className="col-span-3 h-[440px] flex flex-col">
            <CardHeader>
                <CardTitle>{t("cities_list_title")}</CardTitle>
                <CardDescription>
                    {isLoading
                        ? t("loading_cities")
                        : citiesData.length > 0
                            ? t("sales_to_cities", {count: citiesData.length})
                            : t("no_sales_data")}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow overflow-auto">
                <div className="space-y-7">
                    {isLoading ? (
                        // Show 5 skeleton items while loading
                        Array.from({length: 5}).map((_, index) => (
                            <div key={index} className="flex items-center space-x-4">
                                <Skeleton className="w-10 h-10 rounded-full"/>
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-32"/>
                                    <Skeleton className="h-3 w-24"/>
                                </div>
                                <Skeleton className="h-4 w-16 ml-auto"/>
                            </div>
                        ))
                    ) : citiesData.length === 0 ? (
                        <p className="text-sm text-muted-foreground">{t("no_data_to_display")}</p>
                    ) : (
                        citiesData.map((cityData, index) => {
                            const percentageChange = calculatePercentageChange(
                                cityData.current_revenue,
                                cityData.previous_revenue
                            );
                            const formattedPercentage =
                                percentageChange !== undefined ? percentageChange.toFixed(1) : "";

                            let avatarClass = '';
                            if (index === 0) {
                                avatarClass = 'border-4 border-yellow-500';
                            } else if (index === 1) {
                                avatarClass = 'border-4 border-gray-400';
                            } else if (index === 2) {
                                avatarClass = 'border-4 border-orange-500';
                            }

                            return (
                                <div key={index} className="flex items-center">
                                    <Avatar className={`w-10 h-10 ${avatarClass}`}>
                                        <AvatarFallback>
                                            <Building2 size={20}/>
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {cityData.city}
                                        </p>
                                        {percentageChange !== undefined && (
                                            <p className="text-sm text-muted-foreground">
                                                {percentageChange > 0
                                                    ? t("up_percentage", {value: formattedPercentage})
                                                    : t("down_percentage", {value: Math.abs(parseFloat(formattedPercentage)).toFixed(2)})}
                                            </p>
                                        )}
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