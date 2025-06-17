import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {BookA, Check, ChevronDown, ChevronRight, LogOut, User as UserIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {useTheme} from "next-themes";
import {MoonIcon, SunIcon} from "lucide-react";
import {Loader2} from "lucide-react";
import {useUserStore} from "@/utils/userstate";
import {handleLogOut} from "@/utils/helpers";
import {useNotification} from "@/components/helpers/NotificationProvider";
import {useTranslation} from "react-i18next";
import Language from "@/utils/language";

export function UserNav() {
    const {t, i18n} = useTranslation();
    const {setTheme, theme} = useTheme();
    const {addNotification} = useNotification();
    const navigate = useNavigate();
    const urlParams = new URLSearchParams(window.location.search);
    const currentQuery = urlParams.get('project_id') ? `?project_id=${urlParams.get('project_id')}` : "";
    const user = useUserStore((state) => state.user);
    const isLoading = useUserStore((state) => state.isLoading);

    const handleLogout = () => {
        handleLogOut(navigate, addNotification);
    };

    const [showLanguageCard, setShowLanguageCard] = useState(false)
    const currentLang = i18n.language.toUpperCase();

    // See flags here: https://github.com/HatScripts/circle-flags/tree/gh-pages/flags
    const languages = [
        {code: "en", label: "English", flag: "/flags/gb.svg"},
        {code: "de", label: "Deutsch", flag: "/flags/de.svg"},
        {code: "pt", label: "Português", flag: "/flags/pt.svg"},
    ];

    return (
        <DropdownMenu>
            <TooltipProvider disableHoverableContent>
                <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="relative h-8 w-8 rounded-full"
                                disabled={isLoading}
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src="#" alt="Avatar"/>
                                    <AvatarFallback className="bg-transparent">
                                        {isLoading ? (
                                            <Loader2 className="animate-spin h-4 w-4 text-muted-foreground"/>
                                        ) : (
                                            user?.username
                                                ?.split(" ")
                                                .map((word) => word.charAt(0).toUpperCase())
                                                .slice(0, 2)
                                                .join("")
                                        )}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">{t("menu.profile")}</TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.username}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator/>
                <DropdownMenuGroup>
                    <DropdownMenuItem className="hover:cursor-pointer" asChild>
                        <Link to={`/dwh/rolemanagement${currentQuery}`} className="flex items-center">
                            <UserIcon className="w-4 h-4 mr-3 text-muted-foreground"/>
                            {t("menu.role_management")}
                        </Link>
                    </DropdownMenuItem>

                    <div
                        className="flex items-center justify-between px-2 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-md"
                        onClick={(e) => {
                            e.stopPropagation()
                            setShowLanguageCard(!showLanguageCard)
                        }}
                    >
                        <div className="flex items-center">
                            <BookA className="w-4 h-4 mr-3 text-muted-foreground"/>
                            {t("placeholder.language")}
                        </div>
                        <div className="flex items-center space-x-1 text-muted-foreground">
                            <span className="text-xs font-medium">{currentLang}</span>
                            {showLanguageCard ? (
                                <ChevronDown className="w-4 h-4"/>
                            ) : (
                                <ChevronRight className="w-4 h-4"/>
                            )}
                        </div>
                    </div>
                    {showLanguageCard && (
                        <div className="p-2 pt-1">
                            {languages.map((lang) => (
                                <Button
                                    key={lang.code}
                                    variant="ghost"
                                    className="w-full justify-start space-x-2"
                                    onClick={() => {
                                        i18n.changeLanguage(lang.code);
                                        Language.setLanguage(lang.code);
                                        setShowLanguageCard(false);
                                    }}
                                >
                                    <img src={lang.flag} alt={lang.label} className="w-5 h-5 rounded-full"/>
                                    <span className="flex-1 text-left">{lang.label}</span>
                                    {i18n.language === lang.code && (
                                        <Check className="w-4 h-4 text-green-500 ml-auto"/>
                                    )}
                                </Button>
                            ))}
                        </div>
                    )}

                    <DropdownMenuItem className="hover:cursor-pointer" asChild>
                        <div onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                            {theme === "dark" ? (
                                <SunIcon className="w-4 h-4 mr-3 text-muted-foreground"/>
                            ) : (
                                <MoonIcon className="w-4 h-4 mr-3 text-muted-foreground"/>
                            )}
                            {t("switch_theme")}
                        </div>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator/>
                <DropdownMenuItem onClick={handleLogout} className="hover:cursor-pointer">
                    <LogOut className="w-4 h-4 mr-3 text-muted-foreground"/>
                    {t("button.sign_out")}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
