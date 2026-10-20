import { describe, it, expect } from "vitest"
import data from "@/features/mock-exams/data/questions.json"
import type { Category, Question } from "@/features/mock-exams/types"
import { CATEGORIES } from "@/features/mock-exams/lib/categories"
import { NUM_MC, NUM_TF } from "@/features/mock-exams/lib/exam"

const pool = data as Question[]

describe("questions.json integrity", () => {
  it("has at least 150 questions", () => {
    expect(pool.length).toBeGreaterThanOrEqual(150)
  })

  it("has unique ids", () => {
    const ids = new Set(pool.map((q) => q.id))
    expect(ids.size).toBe(pool.length)
  })

  it("every question is well-formed", () => {
    for (const q of pool) {
      expect(CATEGORIES).toContain(q.category)
      expect(q.question.trim().length).toBeGreaterThan(0)
      expect(q.explanation.trim().length).toBeGreaterThan(0)
      expect(Number.isInteger(q.correctIndex)).toBe(true)
      expect(q.correctIndex).toBeGreaterThanOrEqual(0)
      expect(q.correctIndex).toBeLessThan(q.options.length)

      if (q.type === "mc") {
        expect(q.options).toHaveLength(4)
      } else {
        expect(q.type).toBe("tf")
        expect(q.options).toEqual(["True", "False"])
      }
    }
  })

  it("has enough True/False and multiple-choice to build an exam", () => {
    const tf = pool.filter((q) => q.type === "tf")
    const mc = pool.filter((q) => q.type === "mc")
    expect(tf.length).toBeGreaterThanOrEqual(NUM_TF)
    expect(mc.length).toBeGreaterThanOrEqual(NUM_MC)
  })

  it("has enough NON-easy questions for the graded exam, per category too", () => {
    const nonEasy = pool.filter((q) => q.difficulty !== "easy")
    expect(nonEasy.filter((q) => q.type === "tf").length).toBeGreaterThanOrEqual(NUM_TF)
    expect(nonEasy.filter((q) => q.type === "mc").length).toBeGreaterThanOrEqual(NUM_MC)
    for (const cat of CATEGORIES) {
      const mc = nonEasy.filter((q) => q.type === "mc" && q.category === (cat as Category))
      expect(mc.length).toBeGreaterThanOrEqual(1)
    }
  })

  it("every category has at least one T/F and one MC question", () => {
    for (const cat of CATEGORIES) {
      const inCat = pool.filter((q) => q.category === (cat as Category))
      expect(inCat.some((q) => q.type === "tf")).toBe(true)
      expect(inCat.some((q) => q.type === "mc")).toBe(true)
    }
  })

  it("does not let answer length betray the correct option", () => {
    const mc = pool.filter((q) => q.type === "mc")
    let strictLongest = 0
    let strictShortest = 0
    for (const q of mc) {
      const lens = q.options.map((o) => o.length)
      const correct = lens[q.correctIndex]
      const others = lens.filter((_, i) => i !== q.correctIndex)
      if (correct > Math.max(...others)) strictLongest++
      if (correct < Math.min(...others)) strictShortest++
    }
    // Chance for 4 options is ~25%; keep both tells near/under that.
    expect(strictLongest / mc.length).toBeLessThanOrEqual(0.33)
    expect(strictShortest / mc.length).toBeLessThanOrEqual(0.4)
  })
})
