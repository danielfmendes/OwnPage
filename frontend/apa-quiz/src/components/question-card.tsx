import { Check, X } from "lucide-react"
import type { Question } from "@/types"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Markdown } from "@/components/markdown"
import { CodeBlock } from "@/components/code-block"
import { CATEGORY_LABELS } from "@/lib/categories"

interface QuestionCardProps {
  question: Question
  /** displayed position -> original option index */
  order: number[]
  /** displayed position the user picked, or null */
  selected: number | null
  onSelect?: (pos: number | null) => void
  /** when true: lock input, show correctness colours + explanation */
  revealed?: boolean
  index?: number
  total?: number
}

export function QuestionCard({
  question,
  order,
  selected,
  onSelect,
  revealed = false,
  index,
  total,
}: QuestionCardProps) {
  const typeLabel =
    question.type === "tf"
      ? "True / False"
      : question.type === "code"
        ? "Spot the bug"
        : "Multiple choice"

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {index != null && total != null && (
          <span className="text-sm font-medium text-muted-foreground">
            Question {index} of {total}
          </span>
        )}
        <Badge variant="secondary">{typeLabel}</Badge>
        <Badge variant="outline">{CATEGORY_LABELS[question.category]}</Badge>
        {question.calculation && <Badge variant="outline">Calculation</Badge>}
      </div>

      <div className="text-base font-medium sm:text-lg">
        <Markdown>{question.question}</Markdown>
      </div>

      {question.code && <CodeBlock code={question.code} lang={question.codeLang} />}

      <div className="space-y-2.5">
        {order.map((originalIndex, pos) => {
          const isSelected = selected === pos
          const isCorrect = originalIndex === question.correctIndex
          const letter = String.fromCharCode(65 + pos)

          const state = revealed
            ? isCorrect
              ? "correct"
              : isSelected
                ? "wrong"
                : "idle"
            : isSelected
              ? "selected"
              : "idle"

          return (
            <button
              key={originalIndex}
              type="button"
              disabled={revealed}
              onClick={() => onSelect?.(isSelected ? null : pos)}
              className={cn(
                "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors sm:p-4",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                !revealed && "hover:bg-accent hover:text-accent-foreground cursor-pointer",
                state === "selected" && "border-primary bg-accent ring-1 ring-primary",
                state === "correct" &&
                  "border-success bg-success/10 text-foreground ring-1 ring-success",
                state === "wrong" &&
                  "border-destructive bg-destructive/10 text-foreground ring-1 ring-destructive",
                state === "idle" && "border-input"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                  state === "selected" && "border-primary bg-primary text-primary-foreground",
                  state === "correct" && "border-success bg-success text-success-foreground",
                  state === "wrong" && "border-destructive bg-destructive text-destructive-foreground",
                  state === "idle" && "border-input text-muted-foreground"
                )}
              >
                {state === "correct" ? (
                  <Check className="h-4 w-4" />
                ) : state === "wrong" ? (
                  <X className="h-4 w-4" />
                ) : (
                  letter
                )}
              </span>
              <span className="flex-1 pt-0.5">
                <Markdown inline>{question.options[originalIndex]}</Markdown>
              </span>
            </button>
          )
        })}
      </div>

      {!revealed && selected !== null && onSelect && (
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Clear selection
        </button>
      )}

      {revealed && (
        <div className="rounded-lg border bg-muted/50 p-4">
          <p className="mb-1 text-sm font-semibold">Explanation</p>
          <div className="text-sm text-muted-foreground">
            <Markdown>{question.explanation}</Markdown>
          </div>
        </div>
      )}
    </div>
  )
}
