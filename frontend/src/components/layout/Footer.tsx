import {NavLink} from "react-router-dom"
import {useTranslation} from "react-i18next"

export function Footer() {
    const {t} = useTranslation()
    const year = new Date().getFullYear()

    const getNavLinkClass = (isActive: boolean) =>
        `underline md:no-underline hover:underline${isActive ? " text-foreground font-medium" : ""}`

    return (
        <footer className="border-t pt-4 pb-4 text-sm text-muted-foreground">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 px-4 sm:px-6 lg:px-8">
                <p className="text-center md:text-left">
                    &copy; {year} NebulaDW. <br className="md:hidden"/>
                    {t("label.rightsReserved")}
                </p>

                <div className="flex justify-center md:justify-end gap-4">
                    <NavLink
                        to="/dwh/imprint"
                        className={({isActive}) => getNavLinkClass(isActive)}
                    >
                        {t("imprint.title")}
                    </NavLink>
                    <NavLink
                        to="/dwh/privacy"
                        className={({isActive}) => getNavLinkClass(isActive)}
                    >
                        {t("privacy.title")}
                    </NavLink>
                </div>
            </div>
        </footer>
    )
}
