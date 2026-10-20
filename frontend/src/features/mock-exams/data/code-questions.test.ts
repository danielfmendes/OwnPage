import { describe, it, expect } from "vitest"
import data from "@/features/mock-exams/data/code-questions.json"
import type { Question } from "@/features/mock-exams/types"
import { CATEGORIES } from "@/features/mock-exams/lib/categories"
import { NUM_CODE } from "@/features/mock-exams/lib/exam"

const pool = data as Question[]

describe("code-questions.json integrity", () => {
  it("has at least 20 code questions", () => {
    expect(pool.length).toBeGreaterThanOrEqual(20)
  })

  it("has unique ids", () => {
    expect(new Set(pool.map((q) => q.id)).size).toBe(pool.length)
  })

  it("every code question is well-formed", () => {
    for (const q of pool) {
      expect(q.type).toBe("code")
      expect(CATEGORIES).toContain(q.category)
      expect(q.options).toHaveLength(4)
      expect(q.correctIndex).toBeGreaterThanOrEqual(0)
      expect(q.correctIndex).toBeLessThan(4)
      expect((q.code ?? "").trim().length).toBeGreaterThan(0)
      expect(q.question.trim().length).toBeGreaterThan(0)
      expect(q.explanation.trim().length).toBeGreaterThan(0)
      expect(["easy", "medium", "hard"]).toContain(q.difficulty)
    }
  })

  it("matches the requested 5 easy / 10 medium / 5 hard split", () => {
    const c = { easy: 0, medium: 0, hard: 0 } as Record<string, number>
    for (const q of pool) c[q.difficulty ?? "medium"]++
    expect(c.easy).toBe(5)
    expect(c.medium).toBe(10)
    expect(c.hard).toBe(5)
  })

  it("has enough non-easy code questions for the exam slot", () => {
    expect(pool.filter((q) => q.difficulty !== "easy").length).toBeGreaterThanOrEqual(NUM_CODE)
  })
})
