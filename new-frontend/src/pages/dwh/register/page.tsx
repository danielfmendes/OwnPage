import {useState, type ChangeEvent} from 'react';
import {Card, CardContent, CardHeader} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import InputField from '@/components/helpers/InputField';
import {Box} from 'lucide-react';
import {DatePicker} from "@/components/helpers/datepicker/DatePicker";
import AuthToken from "@/utils/authtoken";
import {useNotification} from "@/components/helpers/NotificationProvider";
import {useTranslation} from "react-i18next";
import {ButtonLoading} from "@/components/helpers/ButtonLoading";
import {AuthsService} from "@/models/api";

export default function RegisterCard() {
    const {t} = useTranslation();
    const {addNotification} = useNotification();
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = () => {
        setIsLoading(true);

        const newData = {
            username: name,
            email,
            password,
            dob: selectedDate ? selectedDate.toISOString() : "",
        }

        AuthsService.userRegister(newData)
            .then(data => {
                if (data.token) {
                    AuthToken.setAuthToken(data.token);
                    window.location.href = '/dwh/dashboard';
                    addNotification(
                        "Confirmation e-mail has been sent. Please confirm your account within 7 days (check your spam folder if necessary).",
                        "success"
                    );
                } else {
                    addNotification("Registration failed: Token not provided", "error");
                }
            })
            .catch(err => addNotification(`Registration error${err?.message ? `: ${err.message}` : ""}`, "error"))
            .finally(() => setIsLoading(false));
    };

    const handleBack = () => {
        if (document.referrer) {
            window.history.back();
        } else {
            window.location.href = '/';
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="flex flex-row justify-center items-center space-x-2">
                    <Box className="w-6 h-6"/>
                    <h1 className="text-lg font-semibold">NebulaDW</h1>
                </CardHeader>
                <CardContent className="space-y-4">
                    <InputField
                        label={t("label.name")}
                        value={name}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    />
                    <div className="space-y-1">
                        <label className="block text-sm font-medium">{t("label.birthday")}</label>
                        <div className="relative">
                            <DatePicker date={selectedDate} setDate={setSelectedDate}/>
                        </div>
                    </div>
                    <InputField
                        label={t("label.email")}
                        value={email}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    />
                    <InputField
                        label={t("label.password")}
                        type="password"
                        value={password}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    />
                    <ButtonLoading id="send-btn" onClick={handleSubmit} isLoading={isLoading} className="w-full">
                        {t("button.register")}
                    </ButtonLoading>
                    <Button onClick={handleBack} variant="secondary" className="w-full">
                        {t("button.back")}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
