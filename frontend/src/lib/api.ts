export const API_BASE: string =
    (import.meta.env.VITE_API_ENV as string | undefined) || "http://localhost:8080";

export class ApiError extends Error {
    status?: number;

    constructor(message: string, status?: number) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

// A JSON API answering with HTML means the request never reached the Worker
// (e.g. /api/* is not routed, so the static site served index.html).
export async function apiFetch<T = unknown>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, init);
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
        throw new ApiError(
            `API unreachable: ${path} returned ${response.status} ${contentType || "no content-type"} instead of JSON. Check that the /api/* route points at the Worker.`,
            response.status,
        );
    }
    const body = (await response.json()) as T;
    if (!response.ok) {
        throw new ApiError(`Request failed: ${response.status} ${response.statusText}`, response.status);
    }
    return body;
}
