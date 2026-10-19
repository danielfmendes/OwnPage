import { useState } from "react"
import { ArrowRight, Check, Shuffle } from "lucide-react"
import type { Category, Question } from "@/types"
import { CATEGORIES } from "@/lib/categories"
import { shuffle } from "@/lib/exam"
import { MC_GENERATORS } from "@/lib/generators"
import { loadPracticeCategories, savePracticeCategories } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CategoryFilter } from "@/components/category-filter"
import { QuestionCard } from "@/components/question-card"

interface PracticeViewProps {
  pool: Question[]
}

function optionOrder(q: Question): number[] {
  const indices = q.options.map((_, i) => i)
  return q.type === "mc" ? shuffle(indices) : indices
}

interface Deck {
  cards: Question[]
  pos: number
  order: number[]
  selected: number | null
  revealed: boolean
}

export function PracticeView({ pool }: PracticeViewProps) {
  const [cats, setCats] = useState<Category[]>(
    () => loadPracticeCategories() ?? [...CATEGORIES]
  )

  const counts = pool.reduce(
    (acc, q) => {
      acc[q.category] = (acc[q.category] ?? 0) + 1
      return acc
    },
    {} as Record<Category, number>
  )
  for (const g of MC_GENERATORS) counts[g.category] = (counts[g.category] ?? 0) + 1

  // One fresh instance per calculation generator (new numbers each pass).
  function buildCards(selectedCats: Category[]): Question[] {
    // Code "spot-the-bug" questions have their own dedicated mode.
    const statics = pool.filter((q) => q.type !== "code" && selectedCats.includes(q.category))
    const generated = MC_GENERATORS.filter((g) => selectedCats.includes(g.category)).map((g) =>
      g.generate()
    )
    return shuffle([...statics, ...generated])
  }

  function buildDeck(selectedCats: Category[]): Deck {
    const cards = buildCards(selectedCats)
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
    savePracticeCategories(next)
    setDeck(buildDeck(next))
  }

  function select(pos: number | null) {
    if (deck.revealed) return
    setDeck((d) => ({ ...d, selected: pos }))
  }

  function check() {
    setDeck((d) => ({ ...d, revealed: true }))
  }

  function next() {
    setDeck((d) => {
      const atEnd = d.pos + 1 >= d.cards.length
      // Rebuild at the end of a pass so calculation questions get fresh numbers.
      const cards = atEnd ? buildCards(cats) : d.cards
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
            <p className="text-sm font-medium">Categories</p>
            <p className="text-xs text-muted-foreground">
              Pick one, several, or all. Practice draws only from your selection.
            </p>
          </div>
          <CategoryFilter selected={cats} onChange={changeCats} counts={counts} />
        </CardContent>
      </Card>

      {!current ? (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            Select at least one category to start practising.
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
            <Button variant="ghost" onClick={() => next()}>
              <Shuffle /> Skip
            </Button>
            {deck.revealed ? (
              <Button onClick={() => next()}>
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
