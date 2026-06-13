// New-project flow: name the project, then either reuse an existing schema you can write, or create
// a NEW schema — by form (tables + columns + types) or by writing CREATE TABLE SQL (parsed server
// side). On success the new project is selected so the app switches to it.

import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ButtonLoading } from "@/components/helpers/buttons/ButtonLoading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNotification } from "@/components/helpers/NotificationProvider";
import { RoleManagementsService, type RoleManagementListResponse } from "@/models/api";
import { useRoleStore } from "@/utils/roleManagementState";
import { dwhClient } from "@/models/dwh/dwhClient";
import type { DwhDataType, DwhSchema } from "@/models/dwh/types";

const TYPES: DwhDataType[] = ["text", "integer", "real", "boolean", "date", "datetime", "reference"];

interface FormColumn { name: string; data_type: DwhDataType; ref_table?: string }
interface FormTable { name: string; columns: FormColumn[] }

interface Props { onClose: () => void; onRefresh: () => void }

export default function AddProjektDialogContent({ onClose, onRefresh }: Props) {
    const { t } = useTranslation();
    const { addNotification } = useNotification();
    const setRoles = useRoleStore((s) => s.setRoles);
    const setSelectedRoles = useRoleStore((s) => s.setSelectedRoles);

    const [projectName, setProjectName] = useState("");
    const [mode, setMode] = useState<"existing" | "new">("new");
    const [schemas, setSchemas] = useState<DwhSchema[]>([]);
    const [existingSchemaId, setExistingSchemaId] = useState<string>("");

    const [schemaName, setSchemaName] = useState("");
    const [authoring, setAuthoring] = useState<"form" | "sql">("form");
    const [tables, setTables] = useState<FormTable[]>([{ name: "", columns: [{ name: "", data_type: "text" }] }]);
    const [sql, setSql] = useState("CREATE TABLE items (\n  title TEXT NOT NULL,\n  qty INTEGER\n);");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        dwhClient.listSchemas().then((s) => {
            const writable = s.filter((x) => x.canWrite);
            setSchemas(writable);
            if (writable.length === 0) setMode("new");
        }).catch(() => setSchemas([]));
    }, []);

    const addTable = () => setTables((t) => [...t, { name: "", columns: [{ name: "", data_type: "text" }] }]);
    const removeTable = (i: number) => setTables((t) => t.filter((_, idx) => idx !== i));
    const setTableName = (i: number, name: string) => setTables((t) => t.map((tb, idx) => idx === i ? { ...tb, name } : tb));
    const addColumn = (ti: number) => setTables((t) => t.map((tb, idx) => idx === ti ? { ...tb, columns: [...tb.columns, { name: "", data_type: "text" }] } : tb));
    const setColumn = (ti: number, ci: number, patch: Partial<FormColumn>) =>
        setTables((t) => t.map((tb, idx) => idx === ti ? { ...tb, columns: tb.columns.map((c, cIdx) => cIdx === ci ? { ...c, ...patch } : c) } : tb));
    const removeColumn = (ti: number, ci: number) => setTables((t) => t.map((tb, idx) => idx === ti ? { ...tb, columns: tb.columns.filter((_, cIdx) => cIdx !== ci) } : tb));

    const save = async () => {
        if (!projectName.trim()) { addNotification("Project name is required", "error"); return; }
        setSaving(true);
        try {
            const body: any = { name: projectName.trim() };
            if (mode === "existing") {
                if (!existingSchemaId) { addNotification("Pick a schema", "error"); setSaving(false); return; }
                body.schema_id = Number(existingSchemaId);
            } else if (authoring === "sql") {
                body.new_schema = { name: schemaName.trim() || projectName.trim(), sql };
            } else {
                const entities = tables
                    .filter((tb) => tb.name.trim())
                    .map((tb) => ({
                        name: tb.name.trim().toLowerCase(),
                        columns: tb.columns.filter((c) => c.name.trim()).map((c) => ({
                            name: c.name.trim().toLowerCase(), data_type: c.data_type,
                            ref_table: c.data_type === "reference" ? c.ref_table : undefined,
                        })),
                    }));
                if (entities.length === 0) { addNotification("Add at least one table", "error"); setSaving(false); return; }
                body.new_schema = { name: schemaName.trim() || projectName.trim(), entities };
            }

            const created = await dwhClient.createProject(body);
            addNotification("Project created", "success");

            const rolesResp = await RoleManagementsService.getRoleManagements();
            const items = (rolesResp as RoleManagementListResponse).items || [];
            setRoles(items);
            const mine = items.find((r: any) => r.project_id === created.id);
            if (mine) setSelectedRoles([mine]);

            onClose();
            onRefresh();
        } catch (e: any) {
            addNotification(`Failed to create project: ${e?.message ?? e}`, "error");
        } finally {
            setSaving(false);
        }
    };

    const tableNames = tables.map((tb) => tb.name.trim().toLowerCase()).filter(Boolean);

    return (
        <DialogContent className="sm:max-w-[640px]">
            <DialogHeader><DialogTitle>{t("project_title", { defaultValue: "New project" })}</DialogTitle></DialogHeader>

            <div className="grid gap-4 max-h-[70vh] overflow-y-auto pr-1">
                <div className="grid gap-1.5">
                    <Label>Project name</Label>
                    <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="My project" />
                </div>

                <div className="flex gap-2">
                    <Button variant={mode === "existing" ? "default" : "outline"} size="sm" disabled={schemas.length === 0} onClick={() => setMode("existing")}>Use existing schema</Button>
                    <Button variant={mode === "new" ? "default" : "outline"} size="sm" onClick={() => setMode("new")}>Create new schema</Button>
                </div>

                {mode === "existing" ? (
                    <div className="grid gap-1.5">
                        <Label>Schema (you have write access)</Label>
                        <Select value={existingSchemaId} onValueChange={setExistingSchemaId}>
                            <SelectTrigger><SelectValue placeholder="Select a schema" /></SelectTrigger>
                            <SelectContent>{schemas.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">Projects sharing a schema can be viewed together (compiled) in the dashboard.</p>
                    </div>
                ) : (
                    <div className="grid gap-3 rounded-lg border p-3">
                        <div className="grid gap-1.5">
                            <Label>Schema name</Label>
                            <Input value={schemaName} onChange={(e) => setSchemaName(e.target.value)} placeholder="defaults to project name" />
                        </div>
                        <Tabs value={authoring} onValueChange={(v) => setAuthoring(v as "form" | "sql")}>
                            <TabsList>
                                <TabsTrigger value="form">Form</TabsTrigger>
                                <TabsTrigger value="sql">SQL</TabsTrigger>
                            </TabsList>

                            <TabsContent value="form" className="mt-3 grid gap-3">
                                {tables.map((tb, ti) => (
                                    <div key={ti} className="rounded-md border p-2 grid gap-2">
                                        <div className="flex items-center gap-2">
                                            <Input className="h-8 w-48" value={tb.name} onChange={(e) => setTableName(ti, e.target.value)} placeholder="table name" />
                                            {tables.length > 1 && <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => removeTable(ti)}><Trash2 className="h-4 w-4" /></Button>}
                                        </div>
                                        {tb.columns.map((c, ci) => (
                                            <div key={ci} className="flex items-center gap-2 pl-2">
                                                <Input className="h-8 w-40" value={c.name} onChange={(e) => setColumn(ti, ci, { name: e.target.value })} placeholder="column" />
                                                <Select value={c.data_type} onValueChange={(v) => setColumn(ti, ci, { data_type: v as DwhDataType })}>
                                                    <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                                                    <SelectContent>{TYPES.map((tp) => <SelectItem key={tp} value={tp}>{tp}</SelectItem>)}</SelectContent>
                                                </Select>
                                                {c.data_type === "reference" && (
                                                    <Select value={c.ref_table ?? ""} onValueChange={(v) => setColumn(ti, ci, { ref_table: v })}>
                                                        <SelectTrigger className="h-8 w-36"><SelectValue placeholder="→ table" /></SelectTrigger>
                                                        <SelectContent>{tableNames.filter((n) => n !== tb.name.trim().toLowerCase()).map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                                                    </Select>
                                                )}
                                                {tb.columns.length > 1 && <button className="text-red-500 text-sm" onClick={() => removeColumn(ti, ci)}>×</button>}
                                            </div>
                                        ))}
                                        <Button variant="ghost" size="sm" className="justify-start h-7" onClick={() => addColumn(ti)}><Plus className="h-4 w-4 mr-1" /> column</Button>
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" onClick={addTable}><Plus className="h-4 w-4 mr-1" /> Add table</Button>
                            </TabsContent>

                            <TabsContent value="sql" className="mt-3">
                                <div className="rounded-md border overflow-hidden">
                                    <Editor height="220px" defaultLanguage="sql" value={sql} onChange={(v) => setSql(v ?? "")} options={{ minimap: { enabled: false }, fontSize: 13 }} />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Supports CREATE TABLE with TEXT/INTEGER/REAL/BOOLEAN/DATE/TIMESTAMP and REFERENCES other(id).</p>
                            </TabsContent>
                        </Tabs>
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={onClose} disabled={saving}>{t("button.cancel", { defaultValue: "Cancel" })}</Button>
                <ButtonLoading isLoading={saving} onClick={save}>{t("button.save", { defaultValue: "Create" })}</ButtonLoading>
            </div>
        </DialogContent>
    );
}
