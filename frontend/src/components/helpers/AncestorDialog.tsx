import { useState } from "react";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {Trash, X} from "lucide-react";
import { RoleManagementWithName } from "@/types/custom";
import { useRoleStore } from "@/utils/rolemananagemetstate";

interface Props {
    onClose: () => void;
}

export function AncestorDialog({onClose}: Props) {
    const projects: RoleManagementWithName[] = useRoleStore((state) => state.roles);
    const applySelected = useRoleStore((state) => state.setSelectedRoles);
    const [selected, setSelected] = useState<RoleManagementWithName[]>(useRoleStore((state) => state.selectedRoles));

    const isSelected = (project: RoleManagementWithName) =>
        selected.some((p) => p.project_id === project.project_id);

    const toggleSelection = (project: RoleManagementWithName) => {
        setSelected((prev) =>
            isSelected(project)
                ? prev.filter((p) => p.project_id !== project.project_id)
                : [...prev, project]
        );
    };

    const selectAll = () => setSelected(projects);
    const deselectAll = () => setSelected([]);
    const removeSelection = (project: RoleManagementWithName) =>
        setSelected((prev) => prev.filter((p) => p.project_id !== project.project_id));

    const handleApply = () => {
        // IDs der ausgewählten Projekte extrahieren
        const projectIds = selected
            .map((project) => project.project_id)
            .sort((a, b) => a - b)
            .join("|");

        const newUrl = `${window.location.pathname}?project_id=${projectIds}`;
        window.history.pushState({}, "", newUrl);
        onClose();
        applySelected(selected);
    };

    const clearSelection = () => {
        setSelected([]);
        applySelected([]);
        onClose();
        // Clear the URL parameter
        const cleanUrl = window.location.pathname;
        window.history.pushState({}, "", cleanUrl);
    };


    return (
        <div className="space-y-4">
            <DialogHeader>
                <DialogTitle>Ancestor Scope</DialogTitle>
                <DialogDescription>
                    The platform will exclusively present information relevant to the ancestor you select.
                </DialogDescription>
            </DialogHeader>

            <Accordion type="single" collapsible className="w-full space-y-4">
                <AccordionItem value="refine">
                    <AccordionTrigger>Refine ancestors</AccordionTrigger>
                    <AccordionContent>
                        <div className="flex justify-end mb-2">
                            <Button variant="ghost" size="sm" onClick={selectAll}>
                                Select all
                            </Button>
                        </div>
                        <ScrollArea className="h-48 pr-2">
                            <ul className="space-y-1">
                                {projects.map((project) => (
                                    <li
                                        key={project.project_id}
                                        className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted cursor-pointer"
                                        onClick={() => toggleSelection(project)}
                                    >
                                        <Checkbox
                                            checked={isSelected(project)}
                                            onClick={(e) => e.stopPropagation()}
                                            onCheckedChange={() => toggleSelection(project)}
                                        />
                                        <div>
                                            <div>{project.project_name}</div>
                                            <div className="text-xs text-muted-foreground">
                                                Role: {project.role}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </ScrollArea>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="chosen">
                    <AccordionTrigger>Chosen ({selected.length})</AccordionTrigger>
                    <AccordionContent>
                        <div className="flex justify-end mb-2">
                            <Button variant="ghost" size="sm" onClick={deselectAll}>
                                Deselect all
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
                    <Trash className="w-4 h-4" /> Clear selection
                </Button>

                <div className="flex gap-2">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button disabled={selected.length === 0} onClick={handleApply}>
                        Apply
                    </Button>
                </div>
            </div>
        </div>
    );
}
