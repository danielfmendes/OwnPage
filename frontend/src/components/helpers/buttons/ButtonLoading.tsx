import {Loader2} from "lucide-react"
import {Button} from "@/components/ui/button"
import type {ButtonHTMLAttributes, ReactNode} from "react"

type ButtonLoadingProps = {
    isLoading: boolean;
    onClick?: ((event: React.MouseEvent<HTMLButtonElement>) => void) | (() => void);
    variant?: "default" | "outline" | "secondary" | "destructive";
    size?: "default" | "sm" | "lg" | "icon";
    children?: ReactNode;
    loadingText?: string;
    loadingTextPosition?: "left" | "right";
    id?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>;

export function ButtonLoading({
                                  isLoading,
                                  onClick,
                                  variant,
                                  size,
                                  children,
                                  loadingText,
                                  loadingTextPosition = "left",
                                  id,
                                  ...props
                              }: ButtonLoadingProps) {
    return (
        <Button
            {...(id ? {id} : {})}
            onClick={onClick}
            disabled={isLoading || props.disabled}
            variant={variant}
            size={size}
            className={!loadingText ? "min-w-[40px] h-[40px]" : ""}
            {...props}
        >
            {isLoading ? (
                <div className="flex items-center gap-2">
                    {loadingTextPosition === "left" && loadingText && (
                        <div>{loadingText}</div>
                    )}
                    <Loader2 className="h-5 w-5 animate-spin"/>
                    {loadingTextPosition === "right" && loadingText && (
                        <div>{loadingText}</div>
                    )}
                </div>
            ) : (
                children
            )}
        </Button>
    );
}
