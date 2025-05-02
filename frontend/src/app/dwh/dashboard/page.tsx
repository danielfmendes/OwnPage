"use client";
import Link from "next/link";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid
} from "recharts";
import { useTheme } from "next-themes";

const yearlySales = [
    { year: "2021", sales: 4000 },
    { year: "2022", sales: 8000 },
    { year: "2023", sales: 12000 },
];

const stockTrend = [
    { month: "Jan", stock: 100 },
    { month: "Feb", stock: 90 },
    { month: "Mar", stock: 120 },
];

const topProducts = [
    { name: "Produkt A", sales: 300 },
    { name: "Produkt B", sales: 250 },
    { name: "Produkt C", sales: 200 },
];

export default function DashboardPage() {
    const sidebar = useStore(useSidebar, (x) => x);
    const { theme } = useTheme();

    const isDark = theme === "dark";

    const chartTextColor = isDark ? "#ffffff" : "#000000";
    const chartGridColor = isDark ? "#444" : "#ccc";
    const chartBarColor = isDark ? "#60a5fa" : "#3b82f6";
    const chartLineColor = isDark ? "#34d399" : "#10b981";

    if (!sidebar) return null;

    return (
        <ContentLayout title="Dashboard">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/">Home</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Dashboard</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <TooltipProvider>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {/* Umsatz pro Jahr */}
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow">
                        <h2 className="text-lg font-semibold mb-2 text-zinc-800 dark:text-white">Umsatz pro Jahr</h2>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={yearlySales}>
                                <XAxis dataKey="year" stroke={chartTextColor} />
                                <YAxis stroke={chartTextColor} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDark ? "#1f2937" : "#fff",
                                        color: chartTextColor,
                                    }}
                                />
                                <Bar dataKey="sales" fill={chartBarColor} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Umsatz pro Land */}
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow">
                        <h2 className="text-lg font-semibold mb-2 text-zinc-800 dark:text-white">Umsatz pro Land</h2>
                        <div className="w-full h-[200px] flex items-center justify-center text-gray-500 dark:text-gray-300">
                            {/* Platzhalter für Weltkarte */}
                            <span>Kartenkomponente hier einfügen</span>
                        </div>
                    </div>

                    {/* Lagerbestandsentwicklung */}
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow">
                        <h2 className="text-lg font-semibold mb-2 text-zinc-800 dark:text-white">Lagerbestandsentwicklung</h2>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={stockTrend}>
                                <XAxis dataKey="month" stroke={chartTextColor} />
                                <YAxis stroke={chartTextColor} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDark ? "#1f2937" : "#fff",
                                        color: chartTextColor,
                                    }}
                                />
                                <CartesianGrid stroke={chartGridColor} />
                                <Line type="monotone" dataKey="stock" stroke={chartLineColor} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Meistverkaufte Produkte */}
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow">
                        <h2 className="text-lg font-semibold mb-2 text-zinc-800 dark:text-white">Meistverkaufte Produkte</h2>
                        <table className="w-full text-sm text-left text-zinc-800 dark:text-white">
                            <thead className="border-b border-zinc-300 dark:border-zinc-600">
                            <tr>
                                <th className="py-2">Produkt</th>
                                <th className="py-2">Verkäufe</th>
                            </tr>
                            </thead>
                            <tbody>
                            {topProducts.map((product, idx) => (
                                <tr key={idx} className="border-b border-zinc-200 dark:border-zinc-700">
                                    <td className="py-2">{product.name}</td>
                                    <td className="py-2">{product.sales}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </TooltipProvider>
        </ContentLayout>
    );
}
