import { memo } from 'react'

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
  isAnimating
}: ChoiceButtonsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
      {choices.map((choice, idx) => (
        <button
          key={idx}
          onClick={() => onChoice(choice.metrics)}
          disabled={isAnimating}
          className="group relative flex-1 px-6 py-4 sm:px-8 sm:py-5 text-left transition-all duration-300 disabled:opacity-50 hover:scale-[1.02] focus-ring rounded-xl"
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)'
          }}
        >
          <div className="font-display text-base sm:text-lg font-semibold text-white mb-1">
            {choice.label}
          </div>
          <div className="text-sm" style={{ color: 'var(--color-grey-400)' }}>
            {choice.description}
          </div>
        </button>
      ))}
    </div>
  )
})
