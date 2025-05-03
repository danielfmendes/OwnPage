'use client';

import React, { useState, ChangeEvent } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import InputField from '@/components/admin-panel/InputField';
import { Box } from 'lucide-react';
import { useRouter } from 'next/navigation';
import apiUrl from "@/app/config";

export default function LoginCard() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [errorMessageEmail, setErrorMessageEmail] = useState<string>('');
    const [errorMessagePassword, setErrorMessagePassword] = useState<string>('');
    const router = useRouter();

    const handleChange = (field: 'email' | 'password') => (e: ChangeEvent<HTMLInputElement>) => {
        if (field === 'email') {
            setEmail(e.target.value);
        } else {
            setPassword(e.target.value);
        }
    };

    const handleSubmit = () => {
        const emailError = !email ? "Bitte geben Sie eine E-Mail-Adresse ein." : "";
        const passwordError = !password ? "Bitte geben Sie ein Passwort ein." : "";
        setErrorMessageEmail(emailError);
        setErrorMessagePassword(passwordError);

        if (emailError || passwordError) return;

        fetch(`${apiUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        })
            .then(res => {
                if (res.ok) {
                    router.push('/dwh/dashboard');
                } else {
                    setErrorMessagePassword("Passwort oder Email sind falsch.");
                }
            })
    }

    const handleBack = () => {
        if (document.referrer) {
            window.history.back();
        } else {
            window.location.href = '/';
        }
    };

    const handleRegister = () => {
        router.push('/register/dwh');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="flex flex-row justify-center items-center space-x-2">
                    <Box className="w-6 h-6" />
                    <h1 className="text-lg font-semibold">NebulaDW</h1>
                </CardHeader>
                <CardContent className="space-y-4">
                    <InputField
                        label="E-Mail"
                        value={email}
                        onChange={handleChange('email')}
                        errorMessage={errorMessageEmail}
                    />
                    <InputField
                        label="Passwort"
                        value={password}
                        onChange={handleChange('password')}
                        errorMessage={errorMessagePassword}
                    />
                    <Button onClick={handleSubmit} className="w-full mt-4">
                        Senden
                    </Button>
                    <Button onClick={handleBack} variant="secondary" className="w-full mt-4">
                        Zurück
                    </Button>
                    <Button onClick={handleRegister} variant="link" className="w-full mt-4 text-blue-600">
                        Noch kein Konto? Registrieren
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
