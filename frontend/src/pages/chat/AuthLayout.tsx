import React from "react";
import {Link} from "react-router-dom";

interface ChatAuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

export function ChatAuthLayout({children, title, subtitle}: ChatAuthLayoutProps) {
    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-zinc-50 dark:bg-[#09090b] transition-colors duration-500">
            {/* Ambient Background Glows */}
            <div
                className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 dark:bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"/>
            <div
                className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"/>

            {/* Auth Card */}
            <div
                className="w-full max-w-md z-10 bg-white dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl dark:shadow-3xl transition-all">

                {/* Logo with Link to Home */}
                <div className="flex justify-center mb-6">
                    <Link
                        to="/"
                        className="transition-transform hover:scale-110 active:scale-95 duration-200"
                    >
                        <img
                            src="/logo/white.png"
                            alt="Logo"
                            className="w-12 h-12 dark:hidden block rounded-xl"
                        />
                        <img
                            src="/logo/black.png"
                            alt="Logo"
                            className="w-12 h-12 hidden dark:block rounded-xl"
                        />
                    </Link>
                </div>

                <h1 className="text-2xl font-bold text-center mb-2 text-zinc-900 dark:text-white tracking-tight italic">
                    {title}
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-center text-sm mb-8">
                    {subtitle}
                </p>

                {children}
            </div>
        </div>
    );
}