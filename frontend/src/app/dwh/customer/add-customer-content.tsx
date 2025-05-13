import {DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import InputField from "@/components/helpers/InputField";
import React from "react";
import DatePicker from "@/components/helpers/DatePicker";
import {ButtonLoading} from "@/components/helpers/ButtonLoading";
import apiUrl from "@/utils/url";
import {useNotification} from "@/components/helpers/NotificationProvider";
import AuthToken from "@/utils/authtoken";
import {Project} from "@/types/datatables";
import {RoleManagementWithName} from "@/types/custom";
import {useRoleStore} from "@/utils/rolemananagemetstate";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

interface Props {
    onClose: () => void;
    onRefresh: () => void;
}

export default function AddCustomerContent({onClose, onRefresh}: Props) {
    const { addNotification } = useNotification();
    const token = AuthToken.getAuthToken();

    const roles: RoleManagementWithName[] = useRoleStore((state) => state.roles);
    const [firstName, setFirstName] = React.useState<string>('');
    const [name, setName] = React.useState<string>('');
    const [email, setEmail] = React.useState<string>('');
    const [dob, setDob] = React.useState<Date | undefined>(new Date());
    const [city, setCity] = React.useState<string>('');
    const [projectId, setProjectId] = React.useState<string>("");
    const [projectIdOptions, setProjectIdOptions] = React.useState<Project[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);

    React.useEffect(() => {
        // Filter roles to find != "user" and then map to project_id and project_name
        if (roles.length != 0) {
            const adminRoles: Project[] = roles
                .filter((role) => role.role !== "user")
                .map((role) => ({
                    id: role.project_id,
                    name: role.project_name
                }));
            setProjectIdOptions(adminRoles);
        }
    }, [roles]);

    const resetForm = () => {
        setProjectId("");
        setFirstName("");
        setName("");
        setEmail("");
        setDob(undefined);
        setCity("");
    };

    const handleSave = () => {
        const newData = {
            project_id: parseInt(projectId),
            first_name: firstName,
            name: name,
            email: email,
            password: "test123",
            dob: dob ? dob.toISOString() : "",
            city: city,
        };

        setIsLoading(true);
        fetch(`${apiUrl}/customers`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newData),
        })
            .then(res => {
                if (!res.ok) throw new Error("Save failed");
                addNotification("Customer saved successfully", "success");
                resetForm();
                onClose();
                onRefresh();
            })
            .catch(err => addNotification(`Save error: ${err}`, "error"))
            .finally(() => setIsLoading(false));
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add Customer</DialogTitle>
            </DialogHeader>
            <div className="space-y-1">
                <label className="block text-sm font-medium">Project</label>
                <Select value={projectId} onValueChange={(value) => setProjectId(value)}>
                    <SelectTrigger className="w-full p-2 border rounded">
                        <SelectValue placeholder="Select a project"/>
                    </SelectTrigger>
                    <SelectContent>
                        {projectIdOptions.map((option, index) => (
                            <SelectItem key={index} value={option.id.toString()}>
                                {option.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <InputField
                label="First Name"
                placeholder="e.g. Peter"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
            />
            <InputField
                label="Name"
                placeholder="e.g. Griffin"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <InputField
                label="Email"
                placeholder="e.g. test@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <div className="space-y-1">
                <label className="block text-sm font-medium">Date of Birth</label>
                <DatePicker date={dob} onSelect={setDob} />
            </div>
            <InputField
                label="City"
                placeholder="e.g. Hamburg"
                value={city}
                onChange={(e) => setCity(e.target.value)}
            />
            <ButtonLoading
                isLoading={isLoading}
                onClick={handleSave}
                className="w-full mt-4"
                loadingText="Please wait"
            >
                Save
            </ButtonLoading>
        </DialogContent>
    );
}