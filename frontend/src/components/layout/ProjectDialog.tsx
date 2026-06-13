import { useMemo, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash, X, Plus } from "lucide-react";
import type { RoleManagementWithName } from "@/models/api";
import { useRoleStore } from "@/utils/roleManagementState";
import { useTranslation } from "react-i18next";

interface Props {
    onClose: () => void;
    onCreateNew?: () => void;
}

export function ProjectDialog({ onClose, onCreateNew }: Props) {
    const { t } = useTranslation();
    const rawProjects: RoleManagementWithName[] = useRoleStore((state) => state.roles);
    const setSelectedStore = useRoleStore((state) => state.setSelectedRoles);

    const projects = useMemo(() => {
        const rolePriority: Record<string, number> = { creator: 3, admin: 2, user: 1, viewer: 0 };
        return Array.from(
            rawProjects.reduce((acc, p) => {
                if (!p.project_id) return acc;
                const existing = acc.get(p.project_id);
                if (!existing || (rolePriority[p.role?.toLowerCase() || ""] || 0) > (rolePriority[existing.role?.toLowerCase() || ""] || 0)) {
                    acc.set(p.project_id, { ...p });
                }
                return acc;
            }, new Map<number, RoleManagementWithName>()).values()
        );
    }, [rawProjects]);

    const rawSelected = useRoleStore((state) => state.selectedRoles);

    // Derive initial unique selected projects matching the filtered `projects` list
    const initialSelected = useMemo(() => {
        const selectedIds = new Set(rawSelected.map(r => r.project_id));
        return projects.filter(p => selectedIds.has(p.project_id));
    }, [rawSelected, projects]);

    const [selected, setSelected] = useState<RoleManagementWithName[]>(initialSelected);

    const isSelected = (project: RoleManagementWithName) =>
        selected.some((p) => p.project_id === project.project_id);

    // Only projects sharing ONE schema can be selected together (so their data compiles). Picking a
    // project from a different schema switches the whole selection to that schema.
    const schemaOf = (p: RoleManagementWithName) => (p as any).schema_id ?? null;
    const currentSchema = selected.length ? schemaOf(selected[0]) : null;

    const toggleSelection = (project: RoleManagementWithName) => {
        const ps = schemaOf(project);
        if (isSelected(project)) {
            setSelected((prev) => prev.filter((p) => p.project_id !== project.project_id));
        } else if (currentSchema == null || ps === currentSchema) {
            setSelected((prev) => [...prev, project]);
        } else {
            setSelected([project]); // different schema → switch
        }
    };

    const selectAll = () => {
        const sch = selected.length ? currentSchema : (projects[0] ? schemaOf(projects[0]) : null);
        if (sch == null) { setSelected(projects.slice(0, 1)); return; }
        setSelected(projects.filter((p) => schemaOf(p) === sch));
    };

    // A project is locked when a selection from a DIFFERENT schema exists (can't combine schemas).
    const isLocked = (project: RoleManagementWithName) =>
        currentSchema != null && schemaOf(project) !== currentSchema;

    // Group projects by schema for clear sectioning.
    const groups = useMemo(() => {
        const m = new Map<string, { label: string; items: RoleManagementWithName[] }>();
        for (const p of projects) {
            const key = String(schemaOf(p) ?? "none");
            const label = (p as any).schema_name ?? "No schema";
            if (!m.has(key)) m.set(key, { label, items: [] });
            m.get(key)!.items.push(p);
        }
        return Array.from(m.values());
    }, [projects]);
    const deselectAll = () => setSelected([]);
    const removeSelection = (project: RoleManagementWithName) =>
        setSelected((prev) => prev.filter((p) => p.project_id !== project.project_id));

    const handleApply = () => {
        setSelectedStore(selected);
        onClose();
    };

    const clearSelection = () => {
        setSelected([]);
        setSelectedStore([]);
        onClose();
    };

    return (
        <div className="space-y-4">
            <DialogHeader>
                <DialogTitle>{t("projectDialog.title")}</DialogTitle>
                <DialogDescription>{t("projectDialog.description")}</DialogDescription>
            </DialogHeader>

            {onCreateNew && (
                <Button variant="outline" className="w-full flex items-center gap-2" onClick={onCreateNew}>
                    <Plus className="w-4 h-4" />
                    {t("button.create_project", { defaultValue: "Create new project" })}
                </Button>
            )}

            <Accordion type="single" collapsible className="w-full space-y-4">
                <AccordionItem value="refine">
                    <AccordionTrigger>{t("projectDialog.refine")}</AccordionTrigger>
                    <AccordionContent>
                        <div className="flex justify-end mb-2">
                            <Button variant="ghost" size="sm" onClick={selectAll}>
                                {t("button.select_all")}
                            </Button>
                        </div>
                        {currentSchema != null && (
                            <p className="text-xs text-muted-foreground mb-2">
                                Only projects of one schema can be combined. Clear the selection to choose a different schema's projects.
                            </p>
                        )}
                        <ScrollArea className="h-48 pr-2">
                            <div className="space-y-3">
                                {groups.map((g) => (
                                    <div key={g.label}>
                                        <div className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{g.label}</div>
                                        <ul className="space-y-1">
                                            {g.items.map((project) => {
                                                const locked = isLocked(project);
                                                return (
                                                    <li
                                                        key={project.project_id}
                                                        className={`flex items-center gap-2 px-2 py-1 rounded ${locked ? "opacity-50 cursor-not-allowed" : "hover:bg-muted cursor-pointer"}`}
                                                        onClick={() => !locked && toggleSelection(project)}
                                                        title={locked ? "Different schema — clear the selection first" : undefined}
                                                    >
                                                        <Checkbox
                                                            checked={isSelected(project)}
                                                            disabled={locked}
                                                            onClick={(e) => e.stopPropagation()}
                                                            onCheckedChange={() => !locked && toggleSelection(project)}
                                                        />
                                                        <div>
                                                            <div>{project.project_name}</div>
                                                            <div className="text-xs text-muted-foreground">{project.role}</div>
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="chosen">
                    <AccordionTrigger>{t("projectDialog.chosen")} ({selected.length})</AccordionTrigger>
                    <AccordionContent>
                        <div className="flex justify-end mb-2">
                            <Button variant="ghost" size="sm" onClick={deselectAll}>
                                {t("button.deselect_all")}
                            </Button>
                        </div>
                        <ScrollArea className="h-32 pr-2">
                            <ul className="space-y-1">
                                {selected.map((project) => (
                                    <li
                                        key={project.project_id}
                                        className="flex items-center justify-between px-2 py-1 rounded hover:bg-muted"
                                    >
                                        <span>{project.project_name}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-5 w-5"
                                            onClick={() => removeSelection(project)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </ScrollArea>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <div className="flex justify-between gap-2">
                <Button variant="ghost" onClick={clearSelection} className="flex items-center gap-2">
                    <Trash className="w-4 h-4" />
                    {t("button.clear_selection")}
                </Button>

                <div className="flex gap-2">
                    <Button variant="ghost" onClick={onClose}>{t("button.cancel")}</Button>
                    <Button disabled={selected.length === 0} onClick={handleApply}>
                        {t("button.apply")}
                    </Button>
                </div>
            </div>
        </div>
    );
}
