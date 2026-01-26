import {Link, NavLink, useLocation} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {GithubIcon, LinkedinIcon} from "lucide-react";
import {social_links} from "@/config/personal.tsx";

export function Footer() {
    const location = useLocation();
    const isHomePage = location.pathname === "/";
    const isDwhContext = location.pathname.startsWith("/dwh") || location.state?.fromDwh === true;
    const {t} = useTranslation();
    const year = new Date().getFullYear();

    const getNavLinkClass = (isActive: boolean) =>
        `hover:text-foreground transition-colors ${
            isActive ? "text-foreground font-medium" : ""
        }`;

    return (
        <footer className="border-t bg-background">
            <div
                className="max-w-7xl mx-auto px-6 py-4 md:py-0 md:h-14 flex flex-col md:flex-row items-center justify-between text-[10px] sm:text-xs text-muted-foreground gap-4 md:gap-0">

                <div className="flex items-center gap-2">
                    {isHomePage ? (
                        <span className="font-semibold text-foreground whitespace-nowrap">
                            Daniel Freire Mendes
                        </span>
                    ) : (
                        <Link
                            to="/"
                            className="font-semibold text-foreground whitespace-nowrap hover:text-primary transition-colors"
                        >
                            Daniel Freire Mendes
                        </Link>
                    )}
                    <span className="hidden sm:inline">|</span>
                    <span className="whitespace-nowrap">&copy; {year} {t("label.rightsReserved")}</span>
                </div>

                <div className="flex items-center gap-4 sm:gap-6">
                    <nav className="flex items-center gap-3 sm:gap-4">
                        <NavLink
                            to="/imprint"
                            state={{fromDwh: isDwhContext}}
                            className={({isActive}) => getNavLinkClass(isActive)}
                        >
                            {t("imprint.title")}
                        </NavLink>

                        <NavLink
                            to="/privacy"
                            state={{fromDwh: isDwhContext}}
                            className={({isActive}) => getNavLinkClass(isActive)}
                        >
                            {t("privacy.title")}
                        </NavLink>
                    </nav>

                    <div className="w-px h-4 bg-border"/>

                    <div className="flex items-center gap-3">
                        <a href={social_links.github} target="_blank" rel="noopener noreferrer"
                           className="hover:text-foreground transition-colors">
                            <GithubIcon size={16}/>
                        </a>
                        <a href={social_links.linkedin} target="_blank" rel="noopener noreferrer"
                           className="hover:text-foreground transition-colors">
                            <LinkedinIcon size={16}/>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}