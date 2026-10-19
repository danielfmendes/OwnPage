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
    /**
     * Sends a request with the shared login cookie. On 401 it refreshes the session once and retries.
     * If the session is still invalid, the user is sent to the shared login.
     */
    private async send(endpoint: string, options: RequestInit = {}): Promise<Response> {
        const doFetch = () =>
            fetch(`${apiUrl}${endpoint}`, {
                ...options,
                credentials: "include",
                headers: {"Content-Type": "application/json", ...options.headers},
            });

        let res = await doFetch();
        if (res.status === 401 && await this.refresh()) {
            res = await doFetch();
        }
        if (res.status === 401) {
            window.location.href = "/login?next=/chat";
        }
        return res;
    }

    private async refresh(): Promise<boolean> {
        try {
            const res = await fetch(`${apiUrl}/auth/refresh`, {method: "POST", credentials: "include"});
            return res.ok;
        } catch {
            return false;
        }
    }

    /**
     * Generic fetch wrapper to handle errors and JSON parsing
     */
    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const res = await this.send(endpoint, options);

        if (!res.ok) {
            throw new Error(`API Error: ${res.statusText}`);
        }

        return res.json();
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
        const res = await this.send("/chat/stream", {
            method: "POST",
            body: JSON.stringify({sessionId, message}),
        });

        if (!res.ok) throw new Error("Stream API Error");
        return res;
    }
}

export const chatApi = new ChatApiClient();
