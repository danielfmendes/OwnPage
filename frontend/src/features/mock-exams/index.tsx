import "katex/dist/katex.min.css"
import "./index.css"
import { App } from "./App"
import { ThemeProvider } from "./components/theme-provider"

export default function MockExams() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  )
}
