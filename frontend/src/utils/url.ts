import AuthToken from "./authtoken";
import {useRoleStore} from "@/utils/rolemananagemetstate";
const token = AuthToken.getAuthToken();
let apiUrl: string;

if (process.env.NODE_ENV === "production") {
    apiUrl = "https://ownpage-production.up.railway.app";
} else {
    apiUrl = "http://localhost:8080";
}

// Hilfsmethode für GET-Anfragen mit Bearer Token
export const fetchWithToken = async (endpoint: string, force = false) => {
    let finalEndpoint = endpoint;

    if (!force) {
        const waitForRoles = async (maxWaitMs = 5000, intervalMs = 100): Promise<void> => {
            const start = Date.now();
            while (useRoleStore.getState().roles.length === 0) {
                if (Date.now() - start > maxWaitMs) {
                    throw new Error("Timeout: roles remain empty.");
                }
                await new Promise((resolve) => setTimeout(resolve, intervalMs));
            }
        };

        await waitForRoles();

        const selectedRoles = useRoleStore.getState().selectedRoles;
        if (selectedRoles.length > 0) {
            const projectIds = selectedRoles
                .map((role) => role.project_id)
                .sort((a, b) => a - b)
                .join("|");

            const separator = endpoint.includes("?") ? "&" : "?";
            finalEndpoint = `${endpoint}${separator}project_id=${projectIds}`;
        }
    }

    const response = await fetch(`${apiUrl}${finalEndpoint}`, {
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
