import {useSyncExternalStore} from "react";

const MOBILE_BREAKPOINT = 768

// Re-renders when the viewport crosses the breakpoint
const subscribe = (onChange: () => void) => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
}

const isMobileViewport = () => window.innerWidth < MOBILE_BREAKPOINT

export function useIsMobile() {
    return useSyncExternalStore(subscribe, isMobileViewport, () => false)
}
