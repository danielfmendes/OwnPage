// Schema-level dashboard with View / Edit modes. View mode is a clean, static board. Edit mode (for
// writers) shows the add-widget bar, drag/resize, per-panel chart-type switch and size presets.
// Widgets aggregate across the selected projects (compiled); config is saved server-side per schema.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import GridLayout, { WidthProvider, type Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import {
    Area, AreaChart, Bar, BarChart, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import ContentLayout from "@/components/layout/ContentLayout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, LayoutGrid, Pencil, Check } from "lucide-react";
import { useActiveSchema } from "@/utils/useActiveSchema";
import { dwhClient } from "@/models/dwh/dwhClient";
import type { DwhEntity } from "@/models/dwh/types";

const ReactGridLayout = WidthProvider(GridLayout);

type ChartType = "bar" | "line" | "area" | "pie";

interface Widget {
    id: string;
    entity: string;
    groupBy: string;
    fn: "count" | "sum" | "avg";
    measure?: string;
    chart: ChartType;
}

const DEFAULT_W = 6;
const DEFAULT_H = 9;
const PIE_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#a855f7", "#ec4899", "#84cc16"];

const slotLayoutItem = (id: string, index: number): Layout => ({
    i: id, x: (index % 2) * DEFAULT_W, y: Math.floor(index / 2) * DEFAULT_H, w: DEFAULT_W, h: DEFAULT_H, minW: 3, minH: 5,
});

// Size presets: 1 col / 2 cols × 1 row / 2 rows.
const SIZES: Record<string, { w: number; h: number; label: string }> = {
    "1x1": { w: 6, h: 9, label: "1×1" },
    "1x2": { w: 6, h: 18, label: "1 col · 2 rows" },
    "2x1": { w: 12, h: 9, label: "2 cols · 1 row" },
    "2x2": { w: 12, h: 18, label: "2×2" },
};

function Chart({ widget, data }: { widget: Widget; data: Array<{ value: string; total: number }> }) {
    if (widget.chart === "line") {
        return <LineChart data={data}><XAxis dataKey="value" fontSize={11} /><YAxis fontSize={11} /><Tooltip /><Line type="monotone" dataKey="total" stroke="#6366f1" /></LineChart>;
    }
    if (widget.chart === "area") {
        return <AreaChart data={data}><XAxis dataKey="value" fontSize={11} /><YAxis fontSize={11} /><Tooltip /><Area type="monotone" dataKey="total" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} /></AreaChart>;
    }
    if (widget.chart === "pie") {
        return <PieChart><Tooltip /><Pie data={data} dataKey="total" nameKey="value" outerRadius="80%" label>{data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}</Pie></PieChart>;
    }
    return <BarChart data={data}><XAxis dataKey="value" fontSize={11} /><YAxis fontSize={11} /><Tooltip /><Bar dataKey="total" fill="#6366f1" /></BarChart>;
}

