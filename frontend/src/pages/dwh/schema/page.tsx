// Schema page: tabs for the form-based builder and the visual ER playground. Both operate on the
// current project's catalog and share a single reload.

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ContentLayout from "@/components/layout/ContentLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotification } from "@/components/helpers/NotificationProvider";
import { dwhClient } from "@/models/dwh/dwhClient";
import type { DwhEntity } from "@/models/dwh/types";
import SchemaBuilder from "./SchemaBuilder";
import ErPlayground from "./ErPlayground";

export default function SchemaPage() {
    const [searchParams] = useSearchParams();
    const projectId = Number(searchParams.get("project_id"));
    const { addNotification } = useNotification();
    const [entities, setEntities] = useState<DwhEntity[]>([]);

    const reload = useCallback(() => {
        if (!projectId) return;
        dwhClient.listEntities(projectId)
            .then(setEntities)
            .catch((e: any) => addNotification(`${e?.message ?? e}`, "error"));
    }, [projectId, addNotification]);

    useEffect(() => { reload(); }, [reload]);

    if (!projectId) {
        return <ContentLayout title="Schema"><div className="p-6 text-muted-foreground">Select a project first.</div></ContentLayout>;
    }

    return (
        <ContentLayout title="Schema">
            <Tabs defaultValue="builder" className="w-full">
                <TabsList>
                    <TabsTrigger value="builder">Builder</TabsTrigger>
                    <TabsTrigger value="diagram">Diagram</TabsTrigger>
                </TabsList>
                <TabsContent value="builder" className="mt-4">
                    <SchemaBuilder projectId={projectId} entities={entities} reload={reload} />
                </TabsContent>
                <TabsContent value="diagram" className="mt-4">
                    <ErPlayground entities={entities} reload={reload} />
                </TabsContent>
            </Tabs>
        </ContentLayout>
    );
}
