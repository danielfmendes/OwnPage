"use client";

import { useState, useCallback, ReactNode, createContext, useContext, useEffect, useRef } from "react";
import { Notification, NotificationMessage, NotificationType } from "./Notification";

interface NotificationContextType {
    addNotification: (message: string, type: NotificationType, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Cache für die letzten Nachrichten
const messageCache = new Map<string, number>();

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
    const cleanupRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        // Cache alle 2 Sekunden aufräumen
        cleanupRef.current = setInterval(() => {
            const now = Date.now();
            messageCache.forEach((timestamp, key) => {
                if (now - timestamp > 1000) {
                    messageCache.delete(key);
                }
            });
        }, 2000);

        return () => {
            if (cleanupRef.current) {
                clearInterval(cleanupRef.current);
            }
        };
    }, []);

    const removeNotification = useCallback((id: string) => {
        setNotifications((prev) => prev.filter((notification) => notification.id !== id));
    }, []);

    const addNotification = useCallback((
        message: string,
        type: NotificationType,
        duration = 3000
    ) => {
        switch(type) {
            case "error":
                console.error(`[Notification] ${message}`)
                break
            case "warning":
                console.warn(`[Notification] ${message}`)
                break
            default:
                console.log(`[Notification] ${message}`)
        }
        const cacheKey = `${type}:${message}`;
        const now = Date.now();

        // Prüfe ob dieselbe Nachricht innerhalb der letzten Sekunde bereits angezeigt wurde
        if (messageCache.has(cacheKey)) {
            const lastShown = messageCache.get(cacheKey)!;
            if (now - lastShown < 1000) {
                // Aktualisiere nur den Timestamp, zeige keine neue Notification
                messageCache.set(cacheKey, now);
                return;
            }
        }

        // Füge neue Notification hinzu
        const newNotification: NotificationMessage = {
            id: Math.random().toString(36).substring(2, 11),
            message,
            type,
            duration
        };

        messageCache.set(cacheKey, now);
        setNotifications((prev) => [...prev, newNotification]);
    }, []);

    return (
        <NotificationContext.Provider value={{ addNotification }}>
            {children}
            <div className="fixed top-16 left-0 right-0 z-[1000] flex flex-col items-center">
                {notifications.map((notification, index) => (
                    <Notification
                        key={notification.id}
                        message={notification}
                        onDismissAction={removeNotification}
                        className={index > 0 ? "mt-2" : ""}
                    />
                ))}
            </div>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error("useNotification must be used within a NotificationProvider");
    }
    return context;
};

// Ohne Deduplizieren
// "use client";
//
// import { useState, useCallback, ReactNode, createContext, useContext } from "react";
// import { Notification, NotificationMessage, NotificationType } from "./Notification";
//
// interface NotificationContextType {
//     addNotification: (message: string, type: NotificationType, duration?: number) => void;
// }
//
// const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
//
// export const NotificationProvider = ({ children }: { children: ReactNode }) => {
//     const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
//
//     const removeNotification = useCallback((id: string) => {
//         setNotifications((prev) => prev.filter((notification) => notification.id !== id));
//     }, []);
//
//     const addNotification = useCallback((
//         message: string,
//         type: NotificationType,
//         duration = 3000
//     ) => {
//         switch(type) {
//             case "error":
//                 console.error(`[Notification] ${message}`)
//                 break
//             case "warning":
//                 console.warn(`[Notification] ${message}`)
//                 break
//             default:
//                 console.log(`[Notification] ${message}`)
//         }
//         const newNotification: NotificationMessage = {
//             id: Math.random().toString(36).substring(2, 11),
//             message,
//             type,
//             duration
//         };
//
//         setNotifications((prev) => [...prev, newNotification]);
//     }, []);
//
//     return (
//         <NotificationContext.Provider value={{ addNotification }}>
//             {children}
//             <div className="fixed top-16 left-0 right-0 z-[1000] flex flex-col items-center">
//                 {notifications.map((notification, index) => (
//                     <Notification
//                         key={notification.id}
//                         message={notification}
//                         onDismissAction={removeNotification}
//                         className={index > 0 ? "mt-2" : ""}
//                     />
//                 ))}
//             </div>
//         </NotificationContext.Provider>
//     );
// };
//
// export const useNotification = () => {
//     const context = useContext(NotificationContext);
//     if (context === undefined) {
//         throw new Error("useNotification must be used within a NotificationProvider");
//     }
//     return context;
// };