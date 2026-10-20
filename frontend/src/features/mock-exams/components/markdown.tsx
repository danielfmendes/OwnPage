import type { Components } from "react-markdown"
import ReactMarkdown from "react-markdown"
import remarkMath from "remark-math"
import remarkGfm from "remark-gfm"
import rehypeKatex from "rehype-katex"
import { cn } from "@/features/mock-exams/lib/utils"

const blockClasses = cn(
  "space-y-2 leading-relaxed break-words",
  "[&_p]:m-0",
  "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5",
  "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.875em]",
  "[&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:text-sm",
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
  "[&_strong]:font-semibold [&_table]:text-sm [&_th]:px-2 [&_th]:text-left [&_td]:px-2"
)

const inlineClasses = cn(
  "break-words",
  "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.875em]",
  "[&_strong]:font-semibold"
)

// In inline mode, render paragraphs as spans so the output is valid phrasing
// content (it lives inside a <button>). Option text is always short.
const inlineComponents: Components = {
  p: ({ children }) => <>{children}</>,
}

/**
 * Renders question / option / explanation text. Supports GitHub-flavoured
 * markdown, fenced code blocks and `$...$` / `$$...$$` math via KaTeX.
 */
export function Markdown({
  children,
  className,
  inline = false,
}: {
  children: string
  className?: string
  inline?: boolean
}) {
  const content = (
    <ReactMarkdown
      remarkPlugins={[remarkMath, remarkGfm]}
      rehypePlugins={[rehypeKatex]}
      components={inline ? inlineComponents : undefined}
    >
      {children}
    </ReactMarkdown>
  )

  if (inline) {
    return <span className={cn(inlineClasses, className)}>{content}</span>
  }
  return <div className={cn(blockClasses, className)}>{content}</div>
}
