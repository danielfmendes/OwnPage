'use client';

import React, {useState, ChangeEvent, FormEvent} from 'react';
import {Card, CardContent, CardHeader} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import InputField from '@/components/admin-panel/InputField';
import {ArrowRight, Box} from 'lucide-react';
import {useRouter} from 'next/navigation';
import apiUrl from "@/utils/url";
import AuthToken from "@/utils/authtoken";

export default function LoginCard() {
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
        const emailError = email ? '' : 'Bitte geben Sie eine E-Mail-Adresse ein.';
        const passwordError = password ? '' : 'Bitte geben Sie ein Passwort ein.';
        setErrorMessageEmail(emailError);
        setErrorMessagePassword(passwordError);
        return !(emailError || passwordError);
    };

    const login = (loginEmail: string, loginPassword: string, redirect = true) => {
        fetch(`${apiUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: loginEmail, password: loginPassword }),
        })
            .then(res => {
                if (!res.ok) throw new Error();
                return res.json();
            })
            .then(data => {
                AuthToken.setAuthToken(data.token);
                if (redirect) window.location.href = '/dwh/dashboard';
            })
            .catch(() => {
                setErrorMessagePassword("Passwort oder Email sind falsch.");
            });
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
                    <Button onClick={event => handleSubmit(event)} className="w-full mt-4">
                        Senden
                    </Button>
                    <Button onClick={handleBack} variant="secondary" className="w-full mt-4">
                        Zurück
                    </Button>
                    <Button onClick={handleRegister} variant="link" className="w-full mt-4 text-blue-600">
                        Noch kein Konto? Registrieren
                    </Button>

                    <div className="flex items-center my-4">
                        <div className="flex-grow h-px bg-gray-300"/>
                        <span className="px-2 text-sm text-gray-500">or</span>
                        <div className="flex-grow h-px bg-gray-300"/>
                    </div>
                    <Button onClick={handleDemo} className="w-1/2 mx-auto flex justify-center items-center space-x-2">
                        <span>Demo</span>
                        <ArrowRight className="w-4 h-4"/>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
