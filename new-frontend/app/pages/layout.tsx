import React from "react";
import {Helmet} from "react-helmet";

import "../app.css";
import "../../i18n";

import {NotificationProvider} from "@/components/helpers/NotificationProvider";
import {ThemeProvider} from "next-themes";
import {Outlet} from 'react-router-dom';

const RootLayout = () => {
    const appUrl =
        import.meta.env.VITE_APP_URL ||
        import.meta.env.VITE_VERCEL_URL ||
        `http://localhost:${import.meta.env.VITE_PORT || 5173}`;

    return (
        <div>
            <Helmet>
                <title>NebulaDW</title>
                <meta name="description" content="Projekt by Daniel Freire Mendes"/>
                <link rel="icon" href="/favicon.ico" />
                <base href={appUrl}/>
                <html lang="en"/>
            </Helmet>

            <NotificationProvider>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    <Outlet/>
                </ThemeProvider>
            </NotificationProvider>
        </div>
    );
};

export default RootLayout;
