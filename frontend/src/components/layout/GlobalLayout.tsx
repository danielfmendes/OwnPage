import {Outlet} from "react-router-dom";
import {Footer} from "@/components/layout/Footer.tsx";

export function GlobalLayout() {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-grow">
                <Outlet/>
            </main>
            <Footer/>
        </div>
    );
}