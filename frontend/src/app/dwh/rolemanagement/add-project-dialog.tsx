import React from "react";
import {DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {ButtonLoading} from "@/components/helpers/ButtonLoading";
import InputField from "@/components/helpers/InputField";
import {useNotification} from "@/components/helpers/NotificationProvider";
import {fetchWithBodyAndToken} from "@/utils/url";

interface RoleManagementProps {
    onClose: () => void;
    onRefresh: () => void;
}

export default function AddProjektDialogContent({onClose, onRefresh}: RoleManagementProps) {
    const {addNotification} = useNotification();
    const [isLoadingAddProject, setIsLoadingAddProject] = React.useState(false);
    const [projectName, setProjectName] = React.useState<string>('');

    const handleSave = () => {
        const newData = {
            name: projectName,
        };

        setIsLoadingAddProject(true);
        fetchWithBodyAndToken("POST", "/projects", newData)
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
                <DialogTitle>Add Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-1">
                <InputField
                    label="Project Name"
                    placeholder="e.g. Standardprojekt"
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
                    Abbrechen
                </Button>
                <ButtonLoading
                    isLoading={isLoadingAddProject}
                    onClick={handleSave}
                    className="w-[40%]"
                    variant="default"
                >
                    Speichern
                </ButtonLoading>
            </div>
        </DialogContent>
    );
}
