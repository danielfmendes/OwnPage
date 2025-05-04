import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ButtonHTMLAttributes, ReactNode } from "react"

type ButtonLoadingProps = {
    isLoading: boolean
    onClick: ((event: React.MouseEvent<HTMLButtonElement>) => void) | (() => void)
    children: ReactNode
    loadingText?: string
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>

export function ButtonLoading({ isLoading, onClick, children, loadingText, ...props }: ButtonLoadingProps) {
    return (
        <Button
            onClick={onClick}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {loadingText ? <div className="ml-2">{loadingText}</div>: null}
                </>
            ) : (
                children
            )}
        </Button>
    )
}
