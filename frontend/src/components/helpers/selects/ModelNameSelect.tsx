import React from "react";
import {SelectLoading} from "@/components/helpers/SelectLoading";
import {fetchWithToken} from "@/utils/url";
import {useNotification} from "@/components/helpers/NotificationProvider";

interface Props {
    modelID: number | null;
    onChange: (value: number) => void;
}

export default function ModelNameSelect({modelID, onChange}: Props) {
    const {addNotification} = useNotification();
    const [modelId, setModelId] = React.useState<number | null>(modelID);
    const [modelIdOptions, setModelIdOptions] = React.useState<{ id: number, name: string }[]>([]);
    const [isLoadingModels, setIsLoadingModels] = React.useState(false);

    React.useEffect(() => {
        setIsLoadingModels(true);
        fetchWithToken(`/bikemodels`)
            .then(res => res.json())
            .then(setModelIdOptions)
            .catch(err => addNotification(`Failed to load model options: ${err}`, "error"))
            .finally(() => setIsLoadingModels(false));
    }, []);

    const handleChange = (value: number) => {
        setModelId(value);
        if (onChange) onChange(value);
    };

    return (
        <div className="space-y-1">
            <label className="block text-sm font-medium">Model Name</label>
            <SelectLoading
                id={modelId}
                setId={handleChange}
                partIdOptions={modelIdOptions}
                isLoadingParts={isLoadingModels}
            />
        </div>
    );
}
