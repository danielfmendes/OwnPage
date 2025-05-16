import React from "react";
import {DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {fetchWithBodyAndToken, fetchWithToken} from "@/utils/url";
import {WarehousePart} from "@/types/datatables";
import InputField from "@/components/helpers/InputField";
import {ButtonLoading} from "@/components/helpers/ButtonLoading";
import {SelectLoading} from "@/components/helpers/SelectLoading";
import {useNotification} from "@/components/helpers/NotificationProvider";
import {WarehousePartWithName} from "@/types/custom";
import ProjectIDSelect from "@/components/helpers/selects/ProjectIDSelect";
import {useTranslation} from "react-i18next";

interface Props {
    rowData?: WarehousePartWithName;
    onClose: () => void;
    onRefresh: () => void;
}

export default function WarehousePartDialogContent({rowData, onClose, onRefresh}: Props) {
    const isEditMode = !!rowData;
    const {t} = useTranslation();
    const {addNotification} = useNotification();

    const [partId, setPartId] = React.useState<number | null>(rowData?.part_id || null);
    const [projectId, setProjectId] = React.useState<string>(rowData?.project_id?.toString() || "");
    const [partType, setPartType] = React.useState(rowData?.part_type || '');
    const [quantity, setQuantity] = React.useState(rowData?.quantity || 0);
    const [storageLocation, setStorageLocation] = React.useState(rowData?.storage_location || '');
    const [partIdOptions, setPartIdOptions] = React.useState<{ id: number, name: string }[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [isLoadingParts, setIsLoadingParts] = React.useState<boolean>(false);

    React.useEffect(() => {
        if (!isEditMode && partType) {
            setIsLoadingParts(true)
            fetchWithToken(`/${partType}s`)
                .then(data => setPartIdOptions(data))
                .catch(err => addNotification(`Failed to load part-id.options${err?.message ? `: ${err.message}` : ""}`, "error"))
                .finally(() => setIsLoadingParts(false));
        }
    }, [partType]);

    const resetForm = () => {
        setProjectId("");
        setPartId(null);
        setPartType('');
        setQuantity(0);
        setStorageLocation('');
    };

    const handleSave = () => {
        const newData = {
            project_id: parseInt(projectId),
            part_type: partType,
            part_id: partId,
            quantity,
            storage_location: storageLocation
        };
        setIsLoading(true)

        fetchWithBodyAndToken("POST", "/warehouseparts", newData)
            .then(() => {
                addNotification("Warehousepart saved successfully", "success");
                resetForm();
                onClose();
                onRefresh();
            })
            .catch(err => addNotification(`Failed to save warehousepart${err?.message ? `: ${err.message}` : ""}`, "error"))
            .finally(() => setIsLoading(false));
    };

    const handleUpdate = () => {
        const updatedData: WarehousePart = {
            id: rowData?.id || 0,
            part_type: partType,
            part_id: partId ?? 0,
            quantity,
            storage_location: storageLocation,
            project_id: parseInt(projectId) ?? 0,
        }
        setIsLoading(true)

        fetchWithBodyAndToken("PUT", "/warehouseparts", updatedData)
            .then(() => {
                addNotification("Warehousepart updated successfully", "success");
                onClose();
                onRefresh();
            })
            .catch(err => addNotification(`Failed to update warehousepart${err?.message ? `: ${err.message}` : ""}`, "error"))
            .finally(() => setIsLoading(false));
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{isEditMode ? t("partsstorage.edit") : t("partsstorage.add")}</DialogTitle>
            </DialogHeader>
            {isEditMode ? (
                <>
                    <InputField label={t("label.project")} value={rowData.project_id}/>
                    <InputField label={t("label.part_type")} value={rowData.part_type}/>
                    <InputField label={t("label.part_name")} value={rowData?.part_name}/>
                </>
            ) : (
                <>
                    <ProjectIDSelect
                        projectID={projectId}
                        onChange={(value) => setProjectId(value)}
                    />
                    <div className="space-y-1">
                        <label className="block text-sm font-medium">Part Type</label>
                        <Select value={partType} onValueChange={setPartType}>
                            <SelectTrigger className="w-full p-2 border rounded">
                                <SelectValue placeholder={t("placeholder.part_name")}/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="saddle">{t("bike_parts.saddle")}</SelectItem>
                                <SelectItem value="frame">{t("bike_parts.frame")}</SelectItem>
                                <SelectItem value="fork">{t("bike_parts.fork")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <label className="block text-sm font-medium">{t("label.part_name")}</label>
                        <SelectLoading
                            id={partId}
                            setId={setPartId}
                            partIdOptions={partIdOptions}
                            isLoadingParts={isLoadingParts}
                        />
                    </div>
                </>
            )}

            <div className="space-y-1">
                <InputField label={t("label.quantity")} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}/>
                <InputField label={t("label.warehouse_position")} value={storageLocation}
                            onChange={(e) => setStorageLocation(e.target.value)}/>
            </div>

            <ButtonLoading
                isLoading={isLoading}
                onClick={isEditMode ? handleUpdate : handleSave}
                className="w-full mt-4"
                loadingText={t("placeholder.please_wait")}
            >
                {isEditMode ? t("button.update") : t("button.save")}
            </ButtonLoading>

        </DialogContent>
    );
}
