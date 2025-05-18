import AuthToken from "./authtoken";
import {useRoleStore} from "@/utils/rolemananagemetstate";

const token = AuthToken.getAuthToken();
const apiUrl = process.env.NEXT_PUBLIC_API_ENV || "http://localhost:8080";

export const handleFetchError = async (response: Response, method: string) => {
    const errorMessage = await response.text();
    const defaultMessage= `Error during the ${method}-request`
    throw new Error(errorMessage || defaultMessage);
};

export const fetchWithToken = async (endpoint: string, force = false) => {
    let finalEndpoint = endpoint;

    if (!force) {
        const waitForRoles = async (maxWaitMs = 1000, intervalMs = 100): Promise<void> => {
            const start = Date.now();
            while (useRoleStore.getState().roles.length === 0) {
                if (Date.now() - start > maxWaitMs) {
                    return;
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
        await handleFetchError(response, "GET");
    }

    return response.json();
};

export const fetchWithBodyAndToken = async (method: string, endpoint: string, body: any) => {
    const response = await fetch(`${apiUrl}${endpoint}`, {
        method,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        await handleFetchError(response, method);
    }

    return response;
};

export const deleteWithToken = async (endpoint: string, suppressError: boolean = false) => {
    const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok && !suppressError) {
        await handleFetchError(response, "DELETE");
    }

    return response;
};

export default apiUrl;
