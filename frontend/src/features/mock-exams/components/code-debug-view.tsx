import { useState } from "react"
import { ArrowRight, Check, Shuffle } from "lucide-react"
import type { Category, Question } from "@/features/mock-exams/types"
import { CATEGORIES } from "@/features/mock-exams/lib/categories"
import { shuffle } from "@/features/mock-exams/lib/exam"
import { loadCodeCategories, saveCodeCategories } from "@/features/mock-exams/lib/storage"
import { Button } from "@/features/mock-exams/components/ui/button"
import { Card, CardContent } from "@/features/mock-exams/components/ui/card"
import { CategoryFilter } from "@/features/mock-exams/components/category-filter"
import { QuestionCard } from "@/features/mock-exams/components/question-card"

interface CodeDebugViewProps {
  pool: Question[]
}

function optionOrder(q: Question): number[] {
  const indices = q.options.map((_, i) => i)
  return q.type === "tf" ? indices : shuffle(indices)
}

interface Deck {
  cards: Question[]
  pos: number
  order: number[]
  selected: number | null
  revealed: boolean
}

export function CodeDebugView({ pool }: CodeDebugViewProps) {
  const availableCategories = CATEGORIES.filter((c) => pool.some((q) => q.category === c))

  const counts = pool.reduce(
    (acc, q) => {
      acc[q.category] = (acc[q.category] ?? 0) + 1
      return acc
    },
    {} as Record<Category, number>
  )

  const [cats, setCats] = useState<Category[]>(() => {
    const saved = loadCodeCategories()
    if (saved) {
      const valid = saved.filter((c) => availableCategories.includes(c))
      if (valid.length) return valid
    }
    return [...availableCategories]
  })

  function buildDeck(selectedCats: Category[]): Deck {
    const cards = shuffle(pool.filter((q) => selectedCats.includes(q.category)))
    return {
      cards,
      pos: 0,
      order: cards.length ? optionOrder(cards[0]) : [],
      selected: null,
      revealed: false,
    }
  }

  const [deck, setDeck] = useState<Deck>(() => buildDeck(cats))

  function changeCats(next: Category[]) {
    setCats(next)
    saveCodeCategories(next)
    setDeck(buildDeck(next))
  }

  function select(pos: number | null) {
    if (deck.revealed) return
    setDeck((d) => ({ ...d, selected: pos }))
  }

  function check() {
    if (deck.selected === null) return
    setDeck((d) => ({ ...d, revealed: true }))
  }

  function next() {
    setDeck((d) => {
      const atEnd = d.pos + 1 >= d.cards.length
      const cards = atEnd ? shuffle(d.cards) : d.cards
      const pos = atEnd ? 0 : d.pos + 1
      return {
        cards,
        pos,
        order: cards.length ? optionOrder(cards[pos]) : [],
        selected: null,
        revealed: false,
      }
    })
  }

  const current = deck.cards[deck.pos]

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="space-y-3 p-5 sm:p-6">
          <div>
            <p className="text-sm font-medium">Code debugging</p>
            <p className="text-xs text-muted-foreground">
              Read the snippet, find the deliberately introduced bug, and pick the option that names it.
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
            Select at least one category to start debugging.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="text-sm text-muted-foreground">
            {deck.pos + 1} / {deck.cards.length} in selection
          </div>

          <Card>
            <CardContent className="p-5 sm:p-6">
              <QuestionCard
                question={current}
                order={deck.order}
                selected={deck.selected}
                onSelect={select}
                revealed={deck.revealed}
              />
            </CardContent>
          </Card>

          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={next}>
              <Shuffle /> Skip
            </Button>
            {deck.revealed ? (
              <Button onClick={next}>
                Next question <ArrowRight />
              </Button>
            ) : (
              <Button onClick={check} disabled={deck.selected === null}>
                <Check /> Check answer
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
