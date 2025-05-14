'use client';

import React, { useState, ChangeEvent } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import InputField from '@/components/helpers/InputField';
import { Box } from 'lucide-react';
import DatePicker from "@/components/helpers/DatePicker";
import apiUrl from "@/utils/url";
import AuthToken from "@/utils/authtoken";
import {useNotification} from "@/components/helpers/NotificationProvider";

export default function RegisterCard() {
    const {addNotification} = useNotification();
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined);

    const handleSubmit = () => {
        fetch(`${apiUrl}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: name,
                email,
                password,
                dob: selectedDate,
            }),
        })
            .then(res => {
                if (!res.ok) throw new Error();
                return res.json();
            })
            .then(data => {
                AuthToken.setAuthToken(data.token);
                window.location.href = '/dwh/dashboard';
                addNotification(
                    "Bestätigungs-E-Mail wurde gesendet. Bitte bestätige dein Konto innerhalb von 7 Tagen (prüfe ggf. auch den Spam-Ordner).",
                    "success"
                );
            })
            .catch(err => addNotification(`Fehler beim Registrieren: ${err}`, "error"))
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
                    <Box className="w-6 h-6" />
                    <h1 className="text-lg font-semibold">NebulaDW</h1>
                </CardHeader>
                <CardContent className="space-y-4">
                    <InputField
                        label="Name"
                        value={name}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    />
                    <div className="space-y-1">
                        <label className="block text-sm font-medium">Geburtstag</label>
                        <div className="relative">
                            <DatePicker date={selectedDate} onSelect={(date)=> setSelectedDate(date)} />
                        </div>
                    </div>
                    <InputField
                        label="E-Mail"
                        value={email}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    />
                    <InputField
                        label="Passwort"
                        value={password}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                        type="password"
                    />
                    <Button onClick={handleSubmit} className="w-full mt-4">
                        Registrieren
                    </Button>
                    <Button onClick={handleBack} variant="secondary" className="w-full mt-4">
                        Zurück
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
