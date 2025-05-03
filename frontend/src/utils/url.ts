import AuthToken from "./authtoken";
const token = AuthToken.getAuthToken();
let apiUrl: string;

if (process.env.NODE_ENV === "production") {
    apiUrl = "https://ownpage-production.up.railway.app";
} else {
    apiUrl = "http://localhost:8080";
}

// Hilfsmethode für GET-Anfragen mit Bearer Token
export const fetchWithToken = async (endpoint: string) => {
    const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Fehler bei der Anfrage: ${response.statusText}`);
    }

    return response;
};

export default apiUrl;
