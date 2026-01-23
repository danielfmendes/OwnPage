const ALLOWED_ORIGIN = "https://www.danielfreiremendes.com";

export function addCorsHeaders(request: Request, response: Response): Response {
    const origin = request.headers.get("Origin");

    // Neue Response-Instanz erstellen, da Header-Objekte oft immutable sind
    const newResponse = new Response(response.body, response);

    if (origin === ALLOWED_ORIGIN) {
        newResponse.headers.set("Access-Control-Allow-Origin", origin);
        newResponse.headers.set("Vary", "Origin");
        newResponse.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
        newResponse.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        newResponse.headers.set("Access-Control-Allow-Credentials", "true");
    }

    return newResponse;
}