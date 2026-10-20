import { useMemo } from "react"
import { ChevronRight, Trash2, Clock } from "lucide-react"
import type { ExamHistoryEntry, Question } from "@/features/mock-exams/types"
import { scoreExam, MAX_GRADE } from "@/features/mock-exams/lib/grading"
import { cn } from "@/features/mock-exams/lib/utils"
import { Button } from "@/features/mock-exams/components/ui/button"
import { Badge } from "@/features/mock-exams/components/ui/badge"
import { Card, CardContent } from "@/features/mock-exams/components/ui/card"

interface HistoryViewProps {
  entries: ExamHistoryEntry[]
  byId: Map<string, Question>
  onOpen: (id: string) => void
  onDelete: (id: string) => void
  onClearAll: () => void
}

function formatWhen(ms: number): string {
  return new Date(ms).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
}

export function HistoryView({ entries, byId, onOpen, onDelete, onClearAll }: HistoryViewProps) {
  const rows = useMemo(
    () =>
      entries.map((e) => {
        const result = scoreExam(e.state, byId)
        return {
          id: e.id,
          when: formatWhen(e.completedAt),
          grade: result.grade,
          correct: result.mcCorrect + result.tfCorrect,
          total: e.state.questions.length,
        }
      }),
    [entries, byId]
  )

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold sm:text-3xl">Exam history</h1>
        <p className="text-muted-foreground">
          Your past mock exams are saved in this browser. Open one to review what you got wrong.
        </p>
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
            <Clock className="size-8 text-muted-foreground" />
            <p className="font-medium">No exams yet</p>
            <p className="text-sm text-muted-foreground">
              Finish a mock exam and it will show up here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {rows.map((r) => {
              const passed = r.grade >= MAX_GRADE / 2
              return (
                <Card
                  key={r.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpen(r.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      onOpen(r.id)
                    }
                  }}
                  className="cursor-pointer transition-colors hover:border-primary hover:bg-accent/50"
                >
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex-1">
                      <p className="font-medium">{r.when}</p>
                      <p className="text-sm text-muted-foreground">
                        {r.correct}/{r.total} correct
                      </p>
                    </div>
                    <Badge variant={passed ? "success" : "destructive"} className="text-sm">
                      {r.grade.toFixed(1)} / {MAX_GRADE}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete this exam"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(r.id)
                      }}
                    >
                      <Trash2 className={cn("text-muted-foreground")} />
                    </Button>
                    <ChevronRight className="text-muted-foreground" />
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="flex justify-center pb-8">
            <Button variant="destructive" onClick={onClearAll}>
              <Trash2 /> Clear all history
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
