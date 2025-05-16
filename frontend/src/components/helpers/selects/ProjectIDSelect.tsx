import React from "react";
import {Project} from "@/types/datatables";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {useRoleStore} from "@/utils/rolemananagemetstate";
import {useTranslation} from "react-i18next";

interface Props {
    projectID: string;
    onChange: (value: string) => void;
}

export default function ProjectIDSelect({ projectID, onChange }: Props) {
    const {t} = useTranslation();
    const roles = useRoleStore((state) => state.roles);
    const selectedRoles = useRoleStore((state) => state.selectedRoles);

    const [projectId, setProjectId] = React.useState<string>(projectID);
    const [projectIdOptions, setProjectIdOptions] = React.useState<Project[]>([]);

    React.useEffect(() => {
        const sourceRoles = selectedRoles.length > 0 ? selectedRoles : roles;

        if (sourceRoles.length > 0) {
            const adminRoles = sourceRoles
                .filter((role) => role.role !== "user")
                .map((role) => ({
                    id: role.project_id,
                    name: role.project_name
                }));

            setProjectIdOptions(adminRoles);
        } else {
            setProjectIdOptions([]);
        }
    }, [roles, selectedRoles]);

    const handleChange = (value: string) => {
        setProjectId(value);
        if (onChange) onChange(value);
    };

    return (
        <div className="space-y-1">
            <label className="block text-sm font-medium">{t("label.project")}</label>
            <Select value={projectId} onValueChange={handleChange}>
                <SelectTrigger className="w-full p-2 border rounded">
                    <SelectValue placeholder={t("placeholder.project")} />
                </SelectTrigger>
                <SelectContent>
                    {projectIdOptions.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500">{t("placeholder.no_project")}</div>
                    ) : (
                        projectIdOptions.map((option) => (
                            <SelectItem key={option.id} value={option.id.toString()}>
                                {option.name}
                            </SelectItem>
                        ))
                    )}
                </SelectContent>
            </Select>
        </div>
    );
}
