import { describe, it, expect } from "vitest"
import data from "@/data/questions.json"
import codeData from "@/data/code-questions.json"
import type { ExamState, Question } from "@/types"
import {
  buildExamQuestionState,
  NUM_CODE,
  NUM_MC,
  NUM_TF,
  sampleExam,
  snapshotExamState,
  TOTAL_QUESTIONS,
} from "@/lib/exam"

const pool = [...(data as Question[]), ...(codeData as Question[])]
const byId = new Map(pool.map((q) => [q.id, q]))

describe("sampleExam", () => {
  it("returns 20 questions split 5 T/F + 13 MC + 2 code", () => {
    const exam = sampleExam(pool)
    expect(exam.questions).toHaveLength(TOTAL_QUESTIONS)
    expect(exam.questions.filter((q) => q.type === "tf")).toHaveLength(NUM_TF)
    expect(exam.questions.filter((q) => q.type === "mc")).toHaveLength(NUM_MC)
    expect(exam.questions.filter((q) => q.type === "code")).toHaveLength(NUM_CODE)
  })

  it("spreads questions across many categories (not all from one)", () => {
    for (let trial = 0; trial < 20; trial++) {
      const exam = sampleExam(pool)
      const cats = new Set(exam.questions.map((q) => (q.q ?? byId.get(q.qid))!.category))
      // 15 MC stratified over 8 categories must touch every category.
      expect(cats.size).toBeGreaterThanOrEqual(8)
    }
  })

  it("never picks the same question twice", () => {
    const exam = sampleExam(pool)
    const ids = new Set(exam.questions.map((q) => q.qid))
    expect(ids.size).toBe(exam.questions.length)
  })

  it("includes at most 2 Prompting questions per exam", () => {
    for (let trial = 0; trial < 50; trial++) {
      const exam = sampleExam(pool)
      const prompting = exam.questions.filter(
        (q) => (q.q ?? byId.get(q.qid))!.category === "Prompting"
      ).length
      expect(prompting).toBeLessThanOrEqual(2)
      expect(exam.questions).toHaveLength(TOTAL_QUESTIONS)
    }
  })

  it("never repeats a calculation template within one exam", () => {
    for (let trial = 0; trial < 50; trial++) {
      const exam = sampleExam(pool)
      const templateIds = exam.questions
        .filter((eq) => eq.q?.generated)
        .map((eq) => eq.qid.replace(/-\d+$/, "")) // strip the random suffix
      expect(new Set(templateIds).size).toBe(templateIds.length)
    }
  })

  it("never includes an easy question in the graded exam", () => {
    for (let trial = 0; trial < 50; trial++) {
      const exam = sampleExam(pool)
      for (const eq of exam.questions) {
        const q = eq.q ?? byId.get(eq.qid)!
        expect(q.difficulty).not.toBe("easy")
      }
    }
  })

  it("is hard-leaning: most MC are hard or generated calc", () => {
    for (let trial = 0; trial < 30; trial++) {
      const exam = sampleExam(pool)
      const mc = exam.questions.filter((eq) => eq.type === "mc")
      const challenging = mc.filter((eq) => {
        const q = eq.q ?? byId.get(eq.qid)!
        return q.difficulty === "hard" || q.generated
      })
      expect(challenging.length).toBeGreaterThanOrEqual(10)
    }
  })

  it("stores generated questions inline so they survive a refresh", () => {
    const exam = sampleExam(pool)
    for (const eq of exam.questions) {
      if (eq.qid.startsWith("gen-")) {
        expect(eq.q).toBeDefined()
        expect(eq.q!.options).toHaveLength(4)
      }
    }
  })
})

describe("snapshotExamState", () => {
  const staticQ: Question = {
    id: "s1",
    type: "mc",
    category: "MLP",
    calculation: false,
    question: "q",
    options: ["a", "b", "c", "d"],
    correctIndex: 0,
    explanation: "e",
  }
  const genQ: Question = { ...staticQ, id: "gen-x-1", generated: true }

  function stateWith(): ExamState {
    return {
      version: 1,
      startedAt: 123,
      currentIndex: 0,
      submitted: true,
      questions: [
        { qid: "s1", type: "mc", order: [2, 0, 1, 3], selected: 1, visited: true },
        { qid: "gen-x-1", type: "mc", order: [0, 1, 2, 3], selected: null, visited: true, q: genQ },
      ],
    }
  }

  it("populates every slot's question and preserves order/selected", () => {
    const byId = new Map([["s1", staticQ]])
    const snap = snapshotExamState(stateWith(), byId)
    expect(snap.questions.every((eq) => eq.q !== undefined)).toBe(true)
    expect(snap.questions[0].q!.id).toBe("s1")
    expect(snap.questions[0].order).toEqual([2, 0, 1, 3])
    expect(snap.questions[0].selected).toBe(1)
    expect(snap.questions[1].q!.id).toBe("gen-x-1")
  })

  it("is independent of byId afterwards (self-contained snapshot)", () => {
    const byId = new Map([["s1", staticQ]])
    const snap = snapshotExamState(stateWith(), byId)
    byId.delete("s1") // pool changes later
    expect(snap.questions[0].q!.id).toBe("s1") // snapshot still resolves
  })
})

describe("option shuffling (defeats positional answer bias)", () => {
  it("places the correct MC answer in each position roughly uniformly", () => {
    const q: Question = {
      id: "x",
      type: "mc",
      category: "MLP",
      calculation: false,
      question: "q",
      options: ["a", "b", "c", "d"],
      correctIndex: 0,
      explanation: "e",
    }
    const N = 4000
    const counts = [0, 0, 0, 0]
    for (let i = 0; i < N; i++) {
      const eq = buildExamQuestionState(q)
      const displayedPos = eq.order.indexOf(q.correctIndex)
      counts[displayedPos]++
    }
    for (const c of counts) {
      expect(c).toBeGreaterThan(N * 0.18) // expected 0.25
      expect(c).toBeLessThan(N * 0.32)
    }
  })
})
