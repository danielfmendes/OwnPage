import { useMemo } from "react"
import { RotateCcw, Home, Clock } from "lucide-react"
import type { ExamState, Question } from "@/features/mock-exams/types"
import { scoreExam } from "@/features/mock-exams/lib/grading"
import { Button } from "@/features/mock-exams/components/ui/button"
import { ExamScoreCard } from "@/features/mock-exams/components/exam-score-card"
import { ExamReviewList } from "@/features/mock-exams/components/exam-review-list"

interface ResultsScreenProps {
  state: ExamState
  byId: Map<string, Question>
  onRestart: () => void
  onHome: () => void
  onHistory?: () => void
}

export function ResultsScreen({ state, byId, onRestart, onHome, onHistory }: ResultsScreenProps) {
  const result = useMemo(() => scoreExam(state, byId), [state, byId])

  const actions = (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
      <Button onClick={onRestart}>
        <RotateCcw /> New mock exam
      </Button>
      {onHistory && (
        <Button variant="secondary" onClick={onHistory}>
          <Clock /> Exam history
        </Button>
      )}
      <Button variant="outline" onClick={onHome}>
        <Home /> Home
      </Button>
    </div>
  )

  return (
    <div className="space-y-6">
      <ExamScoreCard result={result} total={state.questions.length}>
        {actions}
      </ExamScoreCard>

      <ExamReviewList state={state} byId={byId} result={result} />

      <div className="pb-8">{actions}</div>
    </div>
  )
}
