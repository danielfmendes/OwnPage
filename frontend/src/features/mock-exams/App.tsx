import { useMemo, useState } from "react"
import { Home } from "lucide-react"
import type { ExamHistoryEntry, ExamState, NumericQuestion, Question } from "@/features/mock-exams/types"
import questionsData from "@/features/mock-exams/data/questions.json"
import codeData from "@/features/mock-exams/data/code-questions.json"
import challengesData from "@/features/mock-exams/data/challenges.json"
import { questionsById, sampleExam, snapshotExamState } from "@/features/mock-exams/lib/exam"
import {
  clearExam,
  clearHistory,
  loadExam,
  loadHistory,
  pushHistoryEntry,
  saveExam,
  saveHistory,
} from "@/features/mock-exams/lib/storage"
import { cn } from "@/features/mock-exams/lib/utils"
import { Button } from "@/features/mock-exams/components/ui/button"
import { ThemeToggle } from "@/features/mock-exams/components/theme-toggle"
import { StartScreen } from "@/features/mock-exams/components/start-screen"
import { ExamView } from "@/features/mock-exams/components/exam-view"
import { ResultsScreen } from "@/features/mock-exams/components/results-screen"
import { PracticeView } from "@/features/mock-exams/components/practice-view"
import { ChallengeView } from "@/features/mock-exams/components/challenge-view"
import { CodeDebugView } from "@/features/mock-exams/components/code-debug-view"
import { HistoryView } from "@/features/mock-exams/components/history-view"
import { HistoryDetailView } from "@/features/mock-exams/components/history-detail-view"

const POOL = [...(questionsData as Question[]), ...(codeData as Question[])]
const CODE_POOL = POOL.filter((q) => q.type === "code")
const CHALLENGES = challengesData as NumericQuestion[]

type View = "home" | "exam" | "results" | "practice" | "challenge" | "code" | "history" | "history-detail"

export function App() {
  const byId = useMemo(() => questionsById(POOL), [])
  const [examState, setExamState] = useState<ExamState | null>(() => loadExam())
  const [view, setView] = useState<View>(() => (loadExam()?.submitted ? "results" : "home"))
  const [history, setHistory] = useState<ExamHistoryEntry[]>(() => loadHistory())
  const [selectedId, setSelectedId] = useState<string | null>(null)

  function persistExam(next: ExamState | null) {
    setExamState(next)
    if (next) saveExam(next)
    else clearExam()
  }

  function startExam() {
    persistExam(sampleExam(POOL))
    setView("exam")
    window.scrollTo({ top: 0 })
  }

  function submitExam() {
    if (!examState) return
    const submitted = { ...examState, submitted: true }
    persistExam(submitted)
    const entry: ExamHistoryEntry = {
      id: String(submitted.startedAt),
      completedAt: Date.now(),
      state: snapshotExamState(submitted, byId),
    }
    setHistory((prev) => {
      const next = pushHistoryEntry(prev, entry)
      saveHistory(next)
      return next
    })
    setView("results")
    window.scrollTo({ top: 0 })
  }

  function resetExam() {
    persistExam(null)
    setView("home")
  }

  function goHome() {
    if (examState?.submitted) persistExam(null)
    setView("home")
    window.scrollTo({ top: 0 })
  }

  function openHistory() {
    setView("history")
    window.scrollTo({ top: 0 })
  }

  function openHistoryEntry(id: string) {
    setSelectedId(id)
    setView("history-detail")
    window.scrollTo({ top: 0 })
  }

  function deleteHistoryEntry(id: string) {
    setHistory((prev) => {
      const next = prev.filter((e) => e.id !== id)
      saveHistory(next)
      return next
    })
  }

  function clearAllHistory() {
    setHistory([])
    clearHistory()
  }

  const selectedEntry = history.find((e) => e.id === selectedId) ?? null

  const hasInProgress = !!examState && !examState.submitted

  // The exam uses a wider layout so the question column stays roomy next to the
  // right-hand navigator; other views stay narrow for readability.
  const containerClass = view === "exam" ? "max-w-6xl" : "max-w-3xl"
  const poolSize = POOL.filter((q) => q.type !== "code").length

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className={cn("mx-auto flex items-center justify-between px-4 py-3", containerClass)}>
          <button
            type="button"
            onClick={goHome}
            className="text-sm font-semibold tracking-tight sm:text-base"
          >
            APA Mock Exam
          </button>
          <div className="flex items-center gap-2">
            {view !== "home" && (
              <Button variant="ghost" size="sm" onClick={goHome}>
                <Home /> Home
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className={cn("mx-auto w-full flex-1 px-4 py-6 sm:py-8", containerClass)}>
        {view === "home" && (
          <StartScreen
            hasInProgress={hasInProgress}
            poolSize={poolSize}
            drillCount={CHALLENGES.length}
            codeCount={CODE_POOL.length}
            historyCount={history.length}
            onStartExam={startExam}
            onResume={() => setView("exam")}
            onReset={resetExam}
            onPractice={() => setView("practice")}
            onChallenge={() => setView("challenge")}
            onCode={() => setView("code")}
            onHistory={openHistory}
          />
        )}

        {view === "exam" && examState && (
          <ExamView
            state={examState}
            byId={byId}
            onChange={persistExam}
            onSubmit={submitExam}
          />
        )}

        {view === "results" && examState && (
          <ResultsScreen
            state={examState}
            byId={byId}
            onRestart={startExam}
            onHome={goHome}
            onHistory={openHistory}
          />
        )}

        {view === "practice" && <PracticeView pool={POOL} />}

        {view === "challenge" && <ChallengeView pool={CHALLENGES} />}

        {view === "code" && <CodeDebugView pool={CODE_POOL} />}

        {view === "history" && (
          <HistoryView
            entries={history}
            byId={byId}
            onOpen={openHistoryEntry}
            onDelete={deleteHistoryEntry}
            onClearAll={clearAllHistory}
          />
        )}

        {view === "history-detail" &&
          (selectedEntry ? (
            <HistoryDetailView
              entry={selectedEntry}
              byId={byId}
              onBack={openHistory}
              onHome={goHome}
            />
          ) : (
            <HistoryView
              entries={history}
              byId={byId}
              onOpen={openHistoryEntry}
              onDelete={deleteHistoryEntry}
              onClearAll={clearAllHistory}
            />
          ))}
      </main>

      <footer className="mx-auto max-w-3xl px-4 pb-8 pt-2 text-center text-xs text-muted-foreground">
        Created by Daniel Freire Mendes &amp; Claude (Opus 4.7)
      </footer>
    </div>
  )
}
