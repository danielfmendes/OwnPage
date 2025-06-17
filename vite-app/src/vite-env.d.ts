/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_URL?: string;
    readonly VITE_VERCEL_URL?: string;
    readonly VITE_PORT?: string;
    // füge hier weitere .env-Variablen hinzu, wenn du mehr verwendest
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
