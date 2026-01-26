import React, {useState} from "react";
import {useNavigate, Link} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Loader2, Eye, EyeOff} from "lucide-react";
import {useNotification} from "@/components/helpers/NotificationProvider";
import {ChatAuthLayout} from "@/pages/chat/AuthLayout.tsx";
import {chatApi} from "@/models/chat/chatApi.ts";

export default function ChatRegister() {
    const navigate = useNavigate();
    const {addNotification} = useNotification();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({email: "", password: "", ai_mode: "balanced"});

    const modes = ["balanced", "creative", "precise", "technical"];

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const data = await chatApi.register(formData);
            localStorage.setItem("chat_token", data.token);

            addNotification("Account created! Welcome to Nebula Chat.", "success");
            navigate("/chat");
        } catch (error: any) {
            addNotification("Error creating account.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ChatAuthLayout title="Create Account" subtitle="Choose your preferred AI personality">
            <form onSubmit={handleRegister} className="space-y-5">
                <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-1">Email Address</Label>
                    <Input
                        type="email"
                        placeholder="your@email.com"
                        className="bg-zinc-100/80 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 h-11 text-zinc-900 dark:text-white"
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
                            className="bg-zinc-100/80 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 h-11 text-zinc-900 dark:text-white pr-10"
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

                <div className="space-y-3">
                    <Label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-1">Initial AI Mode</Label>
                    <div className="grid grid-cols-2 gap-2">
                        {modes.map((mode) => (
                            <button
                                key={mode} type="button"
                                onClick={() => setFormData({...formData, ai_mode: mode})}
                                className={`py-2 px-3 text-[11px] rounded-xl border transition-all font-medium ${
                                    formData.ai_mode === mode
                                        ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                                        : "bg-zinc-100 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                                }`}
                            >
                                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <Button
                    className="w-full h-12 bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 font-bold rounded-xl mt-4 shadow-lg transition-all">
                    {isLoading ? <Loader2 className="animate-spin"/> : "Sign Up"}
                </Button>
            </form>

            <div className="mt-8 text-center pt-4">
                <p className="text-zinc-500 text-xs">
                    Already a member?{" "}
                    <Link to="/chat/login"
                          className="text-blue-600 dark:text-white font-semibold underline underline-offset-4 hover:opacity-80 transition-opacity">
                        Log in now
                    </Link>
                </p>
            </div>
        </ChatAuthLayout>
    );
}