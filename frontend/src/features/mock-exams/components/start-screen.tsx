import { GraduationCap, Dumbbell, Play, RotateCcw, Calculator, Bug, Clock } from "lucide-react"
import { Button } from "@/features/mock-exams/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/features/mock-exams/components/ui/card"
import { NUM_CODE, NUM_MC, NUM_TF, TOTAL_QUESTIONS } from "@/features/mock-exams/lib/exam"
import { MAX_GRADE } from "@/features/mock-exams/lib/grading"

interface StartScreenProps {
  hasInProgress: boolean
  poolSize: number
  drillCount: number
  codeCount: number
  historyCount: number
  onStartExam: () => void
  onResume: () => void
  onReset: () => void
  onPractice: () => void
  onChallenge: () => void
  onCode: () => void
  onHistory: () => void
}

export function StartScreen({
  hasInProgress,
  poolSize,
  drillCount,
  codeCount,
  historyCount,
  onStartExam,
  onResume,
  onReset,
  onPractice,
  onChallenge,
  onCode,
  onHistory,
}: StartScreenProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold sm:text-3xl">APA Mock Exam</h1>
        <p className="text-muted-foreground">
          {poolSize} questions in the pool. Practise the real exam format.
        </p>
      </div>

      {hasInProgress && (
        <Card className="border-primary">
          <CardContent className="flex flex-col items-center gap-3 p-5 sm:flex-row sm:justify-between">
            <div className="text-center sm:text-left">
              <p className="font-medium">You have an exam in progress</p>
              <p className="text-sm text-muted-foreground">Your answers were saved automatically.</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={onResume}>
                <Play /> Resume
              </Button>
              <Button variant="outline" onClick={onReset}>
                <RotateCcw /> Discard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="size-5" /> Mock exam
            </CardTitle>
            <CardDescription>
              {TOTAL_QUESTIONS} questions ({NUM_TF} True/False + {NUM_MC} multiple-choice +{" "}
              {NUM_CODE} code), graded 0–{MAX_GRADE}.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4">
            <ul className="flex-1 space-y-1 text-sm text-muted-foreground">
              <li>• MC: correct +1, wrong −1/3, blank 0 (you can leave it blank).</li>
              <li>• True/False: correct +1, wrong 0 (no penalty).</li>
              <li>• Questions spread fairly across all topics.</li>
              <li>• Answers + explanations shown after you submit.</li>
            </ul>
            <Button className="w-full" onClick={onStartExam} disabled={hasInProgress}>
              <Play /> Start mock exam
            </Button>
            {hasInProgress && (
              <p className="text-center text-xs text-muted-foreground">
                Resume or discard the current exam first.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="size-5" /> Practice mode
            </CardTitle>
            <CardDescription>
              Work through the full pool with instant feedback, filtered by topic.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4">
            <ul className="flex-1 space-y-1 text-sm text-muted-foreground">
              <li>• Pick one, several, or all categories.</li>
              <li>• See the correct answer + explanation immediately.</li>
              <li>• No grade, no penalty — just learning.</li>
            </ul>
            <Button className="w-full" variant="secondary" onClick={onPractice}>
              <Dumbbell /> Open practice mode
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="size-5" /> Calculation drills
            </CardTitle>
            <CardDescription>
              {drillCount} harder problems where you compute the number yourself.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4">
            <ul className="flex-1 space-y-1 text-sm text-muted-foreground">
              <li>• Real forward pass, backprop, attention by hand.</li>
              <li>• Type your numeric answer into a field.</li>
              <li>• Instant check + full worked solution.</li>
            </ul>
            <Button className="w-full" variant="secondary" onClick={onChallenge}>
              <Calculator /> Open calculation drills
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="size-5" /> Code debugging
            </CardTitle>
            <CardDescription>
              {codeCount} Python snippets (PyTorch / Keras / sklearn) with a hidden bug to spot.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4">
            <ul className="flex-1 space-y-1 text-sm text-muted-foreground">
              <li>• Read read-only, syntax-highlighted code.</li>
              <li>• Pick the option that names the actual bug.</li>
              <li>• Instant feedback + the fix explained.</li>
            </ul>
            <Button className="w-full" variant="secondary" onClick={onCode}>
              <Bug /> Open code debugging
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-5" /> Exam history
            </CardTitle>
            <CardDescription>
              {historyCount === 0
                ? "Your finished mock exams will be saved here, in this browser."
                : `${historyCount} saved mock exam${historyCount === 1 ? "" : "s"}, kept in this browser.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4">
            <ul className="flex-1 space-y-1 text-sm text-muted-foreground">
              <li>• See the date and grade of every past attempt.</li>
              <li>• Open one to review the questions you got wrong.</li>
              <li>• Saved locally — no account, no database.</li>
            </ul>
            <Button className="w-full" variant="secondary" onClick={onHistory}>
              <Clock /> Open exam history
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
