import { describe, it, expect } from "vitest"
import type { ExamHistoryEntry, ExamState } from "@/types"
import { pushHistoryEntry } from "@/lib/storage"

function entry(id: string): ExamHistoryEntry {
  const state: ExamState = {
    version: 3,
    startedAt: Number(id),
    questions: [],
    currentIndex: 0,
    submitted: true,
  }
  return { id, completedAt: Number(id), state }
}

describe("pushHistoryEntry", () => {
  it("prepends newest first", () => {
    const out = pushHistoryEntry(pushHistoryEntry([], entry("1")), entry("2"))
    expect(out.map((e) => e.id)).toEqual(["2", "1"])
  })

  it("dedupes by id and moves the re-saved entry to the front", () => {
    const start = [entry("3"), entry("2"), entry("1")]
    const out = pushHistoryEntry(start, entry("2"))
    expect(out.map((e) => e.id)).toEqual(["2", "3", "1"])
    expect(out).toHaveLength(3)
  })

  it("caps to the max, dropping the oldest", () => {
    let acc: ExamHistoryEntry[] = []
    for (const id of ["1", "2", "3"]) acc = pushHistoryEntry(acc, entry(id), 2)
    expect(acc.map((e) => e.id)).toEqual(["3", "2"])
  })

  it("does not mutate the input array", () => {
    const start = [entry("1")]
    pushHistoryEntry(start, entry("2"))
    expect(start.map((e) => e.id)).toEqual(["1"])
  })
})
