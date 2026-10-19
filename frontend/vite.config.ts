import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import {defineConfig, type Plugin} from "vite"

// Sub-apps served under their own path prefix, each with its own index.html and src/
const subApps = ["apa-quiz", "lisbon-house-prices", "causality-survey", "feedback-pulse"]

// "@/x" resolves to <app>/src/x inside a sub-app, and to src/x everywhere else
function scopedAlias(): Plugin {
    return {
        name: "scoped-alias",
        enforce: "pre",
        async resolveId(source, importer) {
            if (!source.startsWith("@/") || !importer) return null
            const normalized = importer.split(path.sep).join("/")
            const app = subApps.find((name) => normalized.includes(`/frontend/${name}/`))
            const srcDir = app ? path.resolve(__dirname, app, "src") : path.resolve(__dirname, "src")
            return this.resolve(path.join(srcDir, source.slice(2)), importer, {skipSelf: true})
        },
    }
}

// Dev only: deep links such as /apa-quiz/history load that app's index.html
function subAppDeepLinks(): Plugin {
    return {
        name: "sub-app-deep-links",
        configureServer(server) {
            server.middlewares.use((req, _res, next) => {
                const url = req.url ?? ""
                const pathname = url.split("?")[0]
                const app = subApps.find((name) => pathname === `/${name}` || pathname.startsWith(`/${name}/`))
                if (app && !path.extname(pathname)) {
                    req.url = `/${app}/index.html${url.slice(pathname.length)}`
                }
                next()
            })
        },
    }
}

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss(), scopedAlias(), subAppDeepLinks()],
    build: {
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, "index.html"),
                ...Object.fromEntries(
                    subApps.map((name) => [name, path.resolve(__dirname, name, "index.html")]),
                ),
            },
        },
    },
})
