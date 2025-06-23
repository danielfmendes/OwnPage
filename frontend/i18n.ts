import i18n from "i18next"
import {initReactI18next} from "react-i18next"

import en from "@/config/languages/en.json"
import de from "@/config/languages/de.json"
import pt from "@/config/languages/pt.json"

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: {common: en},
            de: {common: de},
            pt: {common: pt}
        },
        lng: "en", // Startsprache
        fallbackLng: "en",
        ns: ["common"],
        defaultNS: "common",
        interpolation: {escapeValue: false}
    })

export default i18n