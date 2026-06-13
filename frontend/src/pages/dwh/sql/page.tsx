// SQL console: a scoped, read-only query editor (Monaco) plus a generated-DDL viewer. Writes/DDL
// are blocked server-side (see controller sql/guard.ts); structural changes go through the schema
// builder, not raw SQL.

import { useCallback, useEffect, useState } from "react";
import { useActiveSchema } from "@/utils/useActiveSchema";
import Editor from "@monaco-editor/react";
import ContentLayout from "@/components/layout/ContentLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { dwhClient } from "@/models/dwh/dwhClient";
import type { DwhEntity } from "@/models/dwh/types";

export default function SqlConsolePage() {
    const { schemaId } = useActiveSchema();

    const [sql, setSql] = useState("SELECT 1;");
    const [result, setResult] = useState<{ columns: string[]; rows: Record<string, any>[] } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [running, setRunning] = useState(false);

    const [entities, setEntities] = useState<DwhEntity[]>([]);
    const [ddlEntityId, setDdlEntityId] = useState<string>("");
    const [ddl, setDdl] = useState("");

    useEffect(() => {
        if (!schemaId) return;
        dwhClient.listEntities(schemaId).then(setEntities).catch(() => setEntities([]));
    }, [schemaId]);

    const run = useCallback(async () => {
        if (!schemaId) return;
        setRunning(true); setError(null);
        try {
            const res = await dwhClient.runSql(schemaId, sql);
            setResult(res);
        } catch (e: any) {
            setError(e?.message ?? String(e));
            setResult(null);
        } finally {
            setRunning(false);
        }
    }, [schemaId, sql]);

    const loadDdl = useCallback((id: string) => {
        setDdlEntityId(id);
        if (!id) return;
        dwhClient.getDdl(Number(id)).then((r) => setDdl(r.ddl)).catch((e: any) => setDdl(`-- ${e?.message ?? e}`));
    }, []);

    if (!schemaId) {
        return (
            <ContentLayout title="SQL">
                <div className="p-8 text-center text-muted-foreground">
                    No project selected. Use the <span className="font-medium text-foreground">project picker</span> at the top to choose one.
                </div>
            </ContentLayout>
        );
    }

    return (
        <ContentLayout title="SQL">
            <Tabs defaultValue="query" className="w-full">
                <TabsList>
                    <TabsTrigger value="query">Query</TabsTrigger>
                    <TabsTrigger value="ddl">DDL</TabsTrigger>
                </TabsList>

                <TabsContent value="query" className="mt-4 flex flex-col gap-3">
                    <div className="rounded-xl border overflow-hidden">
                        <Editor height="240px" defaultLanguage="sql" value={sql} onChange={(v) => setSql(v ?? "")} options={{ minimap: { enabled: false }, fontSize: 13 }} />
                    </div>
                    <div className="flex items-center gap-3">
                        <Button onClick={run} disabled={running}>{running ? "Running…" : "Run (read-only)"}</Button>
                        <span className="text-xs text-muted-foreground">Only SELECT against this project's tables is allowed.</span>
                    </div>
                    {error && <div className="rounded-md border border-red-300 bg-red-50 text-red-700 text-sm p-3 dark:bg-red-950/30">{error}</div>}
                    {result && (
                        <div className="rounded-xl border overflow-auto max-h-[45vh]">
                            <Table>
                                <TableHeader>
                                    <TableRow>{result.columns.map((c) => <TableHead key={c}>{c}</TableHead>)}</TableRow>
                                </TableHeader>
                                <TableBody>
                                    {result.rows.map((row, i) => (
                                        <TableRow key={i}>
                                            {result.columns.map((c) => <TableCell key={c}>{row[c] === null ? "—" : String(row[c])}</TableCell>)}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {result.rows.length === 0 && <div className="p-3 text-sm text-muted-foreground">No rows.</div>}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="ddl" className="mt-4 flex flex-col gap-3">
                    <Select value={ddlEntityId} onValueChange={loadDdl}>
                        <SelectTrigger className="w-64"><SelectValue placeholder="Select an entity" /></SelectTrigger>
                        <SelectContent>
                            {entities.map((e) => <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <div className="rounded-xl border overflow-hidden">
                        <Editor height="300px" defaultLanguage="sql" value={ddl} options={{ readOnly: true, minimap: { enabled: false }, fontSize: 13 }} />
                    </div>
                </TabsContent>
            </Tabs>
        </ContentLayout>
    );
}
