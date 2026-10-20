import "./index.css"
import App from "./App"
import { ThemeProvider } from "./components/theme-provider"

export default function HousePrices() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  )
}
