import React from "react";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import apiUrl from "@/app/config";
import {WarehousePart} from "@/types/datatables";
import InputField from "@/components/admin-panel/InputField";

interface Props {
    rowData?: any;
    onClose: () => void;
    onRefresh: () => void;
}

export default function WarehousePartEditDialogContent({ rowData, onClose, onRefresh }: Props) {
    const isEditMode = !!rowData;
    const [partId, setPartId] = React.useState(rowData?.part_id || 0);
    const [partType, setPartType] = React.useState(rowData?.part_type || '');
    const [quantity, setQuantity] = React.useState(rowData?.quantity || 0);
    const [storageLocation, setStorageLocation] = React.useState(rowData?.storage_location || '');
    const [partIdOptions, setPartIdOptions] = React.useState<{ id: number, name: string }[]>([]);

    React.useEffect(() => {
        if (!isEditMode && partType) {
            fetch(`${apiUrl}/${partType}s`)
                .then(res => res.json())
                .then(data => setPartIdOptions(data))
                .catch(err => console.error("Fehler beim Laden der Part-ID-Optionen:", err));
        }
    }, [partType]);

    const handleSave = () => {
        const newData = { part_type: partType, part_id: partId, quantity, storage_location: storageLocation };
        fetch(`${apiUrl}/warehouseparts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newData),
        })
            .then(res => {
                if (!res.ok) throw new Error("Fehler beim Speichern");
                console.log("Neuer Datensatz gespeichert");
                onClose(); onRefresh();
            })
            .catch(err => console.error("Fehler beim Speichern:", err));
    };

    const handleUpdate = () => {
        const updatedData: WarehousePart = {
            id: rowData.id, part_type: rowData.part_type, part_id: rowData.part_id,
            quantity, storage_location: storageLocation
        };
        fetch(`${apiUrl}/warehouseparts`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedData),
        })
            .then(res => {
                if (!res.ok) throw new Error("Fehler beim Aktualisieren");
                console.log("Datensatz aktualisiert");
                onClose(); onRefresh();
            })
            .catch(err => console.error("Fehler beim Aktualisieren:", err));
    };


    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{isEditMode ? 'Teilelager bearbeiten' : 'Neues Teil hinzufügen'}</DialogTitle>
            </DialogHeader>

            {isEditMode ? (
                <>
                    <InputField label="ID" value={rowData.id} />
                    <InputField label="Part Type" value={rowData.part_type} />
                    <InputField label="Part ID" value={rowData.part_id} />
                </>
            ) : (
                <>
                    <div className="space-y-1">
                        <label className="block text-sm font-medium">Part Type</label>
                        <Select value={partType} onValueChange={setPartType}>
                            <SelectTrigger className="w-full p-2 border rounded">
                                <SelectValue placeholder="Select part type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="saddle">Saddle</SelectItem>
                                <SelectItem value="frame">Frame</SelectItem>
                                <SelectItem value="fork">Fork</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <label className="block text-sm font-medium">Part ID</label>
                        <Select value={String(partId)} onValueChange={(val) => setPartId(Number(val))}>
                            <SelectTrigger className="w-full p-2 border rounded">
                                <SelectValue placeholder="Select part ID" />
                            </SelectTrigger>
                            <SelectContent>
                                {partIdOptions.map((option) => (
                                    <SelectItem key={option.id} value={String(option.id)}>
                                        {option.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </>
            )}

            <div className="space-y-1">
                <InputField label="Quantity" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
                <InputField label="Warehouse Position" value={storageLocation} onChange={(e) => setStorageLocation(e.target.value)} />
            </div>

            <Button onClick={isEditMode ? handleUpdate : handleSave} className="w-full mt-4">
                {isEditMode ? 'Update' : 'Save'}
            </Button>
        </DialogContent>
    );
}
