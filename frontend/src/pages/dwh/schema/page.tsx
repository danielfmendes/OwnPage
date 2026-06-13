// Schema management: edit the ACTIVE schema's entities/columns/relationships (Builder + ER diagram).
// Destructive edits warn with affected-row counts (see SchemaBuilder). Shared by all projects on the
// schema, so editing needs write access.

import { useCallback, useEffect, useState } from "react";
import ContentLayout from "@/components/layout/ContentLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotification } from "@/components/helpers/NotificationProvider";
import { dwhClient } from "@/models/dwh/dwhClient";
import { useActiveSchema } from "@/utils/useActiveSchema";
import type { DwhEntity } from "@/models/dwh/types";
import SchemaBuilder from "./SchemaBuilder";
import ErPlayground from "./ErPlayground";

export default function SchemaPage() {
    const { schemaId, schemaName, canWrite } = useActiveSchema();
    const { addNotification } = useNotification();
    const [entities, setEntities] = useState<DwhEntity[]>([]);

    const reload = useCallback(() => {
        if (!schemaId) return;
        dwhClient.listEntities(schemaId).then(setEntities).catch((e: any) => addNotification(`${e?.message ?? e}`, "error"));
    }, [schemaId, addNotification]);

    useEffect(() => { reload(); }, [reload]);

    if (!schemaId) {
        return <ContentLayout title="Schema"><div className="p-8 text-center text-muted-foreground">Select a project (with a schema) using the picker at the top.</div></ContentLayout>;
    }

    return (
        <ContentLayout title={schemaName ? `Schema · ${schemaName}` : "Schema"}>
            {!canWrite && <div className="mb-3 rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">Read-only — you need admin/creator on a project of this schema to edit it.</div>}
            <Tabs defaultValue="builder" className="w-full">
                <TabsList>
                    <TabsTrigger value="builder">Builder</TabsTrigger>
                    <TabsTrigger value="diagram">Diagram</TabsTrigger>
                </TabsList>
                <TabsContent value="builder" className="mt-4">
                    <SchemaBuilder schemaId={schemaId} entities={entities} reload={reload} canWrite={canWrite} />
                </TabsContent>
                <TabsContent value="diagram" className="mt-4">
                    <ErPlayground entities={entities} reload={reload} canWrite={canWrite} />
                </TabsContent>
            </Tabs>
        </ContentLayout>
    );
}
