import { Home } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

// Quiet link back to the main site. Hidden on the home page itself.
export function HomeLink({ className }: { className?: string }) {
    const { pathname } = useLocation()
    if (pathname === "/") return null

    return (
        <Link
            to="/"
            aria-label="Back to home"
            className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs text-muted-foreground transition-colors hover:text-foreground ${className ?? ""}`}
        >
            <Home className="h-3.5 w-3.5"/>
            <span className="hidden sm:inline">Home</span>
        </Link>
    )
}
