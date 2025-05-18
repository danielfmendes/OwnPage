'use client';

import React, {useState, ChangeEvent, FormEvent} from 'react';
import {Card, CardContent, CardHeader} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import InputField from '@/components/helpers/InputField';
import {ArrowRight, Box} from 'lucide-react';
import {useRouter} from 'next/navigation';
import apiUrl, {handleFetchError} from "@/utils/url";
import AuthToken from "@/utils/authtoken";
import {useNotification} from "@/components/helpers/NotificationProvider";
import {useTranslation} from "react-i18next";
import {ButtonLoading} from "@/components/helpers/ButtonLoading";

export default function LoginCard() {
    const {t} = useTranslation();
    const {addNotification} = useNotification();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessageEmail, setErrorMessageEmail] = useState('');
    const [errorMessagePassword, setErrorMessagePassword] = useState('');
    const router = useRouter();

    const handleChange = (field: 'email' | 'password') => (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        field === 'email' ? setEmail(value) : setPassword(value);
    };

    const validateInputs = () => {
        const emailError = email ? '' : t("error.email");
        const passwordError = password ? '' : t("error.password");
        setErrorMessageEmail(emailError);
        setErrorMessagePassword(passwordError);
        return !(emailError || passwordError);
    };

    const login = (loginEmail: string, loginPassword: string, redirect = true) => {
        setIsLoading(true);
        fetch(`${apiUrl}/auth/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email: loginEmail, password: loginPassword}),
        })
            .then(async res => {
                if (!res.ok) await handleFetchError(res, "POST");
                return res.json();
            })
            .then(data => {
                AuthToken.setAuthToken(data.token);
                if (redirect) window.location.href = '/dwh/dashboard';
            })
            .catch((err) => {
                setErrorMessagePassword(t("error.login"));
                addNotification(`Login error${err?.message ? `: ${err.message}` : ""}`, "error");
            })
            .finally(() => setIsLoading(false));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (validateInputs()) login(email, password);
    };

    const handleBack = () => {
        document.referrer ? window.history.back() : window.location.href = '/';
    };

    const handleRegister = () => {
        router.push('/register/dwh');
    };

    const handleDemo = () => {
        login("testuser@example.com", "test");
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
                        label={t("label.email")}
                        value={email}
                        onChange={handleChange('email')}
                        errorMessage={errorMessageEmail}
                    />
                    <InputField
                        label={t("label.password")}
                        value={password}
                        onChange={handleChange('password')}
                        errorMessage={errorMessagePassword}
                    />
                    <ButtonLoading id="send-btn" onClick={event => handleSubmit(event)} isLoading={isLoading} className="w-full mt-4">
                        {t("button.send")}
                    </ButtonLoading>
                    <Button onClick={handleBack} variant="secondary" className="w-full mt-4">
                        {t("button.back")}
                    </Button>
                    <Button onClick={handleRegister} variant="link" className="w-full mt-4 text-blue-600">
                        {t("go_to_register")}
                    </Button>

                    <div className="flex items-center my-4">
                        <div className="flex-grow h-px bg-gray-300"/>
                        <span className="px-2 text-sm text-gray-500">or</span>
                        <div className="flex-grow h-px bg-gray-300"/>
                    </div>
                    <Button onClick={handleDemo} className="w-1/2 mx-auto flex justify-center items-center space-x-2">
                        <span>{t("demo")}</span>
                        <ArrowRight className="w-4 h-4"/>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
