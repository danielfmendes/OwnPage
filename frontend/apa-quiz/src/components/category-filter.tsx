import type { Category } from "@/types"
import { cn } from "@/lib/utils"
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/categories"

interface CategoryFilterProps {
  selected: Category[]
  onChange: (next: Category[]) => void
  counts?: Record<Category, number>
  /** restrict the displayed/selectable categories (defaults to all 8). */
  categories?: Category[]
}

export function CategoryFilter({
  selected,
  onChange,
  counts,
  categories = CATEGORIES,
}: CategoryFilterProps) {
  const allSelected = selected.length === categories.length

  function toggle(cat: Category) {
    if (selected.includes(cat)) onChange(selected.filter((c) => c !== cat))
    else onChange([...selected, cat])
  }

  function chip(active: boolean) {
    return cn(
      "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-input hover:bg-accent hover:text-accent-foreground"
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className={chip(allSelected)}
        onClick={() => onChange(allSelected ? [] : [...categories])}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          type="button"
          className={chip(selected.includes(cat))}
          onClick={() => toggle(cat)}
        >
          {CATEGORY_LABELS[cat]}
          {counts && <span className="ml-1 opacity-70">({counts[cat] ?? 0})</span>}
        </button>
      ))}
    </div>
  )
}
