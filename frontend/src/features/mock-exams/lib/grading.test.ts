import { describe, it, expect } from "vitest"
import type { ExamState, Question } from "@/features/mock-exams/types"
import { checkNumeric, parseNumericInput, scoreExam } from "@/features/mock-exams/lib/grading"

function mc(id: string, correctIndex = 0): Question {
  return {
    id,
    type: "mc",
    category: "MLP",
    calculation: false,
    question: "q",
    options: ["a", "b", "c", "d"],
    correctIndex,
    explanation: "e",
  }
}

function tf(id: string, correctIndex = 0): Question {
  return {
    id,
    type: "tf",
    category: "MLP",
    calculation: false,
    question: "q",
    options: ["True", "False"],
    correctIndex,
    explanation: "e",
  }
}

function examOf(items: { q: Question; selected: number | null }[]): {
  state: ExamState
  byId: Map<string, Question>
} {
  const state: ExamState = {
    version: 1,
    startedAt: 0,
    currentIndex: 0,
    submitted: true,
    questions: items.map(({ q, selected }) => ({
      qid: q.id,
      type: q.type,
      order: q.options.map((_, i) => i),
      selected,
      visited: true,
    })),
  }
  return { state, byId: new Map(items.map((it) => [it.q.id, it.q])) }
}

describe("scoreExam", () => {
  it("all correct (5 T/F + 15 MC) scores 20.0", () => {
    const items = [
      ...Array.from({ length: 5 }, (_, i) => ({ q: tf(`tf${i}`, 0), selected: 0 })),
      ...Array.from({ length: 15 }, (_, i) => ({ q: mc(`mc${i}`, 0), selected: 0 })),
    ]
    const { state, byId } = examOf(items)
    const r = scoreExam(state, byId)
    expect(r.grade).toBe(20)
    expect(r.rawScore).toBe(20)
    expect(r.tfCorrect).toBe(5)
    expect(r.mcCorrect).toBe(15)
  })

  it("all MC wrong with blank T/F clamps the grade to 0", () => {
    const items = [
      ...Array.from({ length: 5 }, (_, i) => ({ q: tf(`tf${i}`, 0), selected: null })),
      ...Array.from({ length: 15 }, (_, i) => ({ q: mc(`mc${i}`, 0), selected: 1 })),
    ]
    const { state, byId } = examOf(items)
    const r = scoreExam(state, byId)
    expect(r.grade).toBe(0)
    expect(r.rawScore).toBe(-5)
    expect(r.mcWrong).toBe(15)
    expect(r.tfBlank).toBe(5)
  })

  it("a blank MC answer scores 0 with no penalty", () => {
    const { state, byId } = examOf([{ q: mc("mc0", 0), selected: null }])
    const r = scoreExam(state, byId)
    expect(r.rawScore).toBe(0)
    expect(r.mcBlank).toBe(1)
    expect(r.penalty).toBe(0)
  })

  it("each wrong MC costs -1/3 (penalty for 3 wrong is -1)", () => {
    const items = Array.from({ length: 3 }, (_, i) => ({ q: mc(`mc${i}`, 0), selected: 1 }))
    const { state, byId } = examOf(items)
    const r = scoreExam(state, byId)
    expect(r.mcWrong).toBe(3)
    expect(r.penalty).toBe(-1)
    expect(r.rawScore).toBe(-1)
  })

  it("scores a code question like an MC question (+1 correct, -1/3 wrong)", () => {
    const codeQ: Question = {
      id: "c0",
      type: "code",
      category: "CNN",
      calculation: false,
      question: "spot the bug",
      code: "x = 1",
      options: ["a", "b", "c", "d"],
      correctIndex: 0,
      explanation: "e",
    }
    const right = examOf([{ q: codeQ, selected: 0 }])
    expect(scoreExam(right.state, right.byId).rawScore).toBe(1)
    const wrong = examOf([{ q: codeQ, selected: 1 }])
    expect(scoreExam(wrong.state, wrong.byId).rawScore).toBe(-0.33)
    expect(scoreExam(wrong.state, wrong.byId).mcWrong).toBe(1)
  })

  it("a wrong T/F answer carries no penalty", () => {
    const { state, byId } = examOf([{ q: tf("tf0", 0), selected: 1 }])
    const r = scoreExam(state, byId)
    expect(r.tfWrong).toBe(1)
    expect(r.rawScore).toBe(0)
    expect(r.penalty).toBe(0)
  })

  it("respects the persisted option shuffle when judging correctness", () => {
    // correct original index is 2, displayed at position 0 via order
    const q = mc("mc0", 2)
    const state: ExamState = {
      version: 1,
      startedAt: 0,
      currentIndex: 0,
      submitted: true,
      questions: [{ qid: "mc0", type: "mc", order: [2, 0, 1, 3], selected: 0, visited: true }],
    }
    const r = scoreExam(state, new Map([["mc0", q]]))
    expect(r.mcCorrect).toBe(1)
  })
})

describe("checkNumeric", () => {
  it("accepts an exact match", () => {
    expect(checkNumeric("0.26", 0.26, 0.005)).toBe(true)
  })

  it("accepts a value within tolerance", () => {
    expect(checkNumeric("0.262", 0.26, 0.005)).toBe(true)
    expect(checkNumeric("0.2738", 0.2738, 0.001)).toBe(true)
  })

  it("rejects a value outside tolerance", () => {
    expect(checkNumeric("0.3", 0.26, 0.005)).toBe(false)
  })

  it("handles negative answers and a comma decimal separator", () => {
    expect(checkNumeric("-0,74", -0.74, 0.005)).toBe(true)
  })

  it("treats blank or non-numeric input as incorrect", () => {
    expect(checkNumeric("", 0.26, 0.005)).toBe(false)
    expect(checkNumeric("abc", 0.26, 0.005)).toBe(false)
  })

  it("parseNumericInput returns null for blank/garbage and a number otherwise", () => {
    expect(parseNumericInput("")).toBeNull()
    expect(parseNumericInput("xyz")).toBeNull()
    expect(parseNumericInput("3.14")).toBe(3.14)
    expect(parseNumericInput(" 2,5 ")).toBe(2.5)
  })
})
