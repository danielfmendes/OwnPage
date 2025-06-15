import {useEffect, useState} from "react";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Button} from "@/components/ui/button";
import {Progress} from "@/components/ui/progress";
import {X} from "lucide-react";
import {cn} from "@/utils/utils";

export type NotificationType = "success" | "warning" | "error" | "info";

export interface NotificationMessage {
    id: string;
    message: string;
    type: NotificationType;
    duration?: number;
}

interface NotificationProps {
    message: NotificationMessage;
    onDismissAction: (id: string) => void;
    className?: string;
}

export const Notification = ({
                                 message,
                                 onDismissAction,
                                 className
                             }: NotificationProps) => {
    const duration = message.duration || 3000;
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                const newProgress = prev - (100 / (duration / 50));
                if (newProgress <= 0) {
                    clearInterval(interval);
                    setTimeout(() => onDismissAction(message.id), 0);
                    return 0;
                }
                return newProgress;
            });
        }, 50);

        return () => clearInterval(interval);
    }, [message.id, onDismissAction, duration]);

    const typeStyles = {
        success: "bg-green-500/90 border-green-600 text-white",
        warning: "bg-yellow-500/90 border-yellow-600 text-white",
        error: "bg-red-500/90 border-red-600 text-white",
        info: "bg-blue-500/90 border-blue-600 text-white"
    };

    const progressStyles = {
        success: "bg-green-300",
        warning: "bg-yellow-300",
        error: "bg-red-300",
        info: "bg-blue-300"
    };

    return (
        <div className={cn(
            "relative w-[75%] max-w-md mx-auto transition-all animate-in fade-in-80 slide-in-from-top-4 sm:w-full",
            className
        )}>
            <Alert className={cn(
                "border-2 shadow-lg p-4 pr-8 overflow-hidden mb-2",
                typeStyles[message.type]
            )}>
                <AlertDescription className="font-medium text-white">
                    {message.message}
                </AlertDescription>
                <Progress
                    value={progress}
                    className={cn(
                        "absolute bottom-0 left-0 right-0 h-1 rounded-b-md",
                        progressStyles[message.type]
                    )}
                />
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-white/20 rounded-full"
                    onClick={() => onDismissAction(message.id)}
                >
                    <X className="h-4 w-4"/>
                </Button>
            </Alert>
        </div>
    );
};