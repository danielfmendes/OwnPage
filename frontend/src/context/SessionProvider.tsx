import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "@/components/helpers/NotificationProvider";
import { handleLogOut } from "@/utils/helpers";
import { OpenAPI } from "@/models/api/core/OpenAPI";

interface SessionContextType {
    timeRemaining: number;
    resetActivity: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const SESSION_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const REFRESH_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutes before expiry
const ACTIVITY_DEBOUNCE_MS = 1000; // Throttle actvity updates to max once per second

export function SessionProvider({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
    const { addNotification } = useNotification();
    const [lastRefresh, setLastRefresh] = useState<number>(Date.now());
    const [timeRemaining, setTimeRemaining] = useState<number>(SESSION_TIMEOUT_MS);
    const activityRef = useRef<number>(Date.now());

    // Debounced activity updater
    const updateActivity = useCallback(() => {
        const now = Date.now();
        if (now - activityRef.current > ACTIVITY_DEBOUNCE_MS) {
            activityRef.current = now;
        }
    }, []);

    const resetActivity = useCallback(() => {
        updateActivity();
    }, [updateActivity]);

    // Attach global event listeners
    useEffect(() => {
        const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];

        events.forEach(event => {
            window.addEventListener(event, updateActivity, { passive: true });
        });

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, updateActivity);
            });
        };
    }, [updateActivity]);

    // Timer logic - runs every second
    useEffect(() => {
        const intervalId = setInterval(async () => {
            const now = Date.now();
            const timeSinceLastActivity = now - activityRef.current;
            const remaining = Math.max(0, SESSION_TIMEOUT_MS - timeSinceLastActivity);
            setTimeRemaining(remaining);

            // 1. Session timeout reached
            if (remaining <= 0) {
                clearInterval(intervalId);
                await handleLogOut(navigate, addNotification);
                addNotification(
                    "You have been logged out due to inactivity.",
                    "info"
                );
                return;
            }

            // 2. Token refresh logic
            // The token is valid for 15 minutes total.
            // If we are within 2 minutes of the token expiring (meaning 13 minutes have passed since lastRefresh)
            // AND the user is still active (they haven't been logged out by #1)
            // THEN we refresh the token.
            const timeSinceLastRefresh = now - lastRefresh;
            if (timeSinceLastRefresh > (SESSION_TIMEOUT_MS - REFRESH_THRESHOLD_MS)) {
                // Time to refresh the token
                try {
                    const response = await fetch(`${OpenAPI.BASE}/dwh/auth/refresh`, {
                        method: 'POST',
                        credentials: 'include',
                    });

                    if (response.ok) {
                        // Reset the refresh timer. The new token is good for another 15 minutes.
                        setLastRefresh(now);
                    } else {
                        // Refresh failed (e.g., token already expired slightly early on backend, or network error)
                        // We might want to force logout here, but letting it ride allows the next 
                        // API call to hit the 401 handler built into OpenAPI request.ts
                        console.warn("SessionProvider: Failed to proactively refresh token.");
                    }
                } catch (error) {
                    console.error("SessionProvider: Error refreshing token:", error);
                }
            }
        }, 1000);

        return () => clearInterval(intervalId);
    }, [lastRefresh, navigate, addNotification]);


    return (
        <SessionContext.Provider value={{ timeRemaining, resetActivity }}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    const context = useContext(SessionContext);
    if (context === undefined) {
        throw new Error("useSession must be used within a SessionProvider");
    }
    return context;
}
