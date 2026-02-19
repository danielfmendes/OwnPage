import { Outlet, useLocation } from "react-router-dom";
import { Footer } from "@/components/layout/Footer.tsx";

export function GlobalLayout() {
    const location = useLocation();
    const isDwh = location.pathname.startsWith("/dwh");

    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-grow">
                <Outlet />
            </main>
            {!isDwh && <Footer />}
        </div>
    );
}