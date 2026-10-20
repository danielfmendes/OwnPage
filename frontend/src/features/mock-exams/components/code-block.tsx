import Editor from "@monaco-editor/react"
import { useTheme } from "next-themes"
import { cn } from "@/features/mock-exams/lib/utils"

/** Read-only Monaco editor used purely for syntax-highlighted code display. */
export function CodeBlock({
  code,
  lang = "python",
  className,
}: {
  code: string
  lang?: string
  className?: string
}) {
  const { resolvedTheme } = useTheme()
  const lines = code.split("\n").length
  const height = Math.min(lines * 19 + 16, 440)

  return (
    <div className={cn("overflow-hidden rounded-lg border", className)}>
      <Editor
        height={height}
        language={lang}
        value={code}
        theme={resolvedTheme === "dark" ? "vs-dark" : "vs"}
        loading={<div className="p-3 text-sm text-muted-foreground">Loading code…</div>}
        options={{
          readOnly: true,
          domReadOnly: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: "on",
          fontSize: 13,
          contextmenu: false,
          wordWrap: "on",
          renderLineHighlight: "none",
          overviewRulerLanes: 0,
          scrollbar: { alwaysConsumeMouseWheel: false },
          padding: { top: 8, bottom: 8 },
          automaticLayout: true,
        }}
      />
    </div>
  )
}
