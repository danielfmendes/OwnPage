import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {ChatSidebar} from "@/pages/chat/ChatSidebar.tsx";
import {ChatHeader} from "@/pages/chat/ChatHeader.tsx";
import {MessageList} from "@/pages/chat/MessageList.tsx";
import {chatApi, type Session} from "@/models/chat/chatApi.ts";

export default function ChatPage() {
    const navigate = useNavigate();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [activeSessionId, setActiveSessionId] = useState("");
    const [sessions, setSessions] = useState<Session[]>([]);
    const [aiMode, setAiMode] = useState("balanced");
    const [userEmail, setUserEmail] = useState("");

    // 1. Auth Check & Initial Load
    useEffect(() => {
        const token = localStorage.getItem("chat_token");

        if (!token) {
            navigate("/chat/login", {replace: true});
            return;
        }

        // Only fetch data if token exists
        fetchSessions();

        try {
            // Basic JWT payload decoding
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.email) setUserEmail(payload.email);
        } catch (e) {
            console.error("Error decoding token for email", e);
            // If token is malformed, treat as unauthenticated
            localStorage.removeItem("chat_token");
            navigate("/chat/login", {replace: true});
        }
    }, [navigate]);

    // 2. Reset mode to balanced whenever the active session changes
    useEffect(() => {
        if (activeSessionId) {
            setAiMode("balanced");
        }
    }, [activeSessionId]);

    const fetchSessions = async () => {
        try {
            const data = await chatApi.getSessions();
            setSessions(data);

            const lastId = localStorage.getItem("last_session_id");
            const exists = data.some((s) => s.id === lastId);

            if (lastId && exists) {
                setActiveSessionId(lastId);
            } else if (data.length > 0) {
                setActiveSessionId(data[0].id);
            }
        } catch (err) {
            console.error("Failed to fetch sessions", err);
        }
    };

    const handleCreateSession = async () => {
        try {
            const newSession = await chatApi.createSession();
            setSessions([newSession, ...sessions]);
            setActiveSessionId(newSession.id);
            localStorage.setItem("last_session_id", newSession.id);
            setAiMode("balanced");
        } catch (err) {
            console.error("Failed to create session", err);
        }
    };

    // Return null or a loading state while checking auth to prevent UI flicker
    if (!localStorage.getItem("chat_token")) return null;

    return (
        <div
            className="flex h-[calc(100vh-56px)] bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 overflow-hidden relative font-sans transition-colors duration-300">
            {/* Ambient Background Effect */}
            <div
                className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-normal"/>

            <ChatSidebar
                isOpen={isSidebarOpen}
                setOpen={setSidebarOpen}
                sessions={sessions}
                activeId={activeSessionId}
                setActiveId={(id: string) => {
                    setActiveSessionId(id);
                    localStorage.setItem("last_session_id", id);
                }}
                onCreateSession={handleCreateSession}
            />

            <main className="flex-1 flex flex-col min-w-0 relative z-10 h-full">
                <ChatHeader
                    toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
                    aiMode={aiMode}
                    setAiMode={setAiMode}
                    userEmail={userEmail}
                />

                <MessageList
                    sessionId={activeSessionId}
                    onNewMessageSent={fetchSessions}
                />
            </main>
        </div>
    );
}