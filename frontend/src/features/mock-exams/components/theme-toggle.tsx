import { Moon, Sun } from "lucide-react"
import { Button } from "@/features/mock-exams/components/ui/button"
import { useTheme } from "@/features/mock-exams/components/theme-provider"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  )
}
