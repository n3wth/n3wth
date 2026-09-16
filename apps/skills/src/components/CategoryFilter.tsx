'use client'
import { categories } from '../data/skills'
import { CategoryShape } from './CategoryShape'

interface CategoryFilterProps {
  activeCategory: string
  onCategoryChange: (id: string) => void
}

export function CategoryFilter({ activeCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div
      role="group"
      aria-label="Filter skills by category"
      className="flex flex-wrap gap-x-3 gap-y-1"
    >
      {categories.map(cat => (
        <button
          key={cat.id}
          type="button"
          aria-pressed={activeCategory === cat.id}
          onClick={() => onCategoryChange(cat.id)}
          className={`category-filter-btn px-1 py-2 text-sm font-medium flex items-center gap-2 shrink-0 min-h-[44px] relative ${
            activeCategory === cat.id ? 'category-filter-active' : ''
          }`}
        >
          {cat.id !== 'all' && <CategoryShape category={cat.id} size={10} />}
          {cat.name}
        </button>
      ))}
    </div>
  )
}
