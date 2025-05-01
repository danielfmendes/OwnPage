"use client";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
    TooltipProvider,
} from "@/components/ui/tooltip";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";

export default function DashboardPage() {
    const sidebar = useStore(useSidebar, (x) => x);
    if (!sidebar) return null;
    return (
        <ContentLayout title="Warenlager">
            <TooltipProvider>
                <div>
                    <h1>Warehouse-Tabelle hier</h1>
                </div>
            </TooltipProvider>
        </ContentLayout>
    );
}
