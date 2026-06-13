// Configurable, project-agnostic dashboard. The user adds widgets (entity + group-by + aggregate +
// chart type); each widget calls /dwh/aggregate and renders with recharts. Widget config is stored
// per-project in localStorage (v1 — no server-side dashboard table yet).

import { useCallback, useEffect, useMemo, useState } from "react";
import { useActiveProject } from "@/utils/useActiveProject";
import {
    Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import ContentLayout from "@/components/layout/ContentLayout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { dwhClient } from "@/models/dwh/dwhClient";
import type { DwhEntity } from "@/models/dwh/types";

interface Widget {
    id: string;
    entity: string;
    groupBy: string;
    fn: "count" | "sum" | "avg";
    measure?: string;
    chart: "bar" | "line";
}

function WidgetCard({ projectId, widget, onRemove }: { projectId: number; widget: Widget; onRemove: () => void }) {
    const [data, setData] = useState<Array<{ value: string; total: number }>>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        dwhClient.aggregate(widget.entity, projectId, { groupBy: widget.groupBy, fn: widget.fn, measure: widget.measure })
            .then((rows) => setData(rows.map((r) => ({ value: String(r.value), total: Number(r.total) }))))
            .catch((e: any) => setError(e?.message ?? String(e)));
    }, [projectId, widget]);

    return (
        <div className="rounded-xl border p-4 bg-card">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">
                    {widget.fn}{widget.measure ? `(${widget.measure})` : ""} of {widget.entity} by {widget.groupBy}
                </h3>
                <Button variant="ghost" size="icon" className="text-red-500 h-7 w-7" onClick={onRemove}><Trash2 className="h-4 w-4" /></Button>
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : (
                <ResponsiveContainer width="100%" height={220}>
                    {widget.chart === "line" ? (
                        <LineChart data={data}>
                            <XAxis dataKey="value" fontSize={11} /><YAxis fontSize={11} /><Tooltip />
                            <Line type="monotone" dataKey="total" stroke="#6366f1" />
                        </LineChart>
                    ) : (
                        <BarChart data={data}>
                            <XAxis dataKey="value" fontSize={11} /><YAxis fontSize={11} /><Tooltip />
                            <Bar dataKey="total" fill="#6366f1" />
                        </BarChart>
                    )}
                </ResponsiveContainer>
            )}
        </div>
    );
}

export default function GenericDashboard() {
    const { projectId } = useActiveProject();
    const storageKey = `dwh_dashboard_${projectId}`;

    const [entities, setEntities] = useState<DwhEntity[]>([]);
    const [widgets, setWidgets] = useState<Widget[]>([]);

    // form state
    const [fEntity, setFEntity] = useState("");
    const [fGroupBy, setFGroupBy] = useState("");
    const [fFn, setFFn] = useState<Widget["fn"]>("count");
    const [fMeasure, setFMeasure] = useState("");
    const [fChart, setFChart] = useState<Widget["chart"]>("bar");

    useEffect(() => {
        if (!projectId) return;
        dwhClient.listEntities(projectId).then(setEntities).catch(() => setEntities([]));
        try { setWidgets(JSON.parse(localStorage.getItem(storageKey) || "[]")); } catch { setWidgets([]); }
    }, [projectId, storageKey]);

    const persist = useCallback((next: Widget[]) => {
        setWidgets(next);
        localStorage.setItem(storageKey, JSON.stringify(next));
    }, [storageKey]);

    const cols = useMemo(() => entities.find((e) => e.name === fEntity)?.columns ?? [], [entities, fEntity]);

    const addWidget = () => {
        if (!fEntity || !fGroupBy) return;
        const w: Widget = {
            id: `${fEntity}-${Date.now()}`,
            entity: fEntity, groupBy: fGroupBy, fn: fFn,
            measure: fFn === "count" ? undefined : fMeasure || undefined,
            chart: fChart,
        };
        persist([...widgets, w]);
    };

    if (!projectId) {
        return (
            <ContentLayout title="Dashboard">
                <div className="p-8 text-center text-muted-foreground">
                    No project selected. Use the <span className="font-medium text-foreground">project picker</span> at the top to choose one.
                </div>
            </ContentLayout>
        );
    }

    return (
        <ContentLayout title="Dashboard">
            <div className="rounded-xl border p-4 bg-card mb-4">
                <h3 className="font-semibold mb-3">Add widget</h3>
                <div className="flex flex-wrap items-end gap-2">
                    <Select value={fEntity} onValueChange={(v) => { setFEntity(v); setFGroupBy(""); setFMeasure(""); }}>
                        <SelectTrigger className="w-40"><SelectValue placeholder="Entity" /></SelectTrigger>
                        <SelectContent>{entities.map((e) => <SelectItem key={e.id} value={e.name}>{e.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={fGroupBy} onValueChange={setFGroupBy}>
                        <SelectTrigger className="w-40"><SelectValue placeholder="Group by" /></SelectTrigger>
                        <SelectContent>{cols.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={fFn} onValueChange={(v) => setFFn(v as Widget["fn"])}>
                        <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="count">count</SelectItem>
                            <SelectItem value="sum">sum</SelectItem>
                            <SelectItem value="avg">avg</SelectItem>
                        </SelectContent>
                    </Select>
                    {fFn !== "count" && (
                        <Select value={fMeasure} onValueChange={setFMeasure}>
                            <SelectTrigger className="w-40"><SelectValue placeholder="Measure" /></SelectTrigger>
                            <SelectContent>{cols.filter((c) => c.data_type === "integer" || c.data_type === "real").map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                        </Select>
                    )}
                    <Select value={fChart} onValueChange={(v) => setFChart(v as Widget["chart"])}>
                        <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="bar">bar</SelectItem>
                            <SelectItem value="line">line</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={addWidget} disabled={!fEntity || !fGroupBy}><Plus className="h-4 w-4 mr-1" /> Add</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {widgets.map((w) => (
                    <WidgetCard key={w.id} projectId={projectId} widget={w} onRemove={() => persist(widgets.filter((x) => x.id !== w.id))} />
                ))}
            </div>
            {widgets.length === 0 && <p className="text-muted-foreground text-sm mt-4">No widgets yet — add one above.</p>}
        </ContentLayout>
    );
}
