// Form-based schema builder (no SQL required): create entities, add/remove columns, and define
// reference columns (foreign keys). Pairs with the ER playground for visual FK creation.

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { useNotification } from "@/components/helpers/NotificationProvider";
import { dwhClient, truthy } from "@/models/dwh/dwhClient";
import type { DwhDataType, DwhEntity } from "@/models/dwh/types";

const TYPES: DwhDataType[] = ["text", "integer", "real", "boolean", "date", "datetime", "reference"];

interface Props {
    projectId: number;
    entities: DwhEntity[];
    reload: () => void;
}

function AddColumnRow({ entity, entities, reload }: { entity: DwhEntity; entities: DwhEntity[]; reload: () => void }) {
    const { addNotification } = useNotification();
    const [name, setName] = useState("");
    const [type, setType] = useState<DwhDataType>("text");
    const [nullable, setNullable] = useState(true);
    const [unique, setUnique] = useState(false);
    const [refId, setRefId] = useState<string>("");
    const [busy, setBusy] = useState(false);

    const add = async () => {
        if (!name.trim()) return;
        setBusy(true);
        try {
            await dwhClient.addColumn({
                entity_id: entity.id,
                name: name.trim().toLowerCase(),
                data_type: type,
                is_nullable: nullable,
                is_unique: unique,
                ref_entity_id: type === "reference" ? Number(refId) || null : null,
            });
            setName(""); setType("text"); setRefId("");
            reload();
        } catch (e: any) {
            addNotification(`${e?.message ?? e}`, "error");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="flex flex-wrap items-end gap-2 pt-2">
            <div className="grid gap-1">
                <Label className="text-xs">Column</Label>
                <Input className="h-8 w-36" value={name} onChange={(e) => setName(e.target.value)} placeholder="name" />
            </div>
            <div className="grid gap-1">
                <Label className="text-xs">Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as DwhDataType)}>
                    <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {TYPES.map((tp) => <SelectItem key={tp} value={tp}>{tp}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            {type === "reference" && (
                <div className="grid gap-1">
                    <Label className="text-xs">References</Label>
                    <Select value={refId} onValueChange={setRefId}>
                        <SelectTrigger className="h-8 w-36"><SelectValue placeholder="entity" /></SelectTrigger>
                        <SelectContent>
                            {entities.filter((e) => e.id !== entity.id).map((e) =>
                                <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            )}
            <label className="flex items-center gap-1 text-xs">
                <Checkbox checked={nullable} onCheckedChange={(v) => setNullable(!!v)} /> nullable
            </label>
            <label className="flex items-center gap-1 text-xs">
                <Checkbox checked={unique} onCheckedChange={(v) => setUnique(!!v)} /> unique
            </label>
            <Button size="sm" className="h-8" onClick={add} disabled={busy || !name.trim()}>
                <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
        </div>
    );
}

export default function SchemaBuilder({ projectId, entities, reload }: Props) {
    const { addNotification } = useNotification();
    const [newName, setNewName] = useState("");
    const [newDisplay, setNewDisplay] = useState("");
    const [busy, setBusy] = useState(false);

    const createEntity = async () => {
        if (!newName.trim()) return;
        setBusy(true);
        try {
            await dwhClient.createEntity({ project_id: projectId, name: newName.trim().toLowerCase(), display_name: newDisplay || undefined });
            setNewName(""); setNewDisplay("");
            reload();
        } catch (e: any) {
            addNotification(`${e?.message ?? e}`, "error");
        } finally {
            setBusy(false);
        }
    };

    const removeEntity = async (id: number) => {
        try { await dwhClient.deleteEntity(id); reload(); }
        catch (e: any) { addNotification(`${e?.message ?? e}`, "error"); }
    };
    const removeColumn = async (id: number) => {
        try { await dwhClient.deleteColumn(id); reload(); }
        catch (e: any) { addNotification(`${e?.message ?? e}`, "error"); }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="rounded-xl border p-4 bg-card">
                <h3 className="font-semibold mb-3">New entity</h3>
                <div className="flex flex-wrap items-end gap-2">
                    <div className="grid gap-1">
                        <Label className="text-xs">Name</Label>
                        <Input className="h-9 w-48" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. invoices" />
                    </div>
                    <div className="grid gap-1">
                        <Label className="text-xs">Display name</Label>
                        <Input className="h-9 w-48" value={newDisplay} onChange={(e) => setNewDisplay(e.target.value)} placeholder="optional" />
                    </div>
                    <Button className="h-9" onClick={createEntity} disabled={busy || !newName.trim()}>
                        <Plus className="h-4 w-4 mr-1" /> Create
                    </Button>
                </div>
            </div>

            {entities.map((e) => (
                <div key={e.id} className="rounded-xl border p-4 bg-card">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{e.display_name || e.name} <span className="text-xs text-muted-foreground">({e.physical_table})</span></h3>
                        {truthy(e.is_managed) && (
                            <Button variant="ghost" size="icon" className="text-red-500" onClick={() => removeEntity(e.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {e.columns.map((c) => (
                            <span key={c.id} className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs">
                                <span className="font-medium">{c.name}</span>
                                <span className="text-muted-foreground">{c.data_type}{c.ref_entity_id ? "→" + (entities.find((x) => x.id === c.ref_entity_id)?.name ?? "?") : ""}</span>
                                {!truthy(c.is_system) && (
                                    <button className="text-red-500" onClick={() => removeColumn(c.id)}>×</button>
                                )}
                            </span>
                        ))}
                    </div>
                    <AddColumnRow entity={e} entities={entities} reload={reload} />
                </div>
            ))}
            {entities.length === 0 && <p className="text-muted-foreground text-sm">No entities yet — create one above.</p>}
        </div>
    );
}
