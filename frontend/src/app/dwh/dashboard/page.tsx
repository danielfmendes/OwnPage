"use client";
import Link from "next/link";
import {ContentLayout} from "@/components/admin-panel/content-layout";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {useSidebar} from "@/hooks/use-sidebar";
import {useStore} from "@/hooks/use-store";
import {useEffect, useState} from "react";
import {BikeModels} from "@/app/dwh/dashboard/time-graph";
import {MetricStats} from "@/app/dwh/dashboard/revenue-graph";
import CitiesList from "@/app/dwh/dashboard/cities-list";
import * as React from "react";
import {fetchWithToken} from "@/utils/url";
import {useNotification} from "@/components/helpers/NotificationProvider";
import {BikeSales, CityData, GraphData, GraphMeta} from "@/types/custom";

export default function DashboardPage() {
    const {addNotification} = useNotification();
    const sidebar = useStore(useSidebar, (x) => x);
    const [timeRange, setTimeRange] = useState("1m");
    const [graphMetaData, setGraphMetaData] = useState<GraphMeta | null>(null);
    const [graphDataData, setGraphDataData] = useState<GraphData[]>([]);
    const [citiesData, setCitiesData] = useState<CityData[]>([]);
    const [bikeData, setBikeData] = useState<BikeSales[]>([]);
    const [isLoadingGraphMetaData, setIsLoadingGraphMetaData] = useState(false);
    const [isLoadingGraphDataData, setIsLoadingGraphDataData] = useState(false);
    const [isLoadingCitiesData, setIsLoadingCitiesData] = useState(false);
    const [isLoadingBikeData, setIsLoadingBikeData] = useState(false);
    let revenueChangePct = 100;
    let salesChangePct = 100;

    // Fetch graph meta data and calculate revenue and sales change percentage
    const fetchGraphMetaData = () => {
        setIsLoadingGraphMetaData(true);
        fetchWithToken(`/dashboard/graphmeta?range=${timeRange}`)
            .then((res) => res.json())
            .then((data: GraphMeta[]) => {
                const graphMeta = data[0];
                setGraphMetaData(graphMeta);

                // Calculate revenue change percentage and sales change percentage only if previous values are available
                if (graphMeta?.previous_revenue && graphMeta?.previous_revenue > 0) {
                    revenueChangePct =
                        ((graphMeta?.current_revenue - graphMeta?.previous_revenue) /
                            graphMeta?.previous_revenue) *
                        100;
                }

                if (graphMeta?.previous_sales && graphMeta?.previous_sales > 0) {
                    salesChangePct =
                        ((graphMeta?.current_sales - graphMeta?.previous_sales) /
                            graphMeta?.previous_sales) *
                        100;
                }
            })
            .catch((err) => addNotification(`Error loading graph meta: ${err}`, "error"))
            .finally(() => setIsLoadingGraphMetaData(false));
    };

    // Fetch graph data
    const fetchGraphData = () => {
        setIsLoadingGraphDataData(true);
        fetchWithToken(`/dashboard/graphdata?range=${timeRange}`)
            .then((res) => res.json())
            .then((data: GraphData[]) => {
                console.log("Graph data:", data);
                setGraphDataData(data)
            })
            .catch((err) => addNotification(`Error loading graph data: ${err}`, "error"))
            .finally(() => setIsLoadingGraphDataData(false));
    };

    // Fetch city data
    const fetchCityData = () => {
        setIsLoadingCitiesData(true);
        fetchWithToken(`/dashboard/citydata?range=${timeRange}`)
            .then((res) => res.json())
            .then((data: CityData[]) => {
                if (data) {
                    setCitiesData(data)
                } else {
                    setCitiesData([]);
                }
            })
            .catch((err) => addNotification(`Error loading city data: ${err}`, "error"))
            .finally(() => setIsLoadingCitiesData(false));
    };

    // Fetch bike data
    const fetchBikeData = () => {
        setIsLoadingBikeData(true);
        fetchWithToken(`/dashboard/bikemodels?range=${timeRange}`)
            .then((res) => res.json())
            .then((data: BikeSales[]) => setBikeData(data))
            .catch((err) => addNotification(`Error loading bike data: ${err}`, "error"))
            .finally(() => setIsLoadingBikeData(false));
    };

    useEffect(() => {
        fetchGraphMetaData();
        fetchGraphData();
        fetchCityData();
        fetchBikeData();
    }, [timeRange]);

    if (!sidebar) return null;

    return (
        <ContentLayout title="Dashboard">
            <div className="flex flex-row items-center justify-between gap-4 mb-4">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/">Home</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator/>
                        <BreadcrumbItem>
                            <BreadcrumbPage>Dashboard</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <Tabs value={timeRange} onValueChange={setTimeRange}>
                    <TabsList className="gap-1">
                        {["1d", "1w", "1m", "1y", "max"].map((value) => (
                            <TabsTrigger key={value} value={value}>
                                {value.toUpperCase()}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>
            <div className="grid gap-4">
                <MetricStats
                    graphData={graphDataData}
                    graphMeta={{
                        currentRevenue: graphMetaData?.current_revenue ?? 0,
                        revenueChangePct: revenueChangePct,
                        currentSales: graphMetaData?.current_sales ?? 0,
                        salesChangePct: salesChangePct,
                    }}
                    timeRange={timeRange}
                    isLoadingGraphMetaData={isLoadingGraphMetaData}
                    isLoadingGraphDataData={isLoadingGraphDataData}
                />

                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-10">
                    <div className="sm:col-span-1 md:col-span-5 lg:col-span-6 xl:col-span-7">
                        <BikeModels bikeData={bikeData} isLoading={isLoadingBikeData}/>
                    </div>
                    <div className="sm:col-span-1 md:col-span-5 lg:col-span-4 xl:col-span-3">
                        <CitiesList citiesData={citiesData} isLoading={isLoadingCitiesData}/>
                    </div>
                </div>
            </div>
        </ContentLayout>
    );
}
