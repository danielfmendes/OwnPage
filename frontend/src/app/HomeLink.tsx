import { Home } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

// Link back to the main site. Hidden on the home page itself.
export function HomeLink({ className }: { className?: string }) {
    const { pathname } = useLocation()
    if (pathname === "/") return null

    return (
        <Link
            to="/"
            aria-label="Back to home"
            className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground ${className ?? ""}`}
        >
            <Home className="h-3.5 w-3.5"/>
            <span>Home</span>
        </Link>
    )
}
