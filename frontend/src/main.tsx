import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import "../i18n";
import i18n from "i18next";
import {NotificationProvider} from "@/components/helpers/NotificationProvider";
import {ThemeProvider} from "next-themes";
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
import ChatLogin from "@/pages/chat/ChatLogin.tsx";
import ChatRegister from "@/pages/chat/ChatRegister.tsx";
import ChatPage from "@/pages/chat/ChatPage.tsx";
import Language from "@/utils/language";
import {GlobalLayout} from "@/components/layout/GlobalLayout.tsx";

const savedLang = Language.getLanguage();
if (savedLang && i18n.language !== savedLang) {
    i18n.changeLanguage(savedLang);
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <NotificationProvider>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                <BrowserRouter>
                    <Routes>
                        <Route element={<GlobalLayout />}>
                            <Route path="/" element={<Home/>}/>
                            <Route path="/imprint" element={<ImprintPage/>}/>
                            <Route path="/privacy" element={<PrivacyPage/>}/>

                            <Route path="/chat" element={<ChatPage/>}/>
                            <Route path="/chat/login" element={<ChatLogin />}/>
                            <Route path="/chat/register" element={<ChatRegister />}/>

                            <Route path="/dwh" element={<DWHLayout/>}>
                                <Route path="login" element={<LoginCard/>}/>
                                <Route path="register" element={<RegisterCard/>}/>
                                <Route path="customer" element={<CustomerPage/>}/>
                                <Route path="dashboard" element={<DashboardPage/>}/>
                                <Route path="orders" element={<OrderPage/>}/>
                                <Route path="partsstorage" element={<PartsStoragePage/>}/>
                                <Route path="rolemanagement" element={<RoleManagementPage/>}/>
                                <Route path="warehouse" element={<WareHousePage/>}/>
                            </Route>
                        </Route>
                    </Routes>
                </BrowserRouter>
            </ThemeProvider>
        </NotificationProvider>
    </StrictMode>,
)