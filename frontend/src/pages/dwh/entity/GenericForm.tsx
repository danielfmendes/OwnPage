// Auto-generated create/edit form for a user-defined entity. Builds one input per catalog column,
// keyed off its data_type. Used as both the "add" dialog and the row-edit dialog of the generic
// data page.

import { useState } from "react";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ButtonLoading } from "@/components/helpers/buttons/ButtonLoading";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useNotification } from "@/components/helpers/NotificationProvider";
import type { DwhColumn, DwhRow } from "@/models/dwh/types";
import { dwhClient, editableColumns, truthy } from "@/models/dwh/dwhClient";

interface GenericFormProps {
    entityName: string;
    projectId: number;
    columns: DwhColumn[];
    mode: "create" | "edit";
    initial?: DwhRow;
    onClose: () => void;
    onSaved: () => void;
}

function inputTypeFor(dt: DwhColumn["data_type"]): string {
    switch (dt) {
        case "integer":
        case "real":
        case "reference": return "number";
        case "date": return "date";
        case "datetime": return "datetime-local";
        default: return "text";
    }
}

export default function GenericForm({ entityName, projectId, columns, mode, initial, onClose, onSaved }: GenericFormProps) {
    const { t } = useTranslation();
    const { addNotification } = useNotification();
    const fields = editableColumns(columns);

    const [values, setValues] = useState<DwhRow>(() => {
        const seed: DwhRow = {};
        for (const c of fields) {
            const v = initial?.[c.name];
            seed[c.name] = c.data_type === "boolean" ? truthy(v) : (v ?? "");
        }
        return seed;
    });
    const [saving, setSaving] = useState(false);

    const setField = (name: string, value: any) => setValues((prev) => ({ ...prev, [name]: value }));

    const submit = async () => {
        setSaving(true);
        try {
            // Coerce values to their column type; drop empty optionals.
            const payload: DwhRow = {};
            for (const c of fields) {
                const raw = values[c.name];
                if (c.data_type === "boolean") {
                    payload[c.name] = !!raw;
                } else if (raw === "" || raw === null || raw === undefined) {
                    // leave unset so DB default / NULL applies
                } else if (c.data_type === "integer" || c.data_type === "real" || c.data_type === "reference") {
                    payload[c.name] = Number(raw);
                } else {
                    payload[c.name] = raw;
                }
            }
            if (mode === "edit") {
                payload.id = initial?.id;
                await dwhClient.updateRow(entityName, projectId, payload);
                addNotification(t("messages.updated", { defaultValue: "Updated" }), "success");
            } else {
                await dwhClient.createRow(entityName, projectId, payload);
                addNotification(t("messages.created", { defaultValue: "Created" }), "success");
            }
            onSaved();
            onClose();
        } catch (e: any) {
            addNotification(`${e?.message ?? e}`, "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle>
                    {mode === "edit" ? t("button.edit", { defaultValue: "Edit" }) : t("button.add", { defaultValue: "Add" })}
                    {" "}{entityName}
                </DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-2 max-h-[60vh] overflow-y-auto">
                {fields.map((c) => (
                    <div key={c.id} className="grid gap-1.5">
                        <Label htmlFor={c.name} className="text-sm font-medium">
                            {c.display_name || c.name}
                            {c.data_type === "reference" && <span className="text-muted-foreground"> (id)</span>}
                        </Label>
                        {c.data_type === "boolean" ? (
                            <Switch
                                id={c.name}
                                checked={!!values[c.name]}
                                onCheckedChange={(v) => setField(c.name, v)}
                            />
                        ) : (
                            <Input
                                id={c.name}
                                type={inputTypeFor(c.data_type)}
                                value={values[c.name] ?? ""}
                                onChange={(e) => setField(c.name, e.target.value)}
                            />
                        )}
                    </div>
                ))}
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={onClose} disabled={saving}>
                    {t("button.cancel", { defaultValue: "Cancel" })}
                </Button>
                <ButtonLoading isLoading={saving} onClick={submit}>
                    {t("button.save", { defaultValue: "Save" })}
                </ButtonLoading>
            </DialogFooter>
        </DialogContent>
    );
}
