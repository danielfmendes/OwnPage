import { useMemo } from "react"
import { ArrowLeft, Home } from "lucide-react"
import type { ExamHistoryEntry, Question } from "@/features/mock-exams/types"
import { scoreExam } from "@/features/mock-exams/lib/grading"
import { Button } from "@/features/mock-exams/components/ui/button"
import { ExamScoreCard } from "@/features/mock-exams/components/exam-score-card"
import { ExamReviewList } from "@/features/mock-exams/components/exam-review-list"

interface HistoryDetailViewProps {
  entry: ExamHistoryEntry
  byId: Map<string, Question>
  onBack: () => void
  onHome: () => void
}

function formatWhen(ms: number): string {
  return new Date(ms).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
}

export function HistoryDetailView({ entry, byId, onBack, onHome }: HistoryDetailViewProps) {
  const result = useMemo(() => scoreExam(entry.state, byId), [entry, byId])

  const actions = (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
      <Button variant="outline" onClick={onBack}>
        <ArrowLeft /> Back to history
      </Button>
      <Button variant="outline" onClick={onHome}>
        <Home /> Home
      </Button>
    </div>
  )

  return (
    <div className="space-y-6">
      <p className="text-center text-sm text-muted-foreground">
        Taken {formatWhen(entry.completedAt)}
      </p>

      <ExamScoreCard result={result} total={entry.state.questions.length}>
        {actions}
      </ExamScoreCard>

      <ExamReviewList state={entry.state} byId={byId} result={result} defaultOnlyIncorrect />

      <div className="pb-8">{actions}</div>
    </div>
  )
}
