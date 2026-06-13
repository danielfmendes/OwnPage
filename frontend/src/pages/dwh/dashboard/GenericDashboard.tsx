// Schema-level dashboard with draggable + resizable panels. Widgets aggregate across the selected
// projects (compiled). Config (widgets + grid layout) is saved server-side per schema, shared by all
// its projects. Edits require write access to the schema.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import GridLayout, { WidthProvider, type Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ContentLayout from "@/components/layout/ContentLayout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, LayoutGrid, GripVertical } from "lucide-react";
import { useActiveSchema } from "@/utils/useActiveSchema";
import { dwhClient } from "@/models/dwh/dwhClient";
import type { DwhEntity } from "@/models/dwh/types";

const ReactGridLayout = WidthProvider(GridLayout);

interface Widget {
    id: string;
    entity: string;
    groupBy: string;
    fn: "count" | "sum" | "avg";
    measure?: string;
    chart: "bar" | "line";
}

const DEFAULT_W = 6;
const DEFAULT_H = 9;
// Place a new panel in the next 2-per-row slot so panels sit side by side (not stacked).
const slotLayoutItem = (id: string, index: number): Layout => ({
    i: id, x: (index % 2) * DEFAULT_W, y: Math.floor(index / 2) * DEFAULT_H, w: DEFAULT_W, h: DEFAULT_H, minW: 3, minH: 5,
});
const defaultLayoutItem = (id: string): Layout => slotLayoutItem(id, 0);

