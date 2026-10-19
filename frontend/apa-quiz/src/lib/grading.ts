import type { ExamQuestionState, ExamState, Question } from "@/types"

export const MC_CORRECT = 1
export const MC_WRONG = -1 / 3 // 4 options: 0.25*(+1) + 0.75*(-1/3) = 0 (random guessing EV)
export const TF_CORRECT = 1
export const TF_WRONG = 0 // no penalty on True/False
export const MAX_GRADE = 20

export interface QuestionResult {
  qid: string
  type: "mc" | "tf" | "code"
  answered: boolean
  correct: boolean
  points: number
  /** original option index the user effectively chose, or null if blank. */
  chosenOriginalIndex: number | null
}

export interface ExamResult {
  grade: number // clamped to [0, 20], rounded to 1 decimal
  rawScore: number
  tfCorrect: number
  tfWrong: number
  tfBlank: number
  mcCorrect: number
  mcWrong: number
  mcBlank: number
  penalty: number // total points lost to wrong MC answers (<= 0)
  results: QuestionResult[]
}

/** Parse a typed numeric answer, tolerating a comma decimal separator. */
export function parseNumericInput(raw: string): number | null {
  const cleaned = raw.trim().replace(",", ".")
  if (cleaned === "") return null
  const value = Number(cleaned)
  return Number.isFinite(value) ? value : null
}

/** True when the typed input is within `tolerance` of the expected answer. */
export function checkNumeric(raw: string, answer: number, tolerance: number): boolean {
  const value = parseNumericInput(raw)
  if (value === null) return false
  return Math.abs(value - answer) <= tolerance
}

export function chosenOriginalIndex(eq: ExamQuestionState): number | null {
  return eq.selected === null ? null : eq.order[eq.selected]
}

export function isAnswerCorrect(eq: ExamQuestionState, q: Question): boolean {
  const chosen = chosenOriginalIndex(eq)
  return chosen !== null && chosen === q.correctIndex
}

export function scoreExam(state: ExamState, byId: Map<string, Question>): ExamResult {
  let rawScore = 0
  let tfCorrect = 0
  let tfWrong = 0
  let tfBlank = 0
  let mcCorrect = 0
  let mcWrong = 0
  let mcBlank = 0
  let penalty = 0
  const results: QuestionResult[] = []

  for (const eq of state.questions) {
    const q = eq.q ?? byId.get(eq.qid)
    if (!q) continue

    const answered = eq.selected !== null
    const correct = isAnswerCorrect(eq, q)
    let points = 0

    if (eq.type === "tf") {
      if (!answered) tfBlank++
      else if (correct) {
        tfCorrect++
        points = TF_CORRECT
      } else {
        tfWrong++
        points = TF_WRONG
      }
    } else {
      if (!answered) mcBlank++
      else if (correct) {
        mcCorrect++
        points = MC_CORRECT
      } else {
        mcWrong++
        points = MC_WRONG
        penalty += MC_WRONG
      }
    }

    rawScore += points
    results.push({
      qid: eq.qid,
      type: eq.type,
      answered,
      correct,
      points,
      chosenOriginalIndex: chosenOriginalIndex(eq),
    })
  }

  const clamped = Math.min(MAX_GRADE, Math.max(0, rawScore))
  const grade = Math.round(clamped * 10) / 10

  return {
    grade,
    rawScore: Math.round(rawScore * 100) / 100,
    tfCorrect,
    tfWrong,
    tfBlank,
    mcCorrect,
    mcWrong,
    mcBlank,
    penalty: Math.round(penalty * 100) / 100,
    results,
  }
}
