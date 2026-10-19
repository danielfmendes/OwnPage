const API_URL = `${import.meta.env.VITE_API_ENV ?? 'http://localhost:8080'}/feedback-pulse`;

export interface FeedbackItem {
    id: string;
    content: string;
    source: string;
    author: string;
    original_timestamp: string;
    created_at: string;
    sentiment_score: 'positive' | 'negative' | 'neutral';
    urgency_score: number;
    summary: string;
    root_cause: string;
    suggested_fix: string;
}

export interface DashboardStats {
    total: number;
    critical: number;
    top_sentiment: string;
}

// Generic helper to reduce boilerplate & handle defaults
const request = async <T>(path: string, options?: RequestInit, defaultVal?: T): Promise<T> => {
    try {
        const res = await fetch(`${API_URL}${path}`, {
            headers: {'Content-Type': 'application/json'}, ...options
        });
        if (!res.ok) throw new Error(res.statusText);
        return await res.json();
    } catch (e) {
        console.error(`Fetch error ${path}:`, e);
        if (defaultVal !== undefined) return defaultVal;
        throw e;
    }
};

export const api = {
    ingest: (payload: any) => request<{ success: boolean; id: string }>('/ingest', {
        method: 'POST',
        body: JSON.stringify(payload)
    }),

    getStats: () => request<DashboardStats>('/stats', {}, {total: 0, critical: 0, top_sentiment: '-'}),
    getList: () => request<FeedbackItem[]>('/list', {}, []),
    getDetail: (id: string) => request<FeedbackItem | null>(`/issue/${id}`, {}, null),
    getCharts: () => request<{ sentiment_score: string, count: number }[]>('/charts', {}, []),
    getStatus: (id: string) => request<{ status: string }>(`/status/${id}`, {}, {status: 'unknown'})
};