function WidgetCard({ schemaId, projectIds, widget, onRemove, canWrite }: { schemaId: number; projectIds: number[]; widget: Widget; onRemove: () => void; canWrite: boolean }) {
    const [data, setData] = useState<Array<{ value: string; total: number }>>([]);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        dwhClient.aggregate(widget.entity, schemaId, projectIds, { groupBy: widget.groupBy, fn: widget.fn, measure: widget.measure })
            .then((rows) => setData(rows.map((r) => ({ value: String(r.value), total: Number(r.total) }))))
            .catch((e: any) => setError(e?.message ?? String(e)));
    }, [schemaId, projectIds, widget]);

    return (
        <div className="h-full flex flex-col rounded-xl border bg-card overflow-hidden">
            <div className="drag-handle flex items-center justify-between px-3 py-2 border-b cursor-move bg-muted/30">
                <div className="flex items-center gap-1 min-w-0">
                    <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                    <h3 className="font-semibold text-sm truncate">{widget.fn}{widget.measure ? `(${widget.measure})` : ""} of {widget.entity} by {widget.groupBy}</h3>
                </div>
                {canWrite && <Button variant="ghost" size="icon" className="no-drag text-red-500 h-6 w-6 shrink-0" onClick={onRemove}><Trash2 className="h-4 w-4" /></Button>}
            </div>
            <div className="flex-1 min-h-0 p-2">
                {error ? <p className="text-sm text-red-600">{error}</p> : (
                    <ResponsiveContainer width="100%" height="100%">
                        {widget.chart === "line" ? (
                            <LineChart data={data}><XAxis dataKey="value" fontSize={11} /><YAxis fontSize={11} /><Tooltip /><Line type="monotone" dataKey="total" stroke="#6366f1" /></LineChart>
                        ) : (
                            <BarChart data={data}><XAxis dataKey="value" fontSize={11} /><YAxis fontSize={11} /><Tooltip /><Bar dataKey="total" fill="#6366f1" /></BarChart>
                        )}
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}

export default function GenericDashboard() {
    const { schemaId, schemaName, projectIds, canWrite } = useActiveSchema();
    const [entities, setEntities] = useState<DwhEntity[]>([]);
    const [widgets, setWidgets] = useState<Widget[]>([]);
    const [layout, setLayout] = useState<Layout[]>([]);
    const loaded = useRef(false);

    const [fEntity, setFEntity] = useState("");
    const [fGroupBy, setFGroupBy] = useState("");
    const [fFn, setFFn] = useState<Widget["fn"]>("count");
    const [fMeasure, setFMeasure] = useState("");
    const [fChart, setFChart] = useState<Widget["chart"]>("bar");

    useEffect(() => {
        if (!schemaId) return;
        loaded.current = false;
        dwhClient.listEntities(schemaId).then(setEntities).catch(() => setEntities([]));
        dwhClient.getDashboard(schemaId)
            .then((d) => {
                const cfg = d.config || {};
                setWidgets(Array.isArray(cfg.widgets) ? cfg.widgets : []);
                setLayout(Array.isArray(cfg.layout) ? cfg.layout : []);
            })
            .catch(() => { setWidgets([]); setLayout([]); })
            .finally(() => { loaded.current = true; });
    }, [schemaId]);

    // Persist to the server whenever widgets/layout change (after the initial load).
    const persist = useCallback((nextWidgets: Widget[], nextLayout: Layout[]) => {
        setWidgets(nextWidgets);
        setLayout(nextLayout);
        if (schemaId && canWrite) dwhClient.saveDashboard(schemaId, { widgets: nextWidgets, layout: nextLayout }).catch(() => { });
    }, [schemaId, canWrite]);

    const effectiveLayout = useMemo<Layout[]>(() => {
        const byId = new Map(layout.map((l) => [l.i, l]));
        return widgets.map((w) => byId.get(w.id) ?? defaultLayoutItem(w.id));
    }, [widgets, layout]);

    const cols = useMemo(() => entities.find((e) => e.name === fEntity)?.columns ?? [], [entities, fEntity]);

    const addWidget = () => {
        if (!fEntity || !fGroupBy) return;
        const id = `${fEntity}-${Date.now()}`;
        persist(
            [...widgets, { id, entity: fEntity, groupBy: fGroupBy, fn: fFn, measure: fFn === "count" ? undefined : fMeasure || undefined, chart: fChart }],
            [...effectiveLayout, slotLayoutItem(id, effectiveLayout.length)],
        );
    };
    const removeWidget = (id: string) => persist(widgets.filter((w) => w.id !== id), effectiveLayout.filter((l) => l.i !== id));
    const tidy = () => persist(widgets, widgets.map((w, i) => slotLayoutItem(w.id, i)));

    const addDefaultPanels = () => {
        const groupable = (e: DwhEntity) =>
            e.columns.find((c) => !c.is_system && ["text", "boolean", "date"].includes(c.data_type))
            ?? e.columns.find((c) => !c.is_system && c.data_type === "integer");
        const next: Widget[] = [];
        const nextLayout: Layout[] = [];
        entities.slice(0, 6).forEach((e, i) => {
            const g = groupable(e);
            if (!g) return;
            const id = `${e.name}-default-${i}`;
            next.push({ id, entity: e.name, groupBy: g.name, fn: "count", chart: "bar" });
            nextLayout.push({ i: id, x: (i % 2) * DEFAULT_W, y: Math.floor(i / 2) * DEFAULT_H, w: DEFAULT_W, h: DEFAULT_H, minW: 3, minH: 5 });
        });
        persist(next, nextLayout);
    };

    if (!schemaId) {
        return <ContentLayout title="Dashboard"><div className="p-8 text-center text-muted-foreground">No project selected. Use the <span className="font-medium text-foreground">project picker</span> at the top.</div></ContentLayout>;
    }

    return (
        <ContentLayout title={schemaName ? `Dashboard · ${schemaName}` : "Dashboard"}>
            {canWrite && (
                <div className="rounded-xl border p-4 bg-card mb-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">Add widget</h3>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={tidy} disabled={widgets.length === 0}><LayoutGrid className="h-4 w-4 mr-1" /> Tidy</Button>
                            <Button variant="outline" size="sm" onClick={addDefaultPanels}>Default panels</Button>
                        </div>
                    </div>
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
                            <SelectContent><SelectItem value="count">count</SelectItem><SelectItem value="sum">sum</SelectItem><SelectItem value="avg">avg</SelectItem></SelectContent>
                        </Select>
                        {fFn !== "count" && (
                            <Select value={fMeasure} onValueChange={setFMeasure}>
                                <SelectTrigger className="w-40"><SelectValue placeholder="Measure" /></SelectTrigger>
                                <SelectContent>{cols.filter((c) => c.data_type === "integer" || c.data_type === "real").map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                            </Select>
                        )}
                        <Select value={fChart} onValueChange={(v) => setFChart(v as Widget["chart"])}>
                            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="bar">bar</SelectItem><SelectItem value="line">line</SelectItem></SelectContent>
                        </Select>
                        <Button onClick={addWidget} disabled={!fEntity || !fGroupBy}><Plus className="h-4 w-4 mr-1" /> Add</Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Drag a panel by its title bar to move it; drag a corner to resize. Saved to the schema for everyone.</p>
                </div>
            )}

            {widgets.length === 0 ? (
                <p className="text-muted-foreground text-sm mt-4">No widgets yet{canWrite ? " — add one above or click Default panels." : "."}</p>
            ) : (
                <ReactGridLayout className="layout" layout={effectiveLayout} cols={12} rowHeight={30} isDraggable={canWrite} isResizable={canWrite} draggableHandle=".drag-handle" draggableCancel=".no-drag" onLayoutChange={(l) => { if (loaded.current) persist(widgets, l); }}>
                    {widgets.map((w) => (
                        <div key={w.id}><WidgetCard schemaId={schemaId} projectIds={projectIds} widget={w} canWrite={canWrite} onRemove={() => removeWidget(w.id)} /></div>
                    ))}
                </ReactGridLayout>
            )}
        </ContentLayout>
    );
}
