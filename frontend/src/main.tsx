import {StrictMode, useEffect} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import "../i18n";
import i18n from "i18next";
import {NotificationProvider} from "@/components/helpers/NotificationProvider";
import {ThemeProvider, useTheme} from "next-themes";
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Home from "@/pages/page";
import LoginCard from "@/pages/dwh/login/page";
import DWHLayout from "@/pages/dwh/layout";
import RegisterCard from "@/pages/dwh/register/page";
import CustomerPage from "@/pages/dwh/customer/page";
import DashboardPage from "@/pages/dwh/dashboard/page";
import OrderPage from "@/pages/dwh/orders/page";
import PartsStoragePage from "@/pages/dwh/partsstorage/page";
import RoleManagementPage from "@/pages/dwh/rolemanagement/page";
import WareHousePage from "@/pages/dwh/warehouse/page";
import PrivacyPage from "@/pages/privacy/page";
import ImprintPage from "@/pages/imprint/page";
import Chat from "@/pages/chat/page.tsx";
import Language from "@/utils/language";

const savedLang = Language.getLanguage();
if (savedLang && i18n.language !== savedLang) {
    i18n.changeLanguage(savedLang);
}

function SystemThemeSetter() {
    const {setTheme} = useTheme()

    useEffect(() => {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setTheme(prefersDark ? 'dark' : 'light')
    }, [])

    return null
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <NotificationProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <SystemThemeSetter/>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/chat" element={<Chat/>}/>
                        <Route path="/dwh" element={<DWHLayout/>}>
                            <Route path="imprint" element={<ImprintPage/>}/>
                            <Route path="privacy" element={<PrivacyPage/>}/>
                            <Route path="login" element={<LoginCard/>}/>
                            <Route path="register" element={<RegisterCard/>}/>
                            <Route path="customer" element={<CustomerPage/>}/>
                            <Route path="dashboard" element={<DashboardPage/>}/>
                            <Route path="orders" element={<OrderPage/>}/>
                            <Route path="partsstorage" element={<PartsStoragePage/>}/>
                            <Route path="rolemanagement" element={<RoleManagementPage/>}/>
                            <Route path="warehouse" element={<WareHousePage/>}/>
                        </Route>
                    </Routes>
                </BrowserRouter>
            </ThemeProvider>
        </NotificationProvider>
    </StrictMode>,
)
