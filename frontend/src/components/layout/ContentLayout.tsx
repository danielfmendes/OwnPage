import Cookies from "js-cookie";
import {useState, useEffect} from "react";
import {SidebarProvider, useSidebar} from "@/components/ui/sidebar";
import {DwhSidebar} from "@/components/layout/DwhSidebar";
import {Navbar} from "@/components/layout/Navbar";
import {Button} from "@/components/ui/button";
import {ChevronLeft, ChevronRight, Menu} from "lucide-react";
import {useIsMobile} from "@/utils/use-mobile";
import {Footer} from "@/components/layout/Footer";

const SIDEBAR_COOKIE_KEY = "sidebar_state";

interface ContentLayoutProps {
    title?: string;
    children: React.ReactNode;
    className?: string;
}

export default function ContentLayout({title, children, className}: ContentLayoutProps) {
    const [isOpen, setIsOpen] = useState<boolean | null>(null);

    useEffect(() => {
        const cookie = Cookies.get(SIDEBAR_COOKIE_KEY);
        setIsOpen(cookie === "true");
    }, []);

    if (isOpen === null) return null;

    return (
        <SidebarProvider open={isOpen}>
            <LayoutContent title={title} isOpen={isOpen} setIsOpen={setIsOpen}>
                <div className={`${className ? ` ${className}` : ""}`}>
                    {children}
                </div>
            </LayoutContent>
        </SidebarProvider>
    );
}

interface LayoutContentProps {
    title?: string;
    isOpen: boolean;
    setIsOpen: (val: boolean) => void;
    children: React.ReactNode;
}

function LayoutContent({title, isOpen, setIsOpen, children}: LayoutContentProps) {
    const {toggleSidebar, openMobile} = useSidebar();
    const isMobile = useIsMobile();
    const leftPosition = isOpen ? 256 : 48;

    const updateSidebarState = (next: boolean) => {
        Cookies.set(SIDEBAR_COOKIE_KEY, String(next));
        setIsOpen(next);
    };

    useEffect(() => {
        if (isMobile) {
            updateSidebarState(openMobile);
        }
    }, [isMobile, openMobile]);

    const handleToggleSidebar = () => {
        const next = !isOpen;
        updateSidebarState(next);
        toggleSidebar();
    };

    return (
        <>
            <DwhSidebar isOpen={isOpen}/>
            <div className="flex flex-col flex-1">
                <Navbar title={title}>
                    {isMobile && (
                        <Button
                            onClick={handleToggleSidebar}
                            variant="outline"
                            size="icon"
                            aria-label="Toggle Sidebar"
                        >
                            <Menu className="h-4 w-4"/>
                        </Button>
                    )}
                </Navbar>

                {!isMobile && (
                    <Button
                        onClick={handleToggleSidebar}
                        aria-label="Toggle Sidebar"
                        className="absolute top-10 -translate-x-1/2 rounded-md border border-input shadow-sm
                                   dark:bg-[var(--sidebar)]
                                   dark:hover:bg-muted
                                   text-foreground hover:text-accent-foreground
                                   focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
                                   disabled:pointer-events-none disabled:opacity-50
                                   w-8 h-8 flex items-center justify-center"
                        style={{zIndex: 50, left: `${leftPosition}px`}}
                        variant="outline"
                        size="icon"
                        data-sidebar="trigger"
                        data-slot="sidebar-trigger"
                    >
                        {isOpen ? (
                            <ChevronLeft className="h-4 w-4"/>
                        ) : (
                            <ChevronRight className="h-4 w-4"/>
                        )}
                    </Button>
                )}

                <main className="flex-1 py-4 px-8">{children}</main>
                <Footer/>
            </div>
        </>
    );
}
