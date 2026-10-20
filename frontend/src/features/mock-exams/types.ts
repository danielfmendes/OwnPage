export type Category =
  | "Foundations"
  | "Perceptron"
  | "MLP"
  | "Training"
  | "CNN"
  | "Architectures"
  | "RNN"
  | "Attention"
  | "NLP"
  | "Prompting"

export type QuestionType = "mc" | "tf" | "code"

export interface Question {
  id: string
  type: QuestionType
  category: Category
  calculation: boolean
  question: string
  /** For "tf" this is always ["True", "False"]. For "mc" exactly 4 options. */
  options: string[]
  /** Index into `options` of the correct answer. */
  correctIndex: number
  explanation: string
  /** for "code" questions: the snippet shown (read-only) above the options. */
  code?: string
  /** language for the code block (default "python"). */
  codeLang?: string
  /** true when produced at runtime by a generator (not from questions.json). */
  generated?: boolean
  /** difficulty tier; absent ⇒ treated as "medium". The mock exam drops "easy"
   * and prefers "hard"; practice/drills show everything. */
  difficulty?: "easy" | "medium" | "hard"
}

/** Per-question state stored in a running exam (persisted to localStorage). */
export interface ExamQuestionState {
  qid: string
  type: QuestionType
  /** displayed position -> original option index (persists the option shuffle). */
  order: number[]
  /** displayed position the user picked, or null when left blank. */
  selected: number | null
  /** true once the question has been the current one (used to flag "skipped"). */
  visited: boolean
  /** the concrete question, stored inline for generated questions so a
   * refresh can resume them (static questions are resolved by `qid`). */
  q?: Question
}

/**
 * A free-input calculation question used only by the "Calculation drills" mode.
 * Kept separate from the mc/tf `Question` union so the exam/practice/grading
 * code is untouched.
 */
export interface NumericQuestion {
  id: string
  type: "numeric"
  category: Category
  calculation: true
  question: string
  /** the correct numeric answer */
  answer: number
  /** absolute tolerance: an input counts as correct when |input - answer| <= tolerance */
  tolerance: number
  /** optional per-question note about the expected format, e.g. "round to 2 decimals" */
  answerHint?: string
  explanation: string
}

export interface ExamState {
  version: number
  startedAt: number
  questions: ExamQuestionState[]
  currentIndex: number
  submitted: boolean
}

/** A finished mock exam saved to localStorage so it can be reviewed later. */
export interface ExamHistoryEntry {
  /** unique per exam (String of state.startedAt); makes re-saving idempotent. */
  id: string
  /** Date.now() when the exam was submitted. */
  completedAt: number
  /** the exam, fully snapshotted: every question's `q` is populated so the
   * review survives later edits to questions.json. */
  state: ExamState
}
