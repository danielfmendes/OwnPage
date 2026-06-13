// Generic data page: renders any entity of the active schema. Reads compile across the selected
// projects; Add/Edit is enabled only when exactly one project is selected (writes need one target).

import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { useParams } from "react-router-dom";
import DataTable from "@/components/helpers/Table";
import ContentLayout from "@/components/layout/ContentLayout";
import { useNotification } from "@/components/helpers/NotificationProvider";
import { useTranslation } from "react-i18next";
import type { CustomColumnDef } from "@/models/datatable/column";
import { type ItemsLoaderOptions, useRefreshData } from "@/models/datatable/itemsLoader";
import { DeleteButton } from "@/components/helpers/buttons/DeleteButton";
import { ButtonLoading } from "@/components/helpers/buttons/ButtonLoading";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { dwhClient, truthy } from "@/models/dwh/dwhClient";
import { useActiveSchema } from "@/utils/useActiveSchema";
import type { DwhColumn, DwhEntity, DwhRow } from "@/models/dwh/types";
import GenericForm from "./GenericForm";

function renderCell(col: DwhColumn, value: any) {
    if (value === null || value === undefined) return "";
    if (col.data_type === "boolean") return truthy(value) ? "✓" : "—";
    if (col.data_type === "date" || col.data_type === "datetime") {
        const d = new Date(value);
        return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
    }
    return String(value);
}

export default function EntityDataPage() {
    const { entity: entityName } = useParams();
    const { schemaId, projectIds, writeProjectId, selectedCount } = useActiveSchema();
    const { t } = useTranslation();
    const { addNotification } = useNotification();

    const [entityMeta, setEntityMeta] = useState<DwhEntity | null>(null);
    const [data, setData] = useState<DwhRow[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loadingDeleteId, setLoadingDeleteId] = useState<number | null>(null);
    const [showCascadeDialog, setShowCascadeDialog] = useState(false);
    const [isLoadingDeleteCascade, setIsLoadingDeleteCascade] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    async function itemsLoader(options: ItemsLoaderOptions): Promise<void> {
        if (!entityName || !schemaId) return;
        const filter = options.filterManager.getFilterString();
        const sort = options.sort.toCallOpts().join(",");
        const res = await dwhClient.getData(
            entityName, schemaId, projectIds,
            filter === "" ? undefined : filter,
            options.pagination.page, options.pagination.itemsPerPage,
            sort === "" ? undefined : sort,
        );
        setData(res.items ?? []);
        setTotalCount(res.totalCount ?? 0);
    }
    const refreshData = useRefreshData(itemsLoader);

    useEffect(() => {
        let active = true;
        if (!schemaId || !entityName) return;
        dwhClient.listEntities(schemaId)
            .then((entities) => {
                if (!active) return;
                setEntityMeta(entities.find((e) => e.name === entityName) ?? null);
            })
            .catch((e) => active && addNotification(`${e?.message ?? e}`, "error"));
        return () => { active = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [schemaId, entityName, projectIds.join(",")]);

    const deleteRow = (id: number, cascade = false) => {
        if (!entityName || !schemaId) return;
        if (cascade) setIsLoadingDeleteCascade(true); else setLoadingDeleteId(id);
        dwhClient.deleteRow(entityName, schemaId, id, cascade)
            .then(async () => {
                addNotification(`Deleted${cascade ? " with related data" : ""}`, "success");
                await refreshData();
                if (cascade) setShowCascadeDialog(false);
            })
            .catch((err: any) => {
                if (err?.status === 409 && !cascade) { setShowCascadeDialog(true); setDeleteId(id); return; }
                addNotification(`Failed to delete: ${err?.message ?? err}`, "error");
            })
            .finally(() => { if (cascade) setIsLoadingDeleteCascade(false); else setLoadingDeleteId(null); });
    };

    const canWrite = writeProjectId !== undefined;

    const columns: CustomColumnDef<DwhRow>[] = useMemo(() => {
        if (!entityMeta) return [];
        const cols: CustomColumnDef<DwhRow>[] = entityMeta.columns.map((c) => ({
            accessorKey: c.name,
            header: c.display_name || c.name,
            cell: ({ row }: any) => renderCell(c, row.getValue(c.name)),
        }));
        cols.push({
            id: "actions", enableHiding: false, widthPercent: 5,
            cell: ({ row }: any) => (
                <DeleteButton
                    onClick={(event: MouseEvent) => { event.stopPropagation(); deleteRow(row.original.id); }}
                    isLoading={loadingDeleteId === row.original.id}
                    disabled={!canWrite}
                />
            ),
        });
        return cols;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entityMeta, loadingDeleteId, canWrite]);

    const title = entityMeta?.display_name || entityName || "";

    if (!schemaId) {
        return <ContentLayout title={title}><div className="p-8 text-center text-muted-foreground">Select a project (with a schema) to view data.</div></ContentLayout>;
    }
    if (!entityMeta) {
        return <ContentLayout title={title}><div className="p-6 text-muted-foreground">{t("loading", { defaultValue: "Loading…" })}</div></ContentLayout>;
    }

    return (
        <ContentLayout title={title}>
            {!canWrite && (
                <div className="mb-3 rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                    {selectedCount > 1
                        ? "Showing data compiled across several projects (read-only). Select a single project to add or edit rows."
                        : "You don't have write access to this project."}
                </div>
            )}
            <DataTable
                title={title}
                columns={columns}
                data={data}
                itemsLoader={itemsLoader}
                totalCount={totalCount}
                rowDialogContent={canWrite ? (rowData, onClose) => (
                    <GenericForm entityName={entityName!} schemaId={schemaId} projectId={writeProjectId!} columns={entityMeta.columns} mode="edit" initial={rowData} onClose={onClose} onSaved={refreshData} />
                ) : undefined}
                addDialogContent={canWrite ? (onClose) => (
                    <GenericForm entityName={entityName!} schemaId={schemaId} projectId={writeProjectId!} columns={entityMeta.columns} mode="create" onClose={onClose} onSaved={refreshData} />
                ) : undefined}
            />

            {showCascadeDialog && (
                <Dialog open={showCascadeDialog} onOpenChange={() => setShowCascadeDialog(false)}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader><DialogTitle className="text-center">{t("delete_references.info")}</DialogTitle></DialogHeader>
                        <div className="flex justify-center space-x-4">
                            <Button variant="outline" onClick={() => setShowCascadeDialog(false)} className="w-[40%]">{t("button.cancel")}</Button>
                            <ButtonLoading isLoading={isLoadingDeleteCascade} onClick={() => deleteId !== null && deleteRow(deleteId, true)} className="w-[40%]" variant="destructive">
                                {t("delete_references.button")}
                            </ButtonLoading>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </ContentLayout>
    );
}
