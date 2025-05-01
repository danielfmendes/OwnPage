"use client";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
    TooltipProvider,
} from "@/components/ui/tooltip";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import BikeTable from "@/components/admin-panel/table";

export default function DashboardPage() {
    const sidebar = useStore(useSidebar, (x) => x);
    if (!sidebar) return null;
    return (
        <ContentLayout title="Teilelager">
            <TooltipProvider>
                <div>
                    <BikeTable />
                </div>
            </TooltipProvider>
        </ContentLayout>
    );
}
