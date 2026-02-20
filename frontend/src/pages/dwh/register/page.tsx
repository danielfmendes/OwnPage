import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { DatePicker } from "@/components/helpers/datepicker/DatePicker";
import AuthToken from "@/utils/authtoken";
import { useNotification } from "@/components/helpers/NotificationProvider";
import { useTranslation } from "react-i18next";
import { AuthsService } from "@/models/api";
import { Link } from "react-router-dom";
import { DwhAuthLayout } from "@/pages/dwh/AuthLayout";
import { useNavigate } from "react-router-dom";

export default function RegisterCard() {
    const { t } = useTranslation();
    const { addNotification } = useNotification();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        let stillLoading = true;
        const loadingTimeout = setTimeout(() => {
            if (stillLoading) {
                addNotification("Render is still starting up - it may take a few seconds...", "info", 10000);
            }
        }, 5000);

        const newData = {
            username: formData.name,
            email: formData.email,
            password: formData.password,
            dob: selectedDate ? selectedDate.toISOString() : "",
        };

        AuthsService.userRegister(newData)
            .then(data => {
                if (data.token) {
                    AuthToken.setAuthToken(data.token);
                    navigate('/dwh/dashboard');
                    addNotification(
                        "Confirmation e-mail has been sent. Please confirm your account within 7 days (check your spam folder if necessary).",
                        "success"
                    );
                } else {
                    addNotification("Registration failed: Token not provided", "error");
                }
            })
            .catch(err => addNotification(`Registration error${err?.message ? `: ${err.message}` : ""}`, "error"))
            .finally(() => {
                stillLoading = false;
                clearTimeout(loadingTimeout);
                setIsLoading(false);
            });
    };

    return (
        <DwhAuthLayout title="Create Account" subtitle="Set up your NebulaDW workspace">
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-1">
                        {t("label.name")}
                    </Label>
                    <Input
                        type="text"
                        placeholder="John Doe"
                        className="bg-zinc-100/80 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 h-11 focus:border-orange-500 transition-all shadow-sm text-zinc-900 dark:text-white"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-1">
                        {t("label.birthday")}
                    </Label>
                    <DatePicker date={selectedDate} setDate={setSelectedDate} />
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-1">
                        {t("label.email")}
                    </Label>
                    <Input
                        type="email"
                        placeholder="email@example.com"
                        className="bg-zinc-100/80 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 h-11 focus:border-orange-500 transition-all shadow-sm text-zinc-900 dark:text-white"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-1">
                        {t("label.password")}
                    </Label>
                    <div className="relative">
                        <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="bg-zinc-100/80 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 h-11 focus:border-orange-500 transition-all shadow-sm pr-10 text-zinc-900 dark:text-white"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                <div className="pt-2">
                    <Button
                        type="submit"
                        className="w-full h-12 bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 font-bold rounded-xl transition-all shadow-lg active:scale-[0.98]"
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                        {t("button.register")}
                    </Button>
                </div>
            </form>

            <div className="mt-8 text-center border-t border-zinc-100 dark:border-zinc-800 pt-6">
                <p className="text-zinc-500 text-xs">
                    {t("already_have_account", "Already have an account?")}{" "}
                    <Link
                        to="/dwh/login"
                        className="text-orange-600 dark:text-white font-semibold underline underline-offset-4 hover:opacity-80 transition-opacity"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </DwhAuthLayout>
    );
}
