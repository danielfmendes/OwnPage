import { describe, it, expect } from "vitest"
import data from "@/data/challenges.json"
import type { NumericQuestion } from "@/types"
import { CATEGORIES } from "@/lib/categories"

const pool = data as NumericQuestion[]

describe("challenges.json integrity", () => {
  it("has at least 25 numeric drills", () => {
    expect(pool.length).toBeGreaterThanOrEqual(25)
  })

  it("has unique ids", () => {
    const ids = new Set(pool.map((q) => q.id))
    expect(ids.size).toBe(pool.length)
  })

  it("every drill is well-formed", () => {
    for (const q of pool) {
      expect(q.type).toBe("numeric")
      expect(CATEGORIES).toContain(q.category)
      expect(q.question.trim().length).toBeGreaterThan(0)
      expect(q.explanation.trim().length).toBeGreaterThan(0)
      expect(Number.isFinite(q.answer)).toBe(true)
      expect(q.tolerance).toBeGreaterThan(0)
    }
  })

  it("spans several categories", () => {
    const cats = new Set(pool.map((q) => q.category))
    expect(cats.size).toBeGreaterThanOrEqual(5)
  })
})
