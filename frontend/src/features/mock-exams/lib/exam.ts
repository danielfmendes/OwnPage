import type { Category, ExamQuestionState, ExamState, Question } from "@/features/mock-exams/types"
import { CATEGORIES } from "@/features/mock-exams/lib/categories"
import { MC_GENERATORS } from "@/features/mock-exams/lib/generators"
import { EXAM_VERSION } from "@/features/mock-exams/lib/storage"

export const NUM_TF = 5
export const NUM_MC = 13
export const NUM_CODE = 2
export const TOTAL_QUESTIONS = NUM_TF + NUM_MC + NUM_CODE // 20

/** Per-category limits for a single mock exam (applied across T/F + MC combined). */
export const CATEGORY_CAPS: Partial<Record<Category, number>> = { Prompting: 2 }

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function groupByCategory(questions: Question[]): Map<Category, Question[]> {
  const m = new Map<Category, Question[]>()
  for (const q of questions) {
    const list = m.get(q.category)
    if (list) list.push(q)
    else m.set(q.category, [q])
  }
  return m
}

/**
 * Pick `count` questions spread fairly across categories: shuffle each
 * category's queue, then round-robin over a freshly shuffled category order
 * each pass so the "extra" slots (when count isn't divisible) land randomly.
 * `counts` is a shared per-category tally so caps apply across multiple calls;
 * a category is skipped once it reaches its cap in `CATEGORY_CAPS`.
 */
function stratifiedPick(
  byCategory: Map<Category, Question[]>,
  count: number,
  counts: Map<Category, number>
): Question[] {
  const atCap = (cat: Category) => {
    const cap = CATEGORY_CAPS[cat]
    return cap !== undefined && (counts.get(cat) ?? 0) >= cap
  }

  // Prefer hard (and the multi-step generated calc questions) over plain
  // medium recall: shuffle, then stable-sort so the preferred tier ends up
  // last (pop() takes from the end). "easy" is already excluded upstream.
  const rank = (q: Question) => (q.difficulty === "hard" || q.generated ? 2 : 1)
  const queues = new Map<Category, Question[]>()
  for (const cat of CATEGORIES) {
    const qs = byCategory.get(cat)
    if (qs && qs.length && !atCap(cat)) {
      queues.set(cat, shuffle(qs).sort((a, b) => rank(a) - rank(b)))
    }
  }

  const picked: Question[] = []
  while (picked.length < count && queues.size > 0) {
    for (const cat of shuffle([...queues.keys()])) {
      if (picked.length >= count) break
      const queue = queues.get(cat)!
      picked.push(queue.pop()!)
      counts.set(cat, (counts.get(cat) ?? 0) + 1)
      if (queue.length === 0 || atCap(cat)) queues.delete(cat)
    }
  }
  return picked
}

export function buildExamQuestionState(q: Question): ExamQuestionState {
  const order =
    q.type === "tf" ? q.options.map((_, i) => i) : shuffle(q.options.map((_, i) => i))
  const base: ExamQuestionState = {
    qid: q.id,
    type: q.type,
    order,
    selected: null,
    visited: false,
  }
  // Generated questions aren't in questions.json, so persist them inline.
  if (q.generated) base.q = q
  return base
}

/** Resolve the concrete question for an exam slot: inline (generated) or by id. */
export function resolveExamQuestion(
  eq: ExamQuestionState,
  byId: Map<string, Question>
): Question | undefined {
  return eq.q ?? byId.get(eq.qid)
}

/**
 * Return a self-contained copy of an exam where every slot's `q` is populated.
 * Saved exam-history entries use this so a later edit to questions.json can't
 * change or break the review of a past attempt.
 */
export function snapshotExamState(state: ExamState, byId: Map<string, Question>): ExamState {
  return {
    ...state,
    questions: state.questions.map((eq) => ({ ...eq, q: resolveExamQuestion(eq, byId) })),
  }
}

export function sampleExam(pool: Question[]): ExamState {
  // The graded exam drops "easy" questions (kept only for practice).
  const tf = pool.filter((q) => q.type === "tf" && q.difficulty !== "easy")
  // Add one fresh instance per calculation generator so the exam pulls at most
  // one variation of each template, with new numbers every run.
  const mc = [
    ...pool.filter((q) => q.type === "mc" && q.difficulty !== "easy"),
    ...MC_GENERATORS.map((g) => g.generate()),
  ]
  // Code "spot-the-bug" questions occupy a few exam slots, scored like MC.
  const code = pool.filter((q) => q.type === "code" && q.difficulty !== "easy")

  const counts = new Map<Category, number>()
  const picked = [
    ...stratifiedPick(groupByCategory(tf), NUM_TF, counts),
    ...stratifiedPick(groupByCategory(mc), NUM_MC, counts),
    ...stratifiedPick(groupByCategory(code), NUM_CODE, counts),
  ]

  const questions = shuffle(picked).map(buildExamQuestionState)
  if (questions.length > 0) questions[0].visited = true

  return {
    version: EXAM_VERSION,
    startedAt: Date.now(),
    questions,
    currentIndex: 0,
    submitted: false,
  }
}

export function questionsById(pool: Question[]): Map<string, Question> {
  return new Map(pool.map((q) => [q.id, q]))
}
