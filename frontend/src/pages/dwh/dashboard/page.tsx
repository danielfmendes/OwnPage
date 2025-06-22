import {Link} from "react-router-dom";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {useEffect, useRef, useState} from "react";
import {useNotification} from "@/components/helpers/NotificationProvider";
import {
    type BikeSales,
    type CityData,
    DashboardsService,
    type GraphData,
    type GraphMeta, OpenAPI,
    type RoleManagementWithName
} from "@/models/api";
import {useTranslation} from "react-i18next";
import FilterManager from "@/utils/filtermanager";
import ContentLayout from "@/components/layout/ContentLayout";
import {MetricStats} from "@/pages/dwh/dashboard/revenue-graph";
import {BikeModels} from "@/pages/dwh/dashboard/time-graph";
import CitiesList from "@/pages/dwh/dashboard/cities-list";
import {useRoleStore} from "@/utils/rolemananagemetstate.ts";
import apiUrl from "@/utils/helpers.ts";

export default function DashboardPage() {
    const {t} = useTranslation();
    const {addNotification} = useNotification();
    const filterManager = new FilterManager();
    const roles: RoleManagementWithName[] = useRoleStore((state) => state.selectedRoles);

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

    const containerRef = useRef<HTMLDivElement>(null);
    const [metricHeight, setMetricHeight] = useState<number | null>(null);
    const [otherHeight, setOtherHeight] = useState<number | null>(null);

    useEffect(() => {
        // TODO improve: temporary
        if (OpenAPI.BASE == apiUrl) {
            fetchGraphMetaData();
            fetchGraphData();
            fetchCityData();
            fetchBikeData();
        }
    }, [timeRange, roles, OpenAPI.BASE]);

    useEffect(() => {
        const measure = () => {
            if (!containerRef.current) return;
            const fullHeight = window.innerHeight - containerRef.current.getBoundingClientRect().top - 14;

            const newMetricHeight = Math.max(226, Math.round(fullHeight * 0.29));
            let newOtherHeight;
            if (newMetricHeight == 226) {
                newOtherHeight = fullHeight - newMetricHeight - 20;
            } else {
                newOtherHeight = Math.round(fullHeight * 0.69);
            }
            setMetricHeight(newMetricHeight);
            setOtherHeight(newOtherHeight);
        };

        const id = setTimeout(() => measure(), 0);

        window.addEventListener("resize", measure);
        return () => {
            clearTimeout(id);
            window.removeEventListener("resize", measure);
        };
    }, []);

    // Fetch graph meta data and calculate revenue and sales change percentage
    const fetchGraphMetaData = () => {
        setIsLoadingGraphMetaData(true);
        filterManager.addFilter("range", [timeRange]);
        const filterString = filterManager.getFilterStringWithProjectIds();
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
    const fetchGraphData = () => {
        setIsLoadingGraphDataData(true);
        filterManager.addFilter("range", [timeRange]);
        const filterString = filterManager.getFilterStringWithProjectIds();
        DashboardsService.getGraphData(filterString === "" ? undefined : filterString)
            .then((data: GraphData[]) => setGraphDataData(data))
            .catch(err => addNotification(`Failed to load graph data${err?.message ? `: ${err.message}` : ""}`, "error"))
            .finally(() => setIsLoadingGraphDataData(false));
    };

    // Fetch city data
    const fetchCityData = () => {
        setIsLoadingCitiesData(true);
        filterManager.addFilter("range", [timeRange]);
        const filterString = filterManager.getFilterStringWithProjectIds();
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
    const fetchBikeData = () => {
        setIsLoadingBikeData(true);
        filterManager.addFilter("range", [timeRange]);
        const filterString = filterManager.getFilterStringWithProjectIds();
        DashboardsService.getBikeSales(filterString === "" ? undefined : filterString)
            .then((data: BikeSales[]) => setBikeData(data))
            .catch(err => addNotification(`Failed to load bike data${err?.message ? `: ${err.message}` : ""}`, "error"))
            .finally(() => setIsLoadingBikeData(false));
    };

    return (
        <ContentLayout title={t("menu.dashboard")} className="2xl:px-32 h-full">
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
                                        <Link to="/">{t("home")}</Link>
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

            <div ref={containerRef} className="grid gap-4 h-[calc(100%-50px)]">
                {metricHeight !== null && (
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
                        maxHeight={metricHeight}
                    />
                )}

                {otherHeight !== null && (
                    <div className="grid gap-4 grid-cols-1 lg:grid-cols-10">
                        <div className="col-span-1 md:col-span-6 lg:col-span-6 xl:col-span-7">
                            <BikeModels bikeData={bikeData} isLoading={isLoadingBikeData} maxHeight={otherHeight}/>
                        </div>
                        <div className="col-span-1 md:col-span-4 lg:col-span-4 xl:col-span-3">
                            <CitiesList citiesData={citiesData} isLoading={isLoadingCitiesData}
                                        maxHeight={otherHeight}/>
                        </div>
                    </div>
                )}

            </div>
        </ContentLayout>
    );
}
