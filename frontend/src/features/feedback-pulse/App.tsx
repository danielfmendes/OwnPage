import {useEffect} from "react";
import {Routes, Route, useLocation} from "react-router-dom";
import {Header} from "@/features/feedback-pulse/components/Header";
import Dashboard from "@/features/feedback-pulse/pages/Dashboard";
import ErrorDetail from "@/features/feedback-pulse/pages/ErrorDetail";

function App() {
    const {pathname} = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return (
        <div className="flex min-h-screen flex-col font-sans text-zinc-950 antialiased dark:bg-black dark:text-zinc-50">
            <Header/>
            <main className="flex-1">
                <Routes>
                    <Route path="/" element={<Dashboard/>}/>
                    <Route path="/issues/:id" element={<ErrorDetail/>}/>
                </Routes>
            </main>
        </div>
    )
}

export default App;