import { ChevronLeft, ChevronRight } from "lucide-react"
import type { ExamState, Question } from "@/features/mock-exams/types"
import { cn } from "@/features/mock-exams/lib/utils"
import { Button } from "@/features/mock-exams/components/ui/button"
import { Card, CardContent } from "@/features/mock-exams/components/ui/card"
import { Progress } from "@/features/mock-exams/components/ui/progress"
import { QuestionCard } from "@/features/mock-exams/components/question-card"

interface ExamViewProps {
  state: ExamState
  byId: Map<string, Question>
  onChange: (next: ExamState) => void
  onSubmit: () => void
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("h-3 w-3 rounded-sm border", className)} />
      {label}
    </span>
  )
}

export function ExamView({ state, byId, onChange, onSubmit }: ExamViewProps) {
  const total = state.questions.length
  const idx = Math.min(state.currentIndex, total - 1)
  const eq = state.questions[idx]
  const question = eq.q ?? byId.get(eq.qid)
  const answered = state.questions.filter((q) => q.selected !== null).length

  if (!question) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          This question is missing from the pool. Please reset the exam.
        </CardContent>
      </Card>
    )
  }

  function update(partial: Partial<ExamState>) {
    onChange({ ...state, ...partial })
  }

  function select(pos: number | null) {
    const questions = state.questions.map((q, i) => (i === idx ? { ...q, selected: pos } : q))
    update({ questions })
  }

  function goto(next: number) {
    const target = Math.min(total - 1, Math.max(0, next))
    const questions = state.questions.map((q, i) => (i === target ? { ...q, visited: true } : q))
    update({ questions, currentIndex: target })
  }

  function handleSubmit() {
    const blanks = total - answered
    const msg =
      blanks > 0
        ? `You have ${blanks} unanswered question${blanks === 1 ? "" : "s"} (they score 0). Submit anyway?`
        : "Submit your exam and see your grade?"
    if (window.confirm(msg)) onSubmit()
  }

  const navigator = (
    <div className="rounded-lg border p-4">
      <p className="mb-3 text-sm font-medium text-muted-foreground">Jump to question</p>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-10 lg:grid-cols-5">
        {state.questions.map((q, i) => {
          const isAnswered = q.selected !== null
          const isSkipped = q.visited && q.selected === null
          return (
            <button
              key={q.qid}
              type="button"
              onClick={() => goto(i)}
              aria-label={`Go to question ${i + 1}`}
              className={cn(
                "flex h-9 items-center justify-center rounded-md border text-sm font-medium transition-colors",
                i === idx && "ring-2 ring-ring",
                isAnswered
                  ? "border-primary bg-primary text-primary-foreground"
                  : isSkipped
                    ? "border-warning bg-warning text-warning-foreground"
                    : "border-input hover:bg-accent"
              )}
            >
              {i + 1}
            </button>
          )
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <LegendDot className="border-primary bg-primary" label="Answered" />
        <LegendDot className="border-warning bg-warning" label="Skipped" />
        <LegendDot className="border-input" label="Untouched" />
      </div>
    </div>
  )

  return (
    <div className="lg:grid lg:grid-cols-[1fr_16rem] lg:items-start lg:gap-6">
      <div className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {answered}/{total} answered
            </span>
            <span>Question {idx + 1} of {total}</span>
          </div>
          <Progress value={((idx + 1) / total) * 100} />
        </div>

        <Card>
          <CardContent className="p-5 sm:p-6">
            <QuestionCard
              question={question}
              order={eq.order}
              selected={eq.selected}
              onSelect={select}
              index={idx + 1}
              total={total}
            />
          </CardContent>
        </Card>

        <div className="flex items-center justify-between gap-3">
          <Button variant="outline" onClick={() => goto(idx - 1)} disabled={idx === 0}>
            <ChevronLeft /> Previous
          </Button>
          <Button variant="outline" onClick={() => goto(idx + 1)} disabled={idx === total - 1}>
            Next <ChevronRight />
          </Button>
        </div>
      </div>

      <aside className="mt-6 space-y-4 lg:sticky lg:top-20 lg:mt-0">
        {navigator}
        <Button className="w-full" onClick={handleSubmit}>
          Submit exam
        </Button>
      </aside>
    </div>
  )
}
