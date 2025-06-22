import {StrictMode, useEffect} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import "../i18n";
import {NotificationProvider} from "@/components/helpers/NotificationProvider.tsx";
import {ThemeProvider, useTheme} from "next-themes";
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Home from "@/pages/page.tsx";
import LoginCard from "@/pages/dwh/login/page.tsx";
import DWHLayout from "@/pages/dwh/layout.tsx";
import RegisterCard from "@/pages/dwh/register/page.tsx";
import CustomerPage from "@/pages/dwh/customer/page.tsx";
import DashboardPage from "@/pages/dwh/dashboard/page.tsx";
import OrderPage from "@/pages/dwh/orders/page.tsx";
import PartsStoragePage from "@/pages/dwh/partsstorage/page.tsx";
import RoleManagementPage from "@/pages/dwh/rolemanagement/page.tsx";
import WareHousePage from "@/pages/dwh/warehouse/page.tsx";

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
                    </Routes>
                </BrowserRouter>
            </ThemeProvider>
        </NotificationProvider>
    </StrictMode>,
)
