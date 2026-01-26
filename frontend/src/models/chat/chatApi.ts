import apiUrl from "@/utils/helpers.ts";

export interface Session {
    id: string;
    title: string;
}

export interface Message {
    role: "user" | "assistant";
    content: string;
}

class ChatApiClient {
    private get token() {
        return localStorage.getItem("chat_token");
    }

    /**
     * Helper to construct standard headers with Auth token
     */
    private get headers() {
        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };
        const token = this.token;
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
        return headers;
    }

    /**
     * Generic fetch wrapper to handle errors and JSON parsing
     */
    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const res = await fetch(`${apiUrl}${endpoint}`, {
            ...options,
            headers: {...this.headers, ...options.headers},
        });

        if (!res.ok) {
            throw new Error(`API Error: ${res.statusText}`);
        }

        return res.json();
    }

    async login(credentials: { email: string; password?: string }) {
        return this.request<{ token: string }>("/chat/auth/login", {
            method: "POST",
            body: JSON.stringify(credentials),
        });
    }

    async register(data: { email: string; password: string; ai_mode: string }) {
        return this.request<{ token: string }>("/chat/auth/register", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    async getSessions() {
        return this.request<Session[]>("/chat/sessions");
    }

    async createSession() {
        return this.request<Session>("/chat/sessions", {
            method: "POST",
        });
    }

    async getHistory(sessionId: string) {
        return this.request<Message[]>(`/chat/history?sessionId=${sessionId}`);
    }

    /**
     * Returns the raw response for streaming implementation in the component.
     * We don't use the generic wrapper here because we need the ReadableStream, not JSON.
     */
    async streamMessage(sessionId: string, message: string): Promise<Response> {
        const res = await fetch(`${apiUrl}/chat/stream`, {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify({sessionId, message}),
        });

        if (!res.ok) throw new Error("Stream API Error");
        return res;
    }
}

export const chatApi = new ChatApiClient();