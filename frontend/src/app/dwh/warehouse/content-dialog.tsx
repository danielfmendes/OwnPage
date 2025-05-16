import React from "react";
import {DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Bike} from "@/types/datatables";
import InputField from "@/components/helpers/InputField";
import {ButtonLoading} from "@/components/helpers/ButtonLoading";
import {useNotification} from "@/components/helpers/NotificationProvider";
import {BikeWithModelName} from "@/types/custom";
import {DatePicker} from "@/components/helpers/DatePicker";
import ProjectIDSelect from "@/components/helpers/selects/ProjectIDSelect";
import ModelNameSelect from "@/components/helpers/selects/ModelNameSelect";
import {fetchWithBodyAndToken} from "@/utils/url";
import {useTranslation} from "react-i18next";

interface Props {
    rowData?: BikeWithModelName;
    onClose: () => void;
    onRefresh: () => void;
}

export default function BikeDialogContent({rowData, onClose, onRefresh}: Props) {
    const isEditMode = !!rowData;
    const {t} = useTranslation();
    const {addNotification} = useNotification();

    const [projectId, setProjectId] = React.useState<string>(rowData?.project_id?.toString() || "");
    const [modelId, setModelId] = React.useState<number | null>(rowData?.model_id ?? null);
    const [serialNumber, setSerialNumber] = React.useState<string>(rowData?.serial_number ?? '');
    const [productionDate, setProductionDate] = React.useState<Date | undefined>(undefined);
    const [quantity, setQuantity] = React.useState<number>(rowData?.quantity ?? 0);
    const [warehouseLocation, setWarehouseLocation] = React.useState<string>(rowData?.warehouse_location ?? '');
    const [isLoading, setIsLoading] = React.useState(false);

    const resetForm = () => {
        setProjectId("");
        setModelId(null);
        setSerialNumber('');
        setProductionDate(undefined);
        setQuantity(0);
        setWarehouseLocation('');
    };

    const handleSave = () => {
        const newData = {
            project_id: parseInt(projectId),
            model_id: modelId,
            serial_number: serialNumber,
            production_date: productionDate ? productionDate.toISOString() : '',
            quantity,
            warehouse_location: warehouseLocation,
        };

        setIsLoading(true);
        fetchWithBodyAndToken("POST", "/bikes", newData)
            .then(() => {
                addNotification("Bike saved successfully", "success");
                resetForm();
                onClose();
                onRefresh();
            })
            .catch(err => addNotification(`Failed to save bike${err?.message ? `: ${err.message}` : ""}`, "error"))
            .finally(() => setIsLoading(false));
    };

    const handleUpdate = () => {
        const updatedData: Bike = {
            id: rowData?.id || 0,
            model_id: modelId ?? 0,
            serial_number: serialNumber,
            production_date: rowData?.production_date || '',
            quantity,
            warehouse_location: warehouseLocation,
            project_id: parseInt(projectId) ?? 0,
        };

        setIsLoading(true);
        fetchWithBodyAndToken("PUT", "/bikes", updatedData)
            .then(() => {
                addNotification("Bike updated successfully", "success");
                onClose();
                onRefresh();
            })
            .catch(err => addNotification(`Failed to update bike${err?.message ? `: ${err.message}` : ""}`, "error"))
            .finally(() => setIsLoading(false));
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{isEditMode ? t("warehouse.edit") : t("warehouse.add")}</DialogTitle>
            </DialogHeader>

            {isEditMode ? (
                <>
                    <InputField label={t("label.project")} value={rowData.project_id}/>
                    <InputField label={t("label.model_name")} value={rowData.model_name}/>
                </>
            ) : (
                <>
                    <ProjectIDSelect
                        projectID={projectId}
                        onChange={(value) => setProjectId(value)}
                    />
                    <div className="space-y-1">
                        <label className="block text-sm font-medium">{t("label.model_name")}</label>
                        <ModelNameSelect
                            modelID={modelId}
                            onChange={(value) => setModelId(value)}
                        />
                    </div>
                </>
            )}

            <div className="space-y-1">
                <InputField
                    label={t("label.serial_number")}
                    placeholder={t("placeholder.serial_number")}
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                />
            </div>

            {isEditMode ? (
                <InputField
                    label={t("label.production_date")}
                    value={rowData.production_date ? new Date(rowData.production_date).toLocaleDateString('de-DE') : ''}
                />
            ) : (
                <div className="space-y-1">
                    <label className="block text-sm font-medium">{t("label.production_date")}</label>
                    <DatePicker date={productionDate} setDate={setProductionDate} position="right"/>
                </div>
            )}

            <div className="space-y-1">
                <InputField
                    label={t("label.quantity")}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                />
                <InputField
                    label={t("label.warehouse_position")}
                    placeholder={t("placeholder.warehouse_position")}
                    value={warehouseLocation}
                    onChange={(e) => setWarehouseLocation(e.target.value)}
                />
            </div>

            <ButtonLoading
                isLoading={isLoading}
                onClick={isEditMode ? handleUpdate : handleSave}
                className="w-full mt-4"
                loadingText="Please wait"
            >
                {isEditMode ? t("button.update") : t("button.save")}
            </ButtonLoading>
        </DialogContent>
    );
}