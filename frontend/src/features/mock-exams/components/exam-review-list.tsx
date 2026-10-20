import { useMemo, useState } from "react"
import { Filter } from "lucide-react"
import type { ExamState, Question } from "@/features/mock-exams/types"
import type { ExamResult } from "@/features/mock-exams/lib/grading"
import { cn } from "@/features/mock-exams/lib/utils"
import { Button } from "@/features/mock-exams/components/ui/button"
import { Badge } from "@/features/mock-exams/components/ui/badge"
import { Card, CardContent } from "@/features/mock-exams/components/ui/card"
import { QuestionCard } from "@/features/mock-exams/components/question-card"

interface ExamReviewListProps {
  state: ExamState
  byId: Map<string, Question>
  result: ExamResult
  defaultOnlyIncorrect?: boolean
}

/** Per-question review (correct / incorrect / unanswered) with a "show only
 * incorrect" filter. Shared by the results and history-detail screens. */
export function ExamReviewList({
  state,
  byId,
  result,
  defaultOnlyIncorrect = false,
}: ExamReviewListProps) {
  const [onlyIncorrect, setOnlyIncorrect] = useState(defaultOnlyIncorrect)
  const byResult = useMemo(
    () => new Map(result.results.map((r) => [r.qid, r])),
    [result]
  )

  const rows = state.questions
    .map((eq, i) => {
      const q = eq.q ?? byId.get(eq.qid)
      if (!q) return null
      const r = byResult.get(eq.qid)
      const status = !r || !r.answered ? "unanswered" : r.correct ? "correct" : "incorrect"
      return { eq, q, status, index: i }
    })
    .filter((row): row is NonNullable<typeof row> => row !== null)

  const wrongCount = rows.filter((r) => r.status !== "correct").length
  const shown = onlyIncorrect ? rows.filter((r) => r.status !== "correct") : rows

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Review</h2>
        <Button
          variant={onlyIncorrect ? "default" : "outline"}
          size="sm"
          onClick={() => setOnlyIncorrect((v) => !v)}
        >
          <Filter /> {onlyIncorrect ? "Showing only wrong" : "Show only wrong"}
        </Button>
      </div>

      {shown.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            {onlyIncorrect && wrongCount === 0
              ? "Nothing wrong here — you got every question right."
              : "No questions to review."}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {shown.map(({ eq, q, status, index }) => (
            <Card
              key={eq.qid}
              className={cn(
                "border-l-4",
                status === "correct" && "border-l-success",
                status === "incorrect" && "border-l-destructive",
                status === "unanswered" && "border-l-warning"
              )}
            >
              <CardContent className="p-5 sm:p-6">
                <div className="mb-3">
                  {status === "correct" && <Badge variant="success">Correct</Badge>}
                  {status === "incorrect" && <Badge variant="destructive">Incorrect</Badge>}
                  {status === "unanswered" && <Badge variant="warning">Not answered</Badge>}
                </div>
                <QuestionCard
                  question={q}
                  order={eq.order}
                  selected={eq.selected}
                  revealed
                  index={index + 1}
                  total={state.questions.length}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
