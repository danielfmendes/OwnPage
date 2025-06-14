import React from "react";
import {SelectLoading} from "@/components/helpers/SelectLoading";
import {useNotification} from "@/components/helpers/NotificationProvider";
import {useTranslation} from "react-i18next";
import {BikesService} from "@/models/api";
import FilterManager from "@/utils/filtermanager";

interface Props {
    modelID: number | null;
    onChange: (value: number) => void;
}

export default function ModelNameSelect({modelID, onChange}: Props) {
    const {t} = useTranslation();
    const {addNotification} = useNotification();
    const filterManager = new FilterManager();
    const [modelId, setModelId] = React.useState<number | null>(modelID);
    const [modelIdOptions, setModelIdOptions] = React.useState<{ id: number, name: string }[]>([]);
    const [isLoadingModels, setIsLoadingModels] = React.useState(false);

    React.useEffect(() => {
        setIsLoadingModels(true);
        (async () => {
            const filterString = await filterManager.getFilterStringWithProjectIds();
            BikesService.getBikeModels(filterString === "" ? undefined : filterString)
                .then(setModelIdOptions)
                .catch(err => addNotification(`Failed to load model options${err?.message ? `: ${err.message}` : ""}`, "error"))
                .finally(() => setIsLoadingModels(false));
        })();
    }, []);

    const handleChange = (value: number) => {
        setModelId(value);
        if (onChange) onChange(value);
    };

    return (
        <SelectLoading
            id={modelId}
            setId={handleChange}
            partIdOptions={modelIdOptions}
            isLoadingParts={isLoadingModels}
            placeholder={t("placeholder.model_name")}
        />
    );
}
