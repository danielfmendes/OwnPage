class Language {
    static getLanguage(): string | undefined {
        return localStorage.getItem('language') || undefined;
    }

    static setLanguage(language: string): void {
        localStorage.setItem('language', language);
    }

    static removeLanguage(): void {
        localStorage.removeItem('language');
    }
}

export default Language;