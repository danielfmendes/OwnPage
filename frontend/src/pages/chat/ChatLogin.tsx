import React, {useState} from "react";
import {useNavigate, Link} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Loader2, ArrowRight, Eye, EyeOff} from "lucide-react";
import {useNotification} from "@/components/helpers/NotificationProvider";
import {ChatAuthLayout} from "@/pages/chat/AuthLayout.tsx";
import {chatApi} from "@/models/chat/chatApi.ts";

export default function ChatLogin() {
    const navigate = useNavigate();
    const {addNotification} = useNotification();

    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({email: "", password: ""});

    const handleLogin = async (e: React.FormEvent, isDemo = false) => {
        e.preventDefault();
        setIsLoading(true);

        const credentials = isDemo
            ? {email: "test@email.com", password: "test"}
            : formData;

        try {
            const data = await chatApi.login(credentials);
            localStorage.setItem("chat_token", data.token);

            addNotification("Welcome back!", "success");
            navigate("/chat");
        } catch (error: any) {
            addNotification("Login failed. Check your email or password.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ChatAuthLayout title="Welcome Back" subtitle="Sign in to continue your AI conversation">
            <form onSubmit={(e) => handleLogin(e)} className="space-y-5">
                <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-1">Email Address</Label>
                    <Input
                        type="email"
                        placeholder="email@example.com"
                        className="bg-zinc-100/80 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 h-11 focus:border-blue-500 transition-all shadow-sm text-zinc-900 dark:text-white"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-1">Password</Label>
                    <div className="relative">
                        <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="bg-zinc-100/80 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 h-11 focus:border-blue-500 transition-all shadow-sm pr-10 text-zinc-900 dark:text-white"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
                        >
                            {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                        </button>
                    </div>
                </div>

                <div className="pt-2 space-y-3">
                    <Button
                        type="submit"
                        className="w-full h-12 bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 font-bold rounded-xl transition-all shadow-lg active:scale-[0.98]"
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="animate-spin mr-2"/> : null}
                        Sign In
                    </Button>

                    <div className="relative w-full py-2">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-zinc-200 dark:border-zinc-800"/>
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase">
                            {/* Separator background matches the card background */}
                            <span
                                className="bg-white dark:bg-[#1a1a1c] px-2 text-zinc-400 dark:text-zinc-500 tracking-tighter">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl group transition-all"
                        onClick={(e) => handleLogin(e, true)}
                        disabled={isLoading}
                    >
                        Explore Demo Account
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"/>
                    </Button>
                </div>
            </form>

            <div className="mt-8 text-center border-t border-zinc-100 dark:border-zinc-800 pt-6">
                <p className="text-zinc-500 text-xs">
                    Don't have an account?{" "}
                    <Link
                        to="/chat/register"
                        className="text-blue-600 dark:text-white font-semibold underline underline-offset-4 hover:opacity-80 transition-opacity"
                    >
                        Create account
                    </Link>
                </p>
            </div>
        </ChatAuthLayout>
    );
}