function WidgetCard({ schemaId, projectIds, widget, editMode, onRemove, onChangeChart, onSize }: {
    schemaId: number; projectIds: number[]; widget: Widget; editMode: boolean;
    onRemove: () => void; onChangeChart: (c: ChartType) => void; onSize: (key: string) => void;
}) {
    const [data, setData] = useState<Array<{ value: string; total: number }>>([]);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        dwhClient.aggregate(widget.entity, schemaId, projectIds, { groupBy: widget.groupBy, fn: widget.fn, measure: widget.measure })
            .then((rows) => setData(rows.map((r) => ({ value: String(r.value), total: Number(r.total) }))))
            .catch((e: any) => setError(e?.message ?? String(e)));
    }, [schemaId, projectIds, widget]);

    return (
        <div className="h-full flex flex-col rounded-xl border bg-card overflow-hidden">
            <div className={`flex items-center justify-between px-3 py-2 border-b bg-muted/30 ${editMode ? "drag-handle cursor-move" : ""}`}>
                <h3 className="font-semibold text-sm truncate">{widget.fn}{widget.measure ? `(${widget.measure})` : ""} of {widget.entity} by {widget.groupBy}</h3>
                {editMode && (
                    <div className="no-drag flex items-center gap-1 shrink-0">
                        <Select value={widget.chart} onValueChange={(v) => onChangeChart(v as ChartType)}>
                            <SelectTrigger className="h-7 w-24 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bar">bar</SelectItem>
                                <SelectItem value="line">line</SelectItem>
                                <SelectItem value="area">area</SelectItem>
                                <SelectItem value="pie">pie</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value="" onValueChange={onSize}>
                            <SelectTrigger className="h-7 w-12 text-xs"><LayoutGrid className="h-3.5 w-3.5" /></SelectTrigger>
                            <SelectContent>{Object.entries(SIZES).map(([k, s]) => <SelectItem key={k} value={k}>{s.label}</SelectItem>)}</SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" className="text-red-500 h-6 w-6" onClick={onRemove}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                )}
            </div>
            <div className="flex-1 min-h-0 p-2">
                {error ? <p className="text-sm text-red-600">{error}</p> : (
                    <ResponsiveContainer width="100%" height="100%"><Chart widget={widget} data={data} /></ResponsiveContainer>
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
    const [editMode, setEditMode] = useState(false);
    const loaded = useRef(false);

    const [fEntity, setFEntity] = useState("");
    const [fGroupBy, setFGroupBy] = useState("");
    const [fFn, setFFn] = useState<Widget["fn"]>("count");
    const [fMeasure, setFMeasure] = useState("");
    const [fChart, setFChart] = useState<ChartType>("bar");

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

    const persist = useCallback((nextWidgets: Widget[], nextLayout: Layout[]) => {
        setWidgets(nextWidgets);
        setLayout(nextLayout);
        if (schemaId && canWrite) dwhClient.saveDashboard(schemaId, { widgets: nextWidgets, layout: nextLayout }).catch(() => { });
    }, [schemaId, canWrite]);

    const effectiveLayout = useMemo<Layout[]>(() => {
        const byId = new Map(layout.map((l) => [l.i, l]));
        return widgets.map((w, i) => byId.get(w.id) ?? slotLayoutItem(w.id, i));
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
    const changeChart = (id: string, chart: ChartType) => persist(widgets.map((w) => w.id === id ? { ...w, chart } : w), effectiveLayout);
    const setSize = (id: string, key: string) => {
        const s = SIZES[key]; if (!s) return;
        persist(widgets, effectiveLayout.map((l) => l.i === id ? { ...l, w: s.w, h: s.h } : l));
    };

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
            nextLayout.push(slotLayoutItem(id, i));
        });
        persist(next, nextLayout);
    };

    if (!schemaId) {
        return <ContentLayout title="Dashboard"><div className="p-8 text-center text-muted-foreground">No project selected. Use the <span className="font-medium text-foreground">project picker</span> at the top.</div></ContentLayout>;
    }

    const editing = editMode && canWrite;

    return (
        <ContentLayout title={schemaName ? `Dashboard · ${schemaName}` : "Dashboard"}>
            <div className="flex items-center justify-end mb-3">
                {canWrite && (
                    <Button variant={editing ? "default" : "outline"} size="sm" onClick={() => setEditMode((v) => !v)}>
                        {editing ? <><Check className="h-4 w-4 mr-1" /> Done</> : <><Pencil className="h-4 w-4 mr-1" /> Edit dashboard</>}
                    </Button>
                )}
            </div>

            {editing && (
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
                        <Select value={fChart} onValueChange={(v) => setFChart(v as ChartType)}>
                            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="bar">bar</SelectItem><SelectItem value="line">line</SelectItem><SelectItem value="area">area</SelectItem><SelectItem value="pie">pie</SelectItem></SelectContent>
                        </Select>
                        <Button onClick={addWidget} disabled={!fEntity || !fGroupBy}><Plus className="h-4 w-4 mr-1" /> Add</Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Drag a panel by its title bar to move it; drag a corner — or use the size menu — to resize. Saved to the schema.</p>
                </div>
            )}

            {widgets.length === 0 ? (
                <p className="text-muted-foreground text-sm mt-4">No widgets yet{canWrite ? " — click Edit dashboard to add some." : "."}</p>
            ) : (
                <ReactGridLayout className="layout" layout={effectiveLayout} cols={12} rowHeight={30} isDraggable={editing} isResizable={editing} draggableHandle=".drag-handle" draggableCancel=".no-drag" onLayoutChange={(l) => { if (loaded.current && editing) persist(widgets, l); }}>
                    {widgets.map((w) => (
                        <div key={w.id}>
                            <WidgetCard schemaId={schemaId} projectIds={projectIds} widget={w} editMode={editing}
                                onRemove={() => removeWidget(w.id)} onChangeChart={(c) => changeChart(w.id, c)} onSize={(k) => setSize(w.id, k)} />
                        </div>
                    ))}
                </ReactGridLayout>
            )}
        </ContentLayout>
    );
}
