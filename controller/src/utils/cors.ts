export function addCorsHeaders(request: Request, response: Response): Response {
    const origin = request.headers.get("Origin");
    const newResponse = new Response(response.body, response);

    const allowedOrigins = [
        "https://danielfreiremendes.com",
        "http://localhost:5173"
    ];

    if (origin && allowedOrigins.includes(origin)) {
        newResponse.headers.set("Access-Control-Allow-Origin", origin);
        newResponse.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
        newResponse.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        newResponse.headers.set("Access-Control-Allow-Credentials", "true");
    }

    return newResponse;
}