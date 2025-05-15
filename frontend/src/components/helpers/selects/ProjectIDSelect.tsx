import React from "react";
import {Project} from "@/types/datatables";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {useRoleStore} from "@/utils/rolemananagemetstate";

interface Props {
    projectID: string;
    onChange: (value: string) => void;
}

export default function ProjectIDSelect({ projectID, onChange }: Props) {
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
            <label className="block text-sm font-medium">Project</label>
            <Select value={projectId} onValueChange={handleChange}>
                <SelectTrigger className="w-full p-2 border rounded">
                    <SelectValue placeholder={"Select a project"} />
                </SelectTrigger>
                <SelectContent>
                    {projectIdOptions.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500">No available projects</div>
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
