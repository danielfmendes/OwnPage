import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import "../i18n";
import i18n from "i18next";
import { NotificationProvider } from "@/components/helpers/NotificationProvider";
import { OpenAPI } from "@/models/api/core/OpenAPI";
import apiUrl from "@/utils/helpers";

OpenAPI.BASE = apiUrl;
OpenAPI.CREDENTIALS = "include";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { SessionProvider } from "@/context/SessionProvider";
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
import ChatPage from "@/pages/chat/ChatPage.tsx";
import Language from "@/utils/language";
import { GlobalLayout } from "@/components/layout/GlobalLayout.tsx";
import { Suspense } from "react";
import { CausalitySurvey, FeedbackPulse, HousePrices, MockExams } from "@/features";
import { FeatureLayout } from "@/app/FeatureLayout";

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
                    <Suspense fallback={null}>
                    <Routes>
                        <Route element={<FeatureLayout />}>
                            <Route path="/apa-quiz/*" element={<MockExams />} />
                            <Route path="/causality-survey/*" element={<CausalitySurvey />} />
                            <Route path="/lisbon-house-prices/*" element={<HousePrices />} />
                            <Route path="/feedback-pulse/*" element={<FeedbackPulse />} />
                        </Route>

                        <Route element={<GlobalLayout />}>
                            <Route path="/" element={<Home />} />
                            <Route path="/imprint" element={<ImprintPage />} />
                            <Route path="/privacy" element={<PrivacyPage />} />

                            {/* One login for Chat and the DWH */}
                            <Route path="/login" element={<LoginCard />} />
                            <Route path="/register" element={<RegisterCard />} />
                            <Route path="/dwh/login" element={<Navigate to="/login" replace />} />
                            <Route path="/dwh/register" element={<Navigate to="/register" replace />} />
                            <Route path="/chat/login" element={<Navigate to="/login?next=/chat" replace />} />
                            <Route path="/chat/register" element={<Navigate to="/register" replace />} />

                            <Route path="/chat" element={<SessionProvider><ChatPage /></SessionProvider>} />

                            <Route path="/dwh" element={<DWHLayout />}>
                                <Route path="customer" element={<CustomerPage />} />
                                <Route path="dashboard" element={<DashboardPage />} />
                                <Route path="orders" element={<OrderPage />} />
                                <Route path="partsstorage" element={<PartsStoragePage />} />
                                <Route path="rolemanagement" element={<RoleManagementPage />} />
                                <Route path="warehouse" element={<WareHousePage />} />
                            </Route>
                        </Route>
                    </Routes>
                    </Suspense>
                </BrowserRouter>
            </ThemeProvider>
        </NotificationProvider>
    </StrictMode>,
)