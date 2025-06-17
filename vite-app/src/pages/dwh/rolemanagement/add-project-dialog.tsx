import React from "react";
import {DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {ButtonLoading} from "@/components/helpers/ButtonLoading";
import InputField from "@/components/helpers/InputField";
import {useNotification} from "@/components/helpers/NotificationProvider";
import {ProjectsService} from "@/models/api";
import {useTranslation} from "react-i18next";

interface RoleManagementProps {
    onClose: () => void;
    onRefresh: () => void;
}

export default function AddProjektDialogContent({onClose, onRefresh}: RoleManagementProps) {
    const {t} = useTranslation();
    const {addNotification} = useNotification();
    const [isLoadingAddProject, setIsLoadingAddProject] = React.useState(false);
    const [projectName, setProjectName] = React.useState<string>('');

    const handleSave = () => {
        const newData = {
            name: projectName,
        };

        setIsLoadingAddProject(true);
        ProjectsService.createProject(newData)
            .then(() => {
                addNotification("Project saved successfully", "success");
                setProjectName("");
                onClose();
                onRefresh();
            })
            .catch(err => addNotification(`Failed to save project${err?.message ? `: ${err.message}` : ""}`, "error"))
            .finally(() => setIsLoadingAddProject(false));
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{t("project_title")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-1">
                <InputField
                    label={t("label.project_name")}
                    placeholder={t("placeholder.project_name")}
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                />
            </div>
            <div className="flex justify-center space-x-4">
                <Button
                    variant="outline"
                    onClick={onClose}
                    className="w-[40%]"
                >
                    {t("button.cancel")}
                </Button>
                <ButtonLoading
                    isLoading={isLoadingAddProject}
                    onClick={handleSave}
                    className="w-[40%]"
                    variant="default"
                >
                    {t("button.save")}
                </ButtonLoading>
            </div>
        </DialogContent>
    );
}
