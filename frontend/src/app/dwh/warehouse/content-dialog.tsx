import React from "react";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import apiUrl, { fetchWithToken } from "@/utils/url";
import { Bike } from "@/types/datatables";
import InputField from "@/components/helpers/InputField";
import AuthToken from "@/utils/authtoken";
import { ButtonLoading } from "@/components/helpers/ButtonLoading";
import { SelectLoading } from "@/components/helpers/SelectLoading";
import { useNotification } from "@/components/helpers/NotificationProvider";
import { BikeWithModelName } from "@/types/custom";
import DatePicker from "@/components/helpers/DatePicker";

interface Props {
    rowData?: BikeWithModelName;
    onClose: () => void;
    onRefresh: () => void;
}

export default function BikeDialogContent({ rowData, onClose, onRefresh }: Props) {
    const { addNotification } = useNotification();
    const token = AuthToken.getAuthToken();
    const isEditMode = !!rowData;

    const [projectId, setProjectId] = React.useState<number | null>(rowData?.project_id ?? null);
    const [modelId, setModelId] = React.useState<number | null>(rowData?.model_id ?? null);
    const [serialNumber, setSerialNumber] = React.useState<string>(rowData?.serial_number ?? '');
    const [productionDate, setProductionDate] = React.useState<Date | undefined>();
    const [quantity, setQuantity] = React.useState<number>(rowData?.quantity ?? 0);
    const [warehouseLocation, setWarehouseLocation] = React.useState<string>(rowData?.warehouse_location ?? '');
    const [modelIdOptions, setModelIdOptions] = React.useState<{ id: number, name: string }[]>([]);
    const [projectIdOptions, setProjectIdOptions] = React.useState<{ id: number, name: string }[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isLoadingModels, setIsLoadingModels] = React.useState(false);
    const [isLoadingProjects, setIsLoadingProjects] = React.useState(false);

    React.useEffect(() => {
        setIsLoadingProjects(true);
        fetchWithToken(`/projects?requiredRole=admin`)
            .then(res => res.json())
            .then(setProjectIdOptions)
            .catch(err => addNotification(`Failed to load project options: ${err}`, "error"))
            .finally(() => setIsLoadingProjects(false));
    }, []);

    React.useEffect(() => {
        setIsLoadingModels(true);
        fetchWithToken(`/bikemodels`)
            .then(res => res.json())
            .then(setModelIdOptions)
            .catch(err => addNotification(`Failed to load model options: ${err}`, "error"))
            .finally(() => setIsLoadingModels(false));
    }, []);

    const resetForm = () => {
        setProjectId(null);
        setModelId(null);
        setSerialNumber('');
        setProductionDate(undefined);
        setQuantity(0);
        setWarehouseLocation('');
    };

    const handleSave = () => {
        const newData = {
            project_id: projectId,
            model_id: modelId,
            serial_number: serialNumber,
            production_date: productionDate ? productionDate.toISOString() : '',
            quantity,
            warehouse_location: warehouseLocation,
        };

        setIsLoading(true);
        fetch(`${apiUrl}/bikes`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newData),
        })
            .then(res => {
                if (!res.ok) throw new Error("Save failed");
                addNotification("Entry saved successfully", "success");
                resetForm();
                onClose();
                onRefresh();
            })
            .catch(err => addNotification(`Save error: ${err}`, "error"))
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
            project_id: rowData?.project_id || 0,
        };

        setIsLoading(true);
        fetch(`${apiUrl}/bikes`, {
            method: "PUT",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData),
        })
            .then(res => {
                if (!res.ok) throw new Error("Update failed");
                addNotification("Entry updated successfully", "success");
                onClose();
                onRefresh();
            })
            .catch(err => addNotification(`Update error: ${err}`, "error"))
            .finally(() => setIsLoading(false));
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{isEditMode ? 'Edit Inventory' : 'Add New Item'}</DialogTitle>
            </DialogHeader>

            {isEditMode ? (
                <>
                    <InputField label="Project" value={rowData.project_id} />
                    <InputField label="ID" value={rowData.id} />
                    <InputField label="Model Name" value={rowData.model_name} />
                </>
            ) : (
                <>
                    <div className="space-y-1">
                        <label className="block text-sm font-medium">Project</label>
                        <SelectLoading
                            id={projectId}
                            setId={setProjectId}
                            partIdOptions={projectIdOptions}
                            isLoadingParts={isLoadingProjects}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="block text-sm font-medium">Model Name</label>
                        <SelectLoading
                            id={modelId}
                            setId={setModelId}
                            partIdOptions={modelIdOptions}
                            isLoadingParts={isLoadingModels}
                        />
                    </div>
                </>
            )}

            <div className="space-y-1">
                <InputField
                    label="Serial Number"
                    placeholder="e.g. SN1001"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                />
            </div>

            {isEditMode ? (
                <InputField
                    label="Production Date"
                    value={rowData.production_date ? new Date(rowData.production_date).toLocaleDateString('de-DE') : ''}
                />
            ) : (
                <div className="space-y-1">
                    <label className="block text-sm font-medium">Production Date</label>
                    <DatePicker date={productionDate} onSelect={setProductionDate} />
                </div>
            )}

            <div className="space-y-1">
                <InputField
                    label="Quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                />
                <InputField
                    label="Warehouse Position"
                    placeholder="e.g. WH-A1"
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
                {isEditMode ? 'Update' : 'Save'}
            </ButtonLoading>
        </DialogContent>
    );
}