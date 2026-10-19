import {useEffect} from "react";
import {Routes, Route, useLocation} from "react-router-dom";
import {Header} from "@/components/Header";
import Dashboard from "@/pages/Dashboard";
import ErrorDetail from "@/pages/ErrorDetail";

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