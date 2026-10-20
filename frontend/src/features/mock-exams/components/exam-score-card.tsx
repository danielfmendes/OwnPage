import type { ExamResult } from "@/features/mock-exams/lib/grading"
import { MAX_GRADE } from "@/features/mock-exams/lib/grading"
import { cn } from "@/features/mock-exams/lib/utils"
import { Card, CardContent } from "@/features/mock-exams/components/ui/card"
import { Separator } from "@/features/mock-exams/components/ui/separator"

function Stat({ label, value, tone }: { label: string; value: string; tone?: "good" | "bad" }) {
  return (
    <div className="rounded-lg border p-3 text-center">
      <div
        className={cn(
          "text-2xl font-bold tabular-nums",
          tone === "good" && "text-success",
          tone === "bad" && "text-destructive"
        )}
      >
        {value}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

interface ExamScoreCardProps {
  result: ExamResult
  total: number
  children?: React.ReactNode
}

/** Grade headline + per-type stat grid. Shared by the results and history-detail screens. */
export function ExamScoreCard({ result, total, children }: ExamScoreCardProps) {
  const ratio = result.grade / MAX_GRADE
  const gradeTone = ratio >= 0.5 ? "text-success" : "text-destructive"

  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground">Your grade</p>
          <p className={cn("text-5xl font-bold tabular-nums", gradeTone)}>
            {result.grade.toFixed(1)}
            <span className="text-2xl text-muted-foreground"> / {MAX_GRADE}</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Raw score {result.rawScore.toFixed(2)} (clamped to 0–{MAX_GRADE})
          </p>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="MC correct (+1)" value={`${result.mcCorrect}`} tone="good" />
          <Stat label="MC wrong (−1/3)" value={`${result.mcWrong}`} tone="bad" />
          <Stat label="MC blank (0)" value={`${result.mcBlank}`} />
          <Stat label="MC penalty" value={result.penalty.toFixed(2)} tone="bad" />
          <Stat label="T/F correct (+1)" value={`${result.tfCorrect}`} tone="good" />
          <Stat label="T/F wrong (0)" value={`${result.tfWrong}`} />
          <Stat label="T/F blank (0)" value={`${result.tfBlank}`} />
          <Stat label="Total correct" value={`${result.mcCorrect + result.tfCorrect}/${total}`} />
        </div>

        {children}
      </CardContent>
    </Card>
  )
}
