import { useState } from "react"
import { ArrowRight, Check, SkipForward, X } from "lucide-react"
import type { Category, NumericQuestion } from "@/features/mock-exams/types"
import { CATEGORIES, CATEGORY_LABELS } from "@/features/mock-exams/lib/categories"
import { shuffle } from "@/features/mock-exams/lib/exam"
import { NUMERIC_GENERATORS } from "@/features/mock-exams/lib/generators"
import { checkNumeric } from "@/features/mock-exams/lib/grading"
import { loadChallengeCategories, saveChallengeCategories } from "@/features/mock-exams/lib/storage"
import { cn } from "@/features/mock-exams/lib/utils"
import { Button } from "@/features/mock-exams/components/ui/button"
import { Badge } from "@/features/mock-exams/components/ui/badge"
import { Card, CardContent } from "@/features/mock-exams/components/ui/card"
import { Input } from "@/features/mock-exams/components/ui/input"
import { CategoryFilter } from "@/features/mock-exams/components/category-filter"
import { Markdown } from "@/features/mock-exams/components/markdown"

interface ChallengeViewProps {
  pool: NumericQuestion[]
}

interface Deck {
  cards: NumericQuestion[]
  pos: number
  input: string
  revealed: boolean
}

export function ChallengeView({ pool }: ChallengeViewProps) {
  const generatorCats = new Set(NUMERIC_GENERATORS.map((g) => g.category))
  const availableCategories = CATEGORIES.filter(
    (c) => generatorCats.has(c) || pool.some((q) => q.category === c)
  )

  const counts = pool.reduce(
    (acc, q) => {
      acc[q.category] = (acc[q.category] ?? 0) + 1
      return acc
    },
    {} as Record<Category, number>
  )
  for (const g of NUMERIC_GENERATORS) counts[g.category] = (counts[g.category] ?? 0) + 1

  const [cats, setCats] = useState<Category[]>(() => {
    const saved = loadChallengeCategories()
    if (saved) {
      const valid = saved.filter((c) => availableCategories.includes(c))
      if (valid.length) return valid
    }
    return [...availableCategories]
  })

  // One fresh instance per numeric generator (new numbers each pass).
  function buildCards(selectedCats: Category[]): NumericQuestion[] {
    const statics = pool.filter((q) => selectedCats.includes(q.category))
    const generated = NUMERIC_GENERATORS.filter((g) => selectedCats.includes(g.category)).map((g) =>
      g.generate()
    )
    return shuffle([...statics, ...generated])
  }

  function buildDeck(selectedCats: Category[]): Deck {
    return { cards: buildCards(selectedCats), pos: 0, input: "", revealed: false }
  }

  const [deck, setDeck] = useState<Deck>(() => buildDeck(cats))

  function changeCats(next: Category[]) {
    setCats(next)
    saveChallengeCategories(next)
    setDeck(buildDeck(next))
  }

  function check() {
    if (deck.input.trim() === "") return
    setDeck((d) => ({ ...d, revealed: true }))
  }

  function next() {
    setDeck((d) => {
      const atEnd = d.pos + 1 >= d.cards.length
      // Rebuild at the end of a pass so drills get fresh numbers.
      const cards = atEnd ? buildCards(cats) : d.cards
      const pos = atEnd ? 0 : d.pos + 1
      return { cards, pos, input: "", revealed: false }
    })
  }

  const current = deck.cards[deck.pos]
  const isCorrect = current ? checkNumeric(deck.input, current.answer, current.tolerance) : false

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="space-y-3 p-5 sm:p-6">
          <div>
            <p className="text-sm font-medium">Calculation drills</p>
            <p className="text-xs text-muted-foreground">
              Harder, multi-step problems. Work it out, type the number, get the full solution.
            </p>
          </div>
          <CategoryFilter
            selected={cats}
            onChange={changeCats}
            counts={counts}
            categories={availableCategories}
          />
        </CardContent>
      </Card>

      {!current ? (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            Select at least one category to start drilling.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {deck.pos + 1} / {deck.cards.length} in selection
            </span>
          </div>

          <Card>
            <CardContent className="space-y-5 p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">Numeric answer</Badge>
                <Badge variant="outline">{CATEGORY_LABELS[current.category]}</Badge>
              </div>

              <div className="text-base font-medium sm:text-lg">
                <Markdown>{current.question}</Markdown>
              </div>

              <div className="space-y-1.5">
                <Input
                  value={deck.input}
                  onChange={(e) => setDeck((d) => ({ ...d, input: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !deck.revealed) check()
                  }}
                  disabled={deck.revealed}
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="Your answer"
                  aria-label="Your numeric answer"
                />
                <p className="text-xs text-muted-foreground">
                  Enter a number with a decimal point, e.g. 3.14
                  {current.answerHint ? ` · ${current.answerHint}` : ""}
                </p>
              </div>

              {deck.revealed && (
                <div className="space-y-4">
                  <div
                    className={cn(
                      "rounded-lg border p-4",
                      isCorrect
                        ? "border-success bg-success/10"
                        : "border-destructive bg-destructive/10"
                    )}
                  >
                    <div className="flex items-center gap-2 font-medium">
                      {isCorrect ? (
                        <>
                          <Check className="h-4 w-4 text-success" /> Correct
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4 text-destructive" /> Not quite
                        </>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {!isCorrect && (
                        <>
                          Your answer: {deck.input.trim() || "(blank)"} ·{" "}
                        </>
                      )}
                      Correct answer: <span className="font-semibold text-foreground">{current.answer}</span>
                    </p>
                  </div>

                  <div className="rounded-lg border bg-muted/50 p-4">
                    <p className="mb-1 text-sm font-semibold">Solution</p>
                    <div className="text-sm text-muted-foreground">
                      <Markdown>{current.explanation}</Markdown>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={next}>
              <SkipForward /> Skip
            </Button>
            {deck.revealed ? (
              <Button onClick={next}>
                Next question <ArrowRight />
              </Button>
            ) : (
              <Button onClick={check} disabled={deck.input.trim() === ""}>
                <Check /> Check answer
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
