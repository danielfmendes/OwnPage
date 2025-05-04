import React from "react";
import {Button} from "@/components/ui/button";
import {DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import apiUrl, {fetchWithToken} from "@/utils/url";
import {WarehousePart} from "@/types/datatables";
import InputField from "@/components/helpers/InputField";
import AuthToken from "@/utils/authtoken";
import {ButtonLoading} from "@/components/helpers/ButtonLoading";
import {SelectLoading} from "@/components/helpers/SelectLoading";
import {useNotification} from "@/components/helpers/NotificationProvider";

interface Props {
    rowData?: WarehousePart;
    onClose: () => void;
    onRefresh: () => void;
}

export default function WarehousePartEditDialogContent({rowData, onClose, onRefresh}: Props) {
    const {addNotification} = useNotification();
    const token = AuthToken.getAuthToken();
    const isEditMode = !!rowData;
    const [partId, setPartId] = React.useState<number | null>((rowData?.part_id || null));
    const [projectId, setProjectId] = React.useState<number | null>((rowData?.project_id || null));
    const [partType, setPartType] = React.useState(rowData?.part_type || '');
    const [quantity, setQuantity] = React.useState(rowData?.quantity || 0);
    const [storageLocation, setStorageLocation] = React.useState(rowData?.storage_location || '');
    const [partIdOptions, setPartIdOptions] = React.useState<{ id: number, name: string }[]>([]);
    const [projectIdOptions, setProjectIdOptions] = React.useState<{ id: number, name: string }[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [isLoadingParts, setIsLoadingParts] = React.useState<boolean>(false);
    const [isLoadingProjects, setIsLoadingProjects] = React.useState<boolean>(false);

    React.useEffect(() => {
        setIsLoadingProjects(true)
        fetchWithToken(`/projects?requiredRole=admin`)
            .then(res => res.json())
            .then(data => setProjectIdOptions(data))
            .catch(err => addNotification(`Fehler beim Laden der Service-ID-Optionen: ${err}`, "error"))
            .finally(() => setIsLoadingProjects(false));
    }, []);

    React.useEffect(() => {
        if (!isEditMode && partType) {
            setIsLoadingParts(true)
            fetchWithToken(`/${partType}s`)
                .then(res => res.json())
                .then(data => setPartIdOptions(data))
                .catch(err => addNotification(`Fehler beim Laden der Part-ID-Optionen: ${err}`, "error"))
                .finally(() => setIsLoadingParts(false));
        }
    }, [partType]);

    const handleSave = () => {
        const newData = {
            project_id: projectId,
            part_type: partType,
            part_id: partId,
            quantity,
            storage_location: storageLocation
        };
        setIsLoading(true)
        fetch(`${apiUrl}/warehouseparts`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newData),
        })
            .then(res => {
                if (!res.ok) throw new Error("Fehler beim Speichern");
                addNotification("Neuer Datensatz erfolgreich gespeichert", "success");
                onClose();
                onRefresh();
            })
            .catch(err => addNotification(`Fehler beim Speichern: ${err}`, "error"))
            .finally(() => setIsLoading(false));
    };

    const handleUpdate = () => {
        const updatedData: WarehousePart = {
            id: rowData?.id || 0,
            part_type: partType,
            part_id: partId ?? 0,
            quantity,
            storage_location: storageLocation,
            project_id: projectId ?? 0,
        }
        setIsLoading(true)
        fetch(`${apiUrl}/warehouseparts`, {
            method: "PUT",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData),
        })
            .then(res => {
                if (!res.ok) throw new Error("Fehler beim Aktualisieren");
                addNotification("Datensatz erfolgreich aktualisiert", "success");
                onClose();
                onRefresh();
            })
            .catch(err => addNotification(`Fehler beim Aktualisieren: ${err}`, "error"))
            .finally(() => setIsLoading(false));
    };


    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{isEditMode ? 'Teilelager bearbeiten' : 'Neues Teil hinzufügen'}</DialogTitle>
            </DialogHeader>
            {isEditMode ? (
                <>
                    <InputField label="Project" value={rowData.project_id}/>
                    <InputField label="ID" value={rowData.id}/>
                    <InputField label="Part Type" value={rowData.part_type}/>
                    <InputField label="Part ID" value={rowData.part_id}/>
                </>
            ) : (
                <>
                    <div className="space-y-1">
                        <label className="block text-sm font-medium">Project</label>
                        <SelectLoading
                            partId={projectId}
                            setPartId={setProjectId}
                            partIdOptions={projectIdOptions}
                            isLoadingParts={isLoadingProjects}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="block text-sm font-medium">Part Type</label>
                        <Select value={partType} onValueChange={setPartType}>
                            <SelectTrigger className="w-full p-2 border rounded">
                                <SelectValue placeholder="Select part type"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="saddle">Saddle</SelectItem>
                                <SelectItem value="frame">Frame</SelectItem>
                                <SelectItem value="fork">Fork</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <label className="block text-sm font-medium">Part Name</label>
                        <SelectLoading
                            partId={partId}
                            setPartId={setPartId}
                            partIdOptions={partIdOptions}
                            isLoadingParts={isLoadingParts}
                        />
                    </div>
                </>
            )}

            <div className="space-y-1">
                <InputField label="Quantity" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}/>
                <InputField label="Warehouse Position" value={storageLocation}
                            onChange={(e) => setStorageLocation(e.target.value)}/>
            </div>

            <ButtonLoading
                isLoading={isLoading}
                onClick={isEditMode ? handleUpdate : handleSave}
                className="w-full mt-4"
                loadingText={"Please wait"}
            >
                {isEditMode ? 'Update' : 'Save'}
            </ButtonLoading>

        </DialogContent>
    );
}
