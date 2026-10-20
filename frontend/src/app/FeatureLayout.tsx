import { Outlet } from "react-router-dom"
import { Footer } from "@/components/layout/Footer.tsx"

// Wraps the feature apps. Each feature renders its own single header;
// this only adds the shared footer below it.
export function FeatureLayout() {
    return (
        <div className="flex min-h-screen flex-col">
            <div className="flex flex-1 flex-col">
                <Outlet/>
            </div>
            <Footer/>
        </div>
    )
}
