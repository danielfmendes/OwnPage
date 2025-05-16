import {DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import InputField from "@/components/helpers/InputField";
import React from "react";
import {DatePicker} from "@/components/helpers/DatePicker";
import {ButtonLoading} from "@/components/helpers/ButtonLoading";
import {useNotification} from "@/components/helpers/NotificationProvider";
import ProjectIDSelect from "@/components/helpers/selects/ProjectIDSelect";
import {fetchWithBodyAndToken} from "@/utils/url";
import {useTranslation} from "react-i18next";

interface Props {
    onClose: () => void;
    onRefresh: () => void;
}

export default function AddCustomerContent({onClose, onRefresh}: Props) {
    const {t} = useTranslation();
    const {addNotification} = useNotification();
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
        fetchWithBodyAndToken("POST", "/customers", newData)
            .then(() => {
                addNotification("Customer saved successfully", "success");
                resetForm();
                onClose();
                onRefresh();
            })
            .catch(err => addNotification(`Failed to save customers${err?.message ? `: ${err.message}` : ""}`, "error"))
            .finally(() => setIsLoading(false));
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{t("customer.add")}</DialogTitle>
            </DialogHeader>
            <ProjectIDSelect
                projectID={projectId}
                onChange={(value) => setProjectId(value)}
            />
            <InputField
                label={t("label.first_name")}
                placeholder={t("placeholder.first_name")}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
            />
            <InputField
                label={t("label.name")}
                placeholder={t("placeholder.name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <InputField
                label={t("label.email")}
                placeholder={t("placeholder.email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <div className="space-y-1">
                <label className="block text-sm font-medium">{t("label.dob")}</label>
                <DatePicker date={dob} setDate={setDob}/>
            </div>
            <InputField
                label={t("label.city")}
                placeholder={t("placeholder.city")}
                value={city}
                onChange={(e) => setCity(e.target.value)}
            />
            <ButtonLoading
                isLoading={isLoading}
                onClick={handleSave}
                className="w-full mt-4"
                loadingText={t("placeholder.please_wait")}
            >
                {t("save_button")}
            </ButtonLoading>
        </DialogContent>
    );
}