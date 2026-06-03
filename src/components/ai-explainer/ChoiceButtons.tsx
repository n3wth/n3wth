import { memo } from 'react'
import { ChevronRight } from 'lucide-react'

interface Choice {
  label: string
  description: string
  metrics: Record<string, number>
}

interface ChoiceButtonsProps {
  choices: Choice[]
  onChoice: (metrics: Record<string, number>) => void
  isAnimating: boolean
}

export const ChoiceButtons = memo(function ChoiceButtons({
  choices,
  onChoice,
  isAnimating,
}: ChoiceButtonsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-px" style={{ background: 'var(--rail)' }}>
      {choices.map((choice, idx) => (
        <button
          key={idx}
          onClick={() => onChoice(choice.metrics)}
          disabled={isAnimating}
          className="cell group relative flex-1 px-5 py-4 sm:px-6 sm:py-5 text-left disabled:opacity-50"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <div
                className="font-display text-base sm:text-lg font-semibold mb-1"
                style={{ color: 'var(--ink)', letterSpacing: '-0.02em' }}
              >
                {choice.label}
              </div>
              <div className="meta">{choice.description}</div>
            </div>
            <ChevronRight
              className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 shrink-0"
              style={{ color: 'var(--faint)' }}
              aria-hidden="true"
            />
          </div>
        </button>
      ))}
    </div>
  )
})
