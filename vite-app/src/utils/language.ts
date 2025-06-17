import Cookies from "js-cookie";

class Language {
    static getLanguage(): string | undefined {
        return Cookies.get('language');
    }

    static setLanguage(language: string): void {
        Cookies.set('language', language, { expires: 1 }); // 1 Day
    }

    static removeLanguage(): void {
        Cookies.remove('language');
    }
}

export default Language;