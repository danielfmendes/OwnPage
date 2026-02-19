import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import AuthToken from "@/utils/authtoken";
import { useNotification } from "@/components/helpers/NotificationProvider";
import { useTranslation } from "react-i18next";
import { AuthsService } from "@/models/api";
import { Link } from "react-router-dom";
import { DwhAuthLayout } from "@/pages/dwh/AuthLayout";

export default function LoginCard() {
    const { t } = useTranslation();
    const { addNotification } = useNotification();

    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingDemo, setIsLoadingDemo] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errorMessageEmail, setErrorMessageEmail] = useState('');
    const [errorMessagePassword, setErrorMessagePassword] = useState('');

    const login = (loginEmail: string, loginPassword: string, demo = false) => {
        const setLoading = demo ? setIsLoadingDemo : setIsLoading;
        setLoading(true);

        let stillLoading = true;
        const loadingTimeout = setTimeout(() => {
            if (stillLoading) {
                addNotification("Render is still starting up - it may take a few seconds...", "info", 10000);
            }
        }, 5000);

        AuthsService.userLogin({ email: loginEmail, password: loginPassword })
            .then(data => {
                if (data.token) {
                    AuthToken.setAuthToken(data.token);
                    window.location.href = '/dwh/dashboard';
                } else {
                    addNotification("Login failed: Token not provided", "error");
                }
            })
            .catch(err => {
                setErrorMessagePassword(t("error.login"));
                addNotification(`Login error${err?.message ? `: ${err.message}` : ""}`, "error");
            })
            .finally(() => {
                stillLoading = false;
                clearTimeout(loadingTimeout);
                setLoading(false);
            });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const emailError = formData.email ? '' : t("error.email");
        const passwordError = formData.password ? '' : t("error.password");
        setErrorMessageEmail(emailError);
        setErrorMessagePassword(passwordError);
        if (!emailError && !passwordError) {
            login(formData.email, formData.password);
        }
    };

    return (
        <DwhAuthLayout title="Welcome Back" subtitle="Sign in to your NebulaDW workspace">
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-1">
                        {t("label.email")}
                    </Label>
                    <Input
                        type="email"
                        placeholder="email@example.com"
                        className={`bg-zinc-100/80 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 h-11 focus:border-orange-500 transition-all shadow-sm text-zinc-900 dark:text-white ${errorMessageEmail ? 'border-red-500' : ''}`}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                    {errorMessageEmail && (
                        <p className="text-red-500 text-xs ml-1">{errorMessageEmail}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-1">
                        {t("label.password")}
                    </Label>
                    <div className="relative">
                        <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className={`bg-zinc-100/80 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 h-11 focus:border-orange-500 transition-all shadow-sm pr-10 text-zinc-900 dark:text-white ${errorMessagePassword ? 'border-red-500' : ''}`}
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
                    {errorMessagePassword && (
                        <p className="text-red-500 text-xs ml-1">{errorMessagePassword}</p>
                    )}
                </div>

                <div className="pt-2 space-y-3">
                    <Button
                        type="submit"
                        className="w-full h-12 bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 font-bold rounded-xl transition-all shadow-lg active:scale-[0.98]"
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                        {t("button.send")}
                    </Button>

                    <div className="relative w-full py-2">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase">
                            <span className="bg-white dark:bg-transparent px-2 text-zinc-400 dark:text-zinc-500 tracking-tighter">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl group transition-all"
                        onClick={() => login("testuser@example.com", "test", true)}
                        disabled={isLoadingDemo}
                    >
                        {isLoadingDemo ? <Loader2 className="animate-spin mr-2" /> : null}
                        {t("demo")}
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                </div>
            </form>

            <div className="mt-8 text-center border-t border-zinc-100 dark:border-zinc-800 pt-6">
                <p className="text-zinc-500 text-xs">
                    {t("go_to_register").replace(/^.*$/, "Don't have an account?")}{" "}
                    <Link
                        to="/dwh/register"
                        className="text-orange-600 dark:text-white font-semibold underline underline-offset-4 hover:opacity-80 transition-opacity"
                    >
                        Create account
                    </Link>
                </p>
            </div>
        </DwhAuthLayout>
    );
}
