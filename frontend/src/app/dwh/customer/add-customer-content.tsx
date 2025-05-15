import {DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import InputField from "@/components/helpers/InputField";
import React from "react";
import {DatePicker} from "@/components/helpers/DatePicker";
import {ButtonLoading} from "@/components/helpers/ButtonLoading";
import apiUrl from "@/utils/url";
import {useNotification} from "@/components/helpers/NotificationProvider";
import AuthToken from "@/utils/authtoken";
import ProjectIDSelect from "@/components/helpers/selects/ProjectIDSelect";

interface Props {
    onClose: () => void;
    onRefresh: () => void;
}

export default function AddCustomerContent({onClose, onRefresh}: Props) {
    const { addNotification } = useNotification();
    const token = AuthToken.getAuthToken();

    const [firstName, setFirstName] = React.useState<string>('');
    const [name, setName] = React.useState<string>('');
    const [email, setEmail] = React.useState<string>('');
    const [dob, setDob] = React.useState<Date | undefined>(undefined);
    const [city, setCity] = React.useState<string>('');
    const [projectId, setProjectId] = React.useState<string>("");
    const [isLoading, setIsLoading] = React.useState(false);

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
            <ProjectIDSelect
                projectID={projectId}
                onChange={(value) => setProjectId(value)}
            />
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
                <DatePicker date={dob} setDate={setDob} />
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