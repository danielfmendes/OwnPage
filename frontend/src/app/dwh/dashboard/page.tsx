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
import {useNotification} from "@/components/helpers/NotificationProvider";
import {BikeSales, CityData, DashboardsService, GraphData, GraphMeta} from "@/models/api";
import {useTranslation} from "react-i18next";
import FilterManager from "@/utils/filtermanager";

export default function DashboardPage() {
    const {t} = useTranslation();
    const {addNotification} = useNotification();
    const filterManager = new FilterManager();
    const sidebar = useStore(useSidebar, (x) => x);
    const [timeRange, setTimeRange] = useState("1m");
    const [revenueChangePct, setRevenueChangePct] = useState(100);
    const [salesChangePct, setSalesChangePct] = useState(100);

    const [graphMetaData, setGraphMetaData] = useState<GraphMeta | null>(null);
    const [graphDataData, setGraphDataData] = useState<GraphData[]>([]);
    const [citiesData, setCitiesData] = useState<CityData[]>([]);
    const [bikeData, setBikeData] = useState<BikeSales[]>([]);
    const [isLoadingGraphMetaData, setIsLoadingGraphMetaData] = useState(false);
    const [isLoadingGraphDataData, setIsLoadingGraphDataData] = useState(false);
    const [isLoadingCitiesData, setIsLoadingCitiesData] = useState(false);
    const [isLoadingBikeData, setIsLoadingBikeData] = useState(false);

    // Fetch graph meta data and calculate revenue and sales change percentage
    const fetchGraphMetaData = async () => {
        setIsLoadingGraphMetaData(true);
        filterManager.addFilter("range", [timeRange]);
        const filterString = await filterManager.getFilterStringWithProjectIds();
        DashboardsService.getGraphMeta(filterString === "" ? undefined : filterString)
            .then((data: GraphMeta[]) => {
                const graphMeta = data[0];
                setGraphMetaData(graphMeta);

                // Calculate revenue change percentage and sales change percentage only if previous values are available
                if (graphMeta?.previous_revenue && graphMeta?.previous_revenue > 0) {
                    const calcRevenueChangePct =
                        ((graphMeta?.current_revenue - graphMeta?.previous_revenue) /
                            graphMeta?.previous_revenue) *
                        100;
                    setRevenueChangePct(calcRevenueChangePct)
                }

                if (graphMeta?.previous_sales && graphMeta?.previous_sales > 0) {
                    const calcSalesChangePct =
                        ((graphMeta?.current_sales - graphMeta?.previous_sales) /
                            graphMeta?.previous_sales) *
                        100;
                    setSalesChangePct(calcSalesChangePct)
                }
            })
            .catch(err => addNotification(`Failed to load graph meta${err?.message ? `: ${err.message}` : ""}`, "error"))
            .finally(() => setIsLoadingGraphMetaData(false));
    };

    // Fetch graph data
    const fetchGraphData = async () => {
        setIsLoadingGraphDataData(true);
        filterManager.addFilter("range", [timeRange]);
        const filterString = await filterManager.getFilterStringWithProjectIds();
        DashboardsService.getGraphData(filterString === "" ? undefined : filterString)
            .then((data: GraphData[]) => setGraphDataData(data))
            .catch(err => addNotification(`Failed to load graph data${err?.message ? `: ${err.message}` : ""}`, "error"))
            .finally(() => setIsLoadingGraphDataData(false));
    };

    // Fetch city data
    const fetchCityData = async () => {
        setIsLoadingCitiesData(true);
        filterManager.addFilter("range", [timeRange]);
        const filterString = await filterManager.getFilterStringWithProjectIds();
        DashboardsService.getCityData(filterString === "" ? undefined : filterString)
            .then((data: CityData[]) => {
                if (data) {
                    setCitiesData(data)
                } else {
                    setCitiesData([]);
                }
            })
            .catch(err => addNotification(`Failed to load city data${err?.message ? `: ${err.message}` : ""}`, "error"))
            .finally(() => setIsLoadingCitiesData(false));
    };

    // Fetch bike data
    const fetchBikeData = async () => {
        setIsLoadingBikeData(true);
        filterManager.addFilter("range", [timeRange]);
        const filterString = await filterManager.getFilterStringWithProjectIds();
        DashboardsService.getBikeSales(filterString === "" ? undefined : filterString)
            .then((data: BikeSales[]) => setBikeData(data))
            .catch(err => addNotification(`Failed to load bike data${err?.message ? `: ${err.message}` : ""}`, "error"))
            .finally(() => setIsLoadingBikeData(false));
    };

    useEffect(() => {
        (async () => {
            await fetchGraphMetaData();
            await fetchGraphData();
            await fetchCityData();
            await fetchBikeData();
        })();
    }, [timeRange]);

    if (!sidebar) return null;

    return (
        <ContentLayout title={t("menu.dashboard")}>
            <div className="flex flex-col gap-2 sm:gap-4 mb-4">
                <div className="flex flex-row items-center justify-between gap-2">
                    {/* Mobile: show dashboard text; Desktop: hide because it's in breadcrumb */}
                    <div className="block sm:hidden text-lg font-semibold">
                        {t("menu.dashboard")}
                    </div>
                    {/* Desktop: Full breadcrumb */}
                    <div className="hidden sm:block">
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink asChild>
                                        <Link href="/">{t("home")}</Link>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator/>
                                <BreadcrumbItem>
                                    <BreadcrumbPage>{t("menu.dashboard")}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
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

                <div className="grid gap-4 grid-cols-1 md:grid-cols-10">
                    <div className="col-span-1 md:col-span-6 lg:col-span-6 xl:col-span-7">
                        <BikeModels bikeData={bikeData} isLoading={isLoadingBikeData}/>
                    </div>
                    <div className="col-span-1 md:col-span-4 lg:col-span-4 xl:col-span-3">
                        <CitiesList citiesData={citiesData} isLoading={isLoadingCitiesData}/>
                    </div>
                </div>
            </div>
        </ContentLayout>
    );
}
