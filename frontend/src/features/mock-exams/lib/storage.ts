import type { Category, ExamHistoryEntry, ExamState } from "@/features/mock-exams/types"

const EXAM_KEY = "apa-quiz:exam"
const THEME_KEY = "apa-quiz:theme"
const PRACTICE_KEY = "apa-quiz:practice"
const CHALLENGE_KEY = "apa-quiz:challenge"
const CODE_KEY = "apa-quiz:code"
const HISTORY_KEY = "apa-quiz:history"

export const EXAM_VERSION = 3
export const HISTORY_VERSION = 1
export const MAX_HISTORY = 50

export function loadExam(): ExamState | null {
  try {
    const raw = localStorage.getItem(EXAM_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ExamState
    if (parsed.version !== EXAM_VERSION) {
      localStorage.removeItem(EXAM_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function saveExam(state: ExamState): void {
  try {
    localStorage.setItem(EXAM_KEY, JSON.stringify(state))
  } catch {
    /* ignore quota / private-mode errors */
  }
}

export function clearExam(): void {
  try {
    localStorage.removeItem(EXAM_KEY)
  } catch {
    /* ignore */
  }
}

export type Theme = "light" | "dark"

export function loadTheme(): Theme | null {
  try {
    const t = localStorage.getItem(THEME_KEY)
    return t === "light" || t === "dark" ? t : null
  } catch {
    return null
  }
}

export function saveTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    /* ignore */
  }
}

export function loadPracticeCategories(): Category[] | null {
  try {
    const raw = localStorage.getItem(PRACTICE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Category[]) : null
  } catch {
    return null
  }
}

export function savePracticeCategories(categories: Category[]): void {
  try {
    localStorage.setItem(PRACTICE_KEY, JSON.stringify(categories))
  } catch {
    /* ignore */
  }
}

export function loadChallengeCategories(): Category[] | null {
  try {
    const raw = localStorage.getItem(CHALLENGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Category[]) : null
  } catch {
    return null
  }
}

export function saveChallengeCategories(categories: Category[]): void {
  try {
    localStorage.setItem(CHALLENGE_KEY, JSON.stringify(categories))
  } catch {
    /* ignore */
  }
}

export function loadCodeCategories(): Category[] | null {
  try {
    const raw = localStorage.getItem(CODE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Category[]) : null
  } catch {
    return null
  }
}

export function saveCodeCategories(categories: Category[]): void {
  try {
    localStorage.setItem(CODE_KEY, JSON.stringify(categories))
  } catch {
    /* ignore */
  }
}

/* ---- exam history (newest first) ---- */

interface HistoryEnvelope {
  version: number
  entries: ExamHistoryEntry[]
}

/** Pure: prepend an entry newest-first, dedupe by id, and cap to `max`. */
export function pushHistoryEntry(
  entries: ExamHistoryEntry[],
  entry: ExamHistoryEntry,
  max: number = MAX_HISTORY
): ExamHistoryEntry[] {
  return [entry, ...entries.filter((e) => e.id !== entry.id)].slice(0, max)
}

export function loadHistory(): ExamHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as HistoryEnvelope
    if (parsed.version !== HISTORY_VERSION || !Array.isArray(parsed.entries)) {
      localStorage.removeItem(HISTORY_KEY)
      return []
    }
    return parsed.entries
  } catch {
    return []
  }
}

export function saveHistory(entries: ExamHistoryEntry[]): void {
  try {
    const envelope: HistoryEnvelope = { version: HISTORY_VERSION, entries }
    localStorage.setItem(HISTORY_KEY, JSON.stringify(envelope))
  } catch {
    /* ignore quota / private-mode errors */
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY)
  } catch {
    /* ignore */
  }
}
