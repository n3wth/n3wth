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
  isAnimating
}: ChoiceButtonsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
      {choices.map((choice, idx) => (
        <button
          key={idx}
          onClick={() => onChoice(choice.metrics)}
          disabled={isAnimating}
          className="group relative flex-1 px-5 py-4 sm:px-6 sm:py-5 text-left transition-all duration-200 disabled:opacity-50 rounded-lg border-2 border-white/20 hover:border-white/50 hover:bg-white/5 focus:outline-none focus:border-white/60"
          style={{ background: 'transparent' }}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-display text-base sm:text-lg font-semibold text-white mb-1">
                {choice.label}
              </div>
              <div className="text-sm text-white/60">
                {choice.description}
              </div>
            </div>
            <ChevronRight
              className="w-5 h-5 text-white/40 group-hover:text-white/80 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0"
            />
          </div>
        </button>
      ))}
    </div>
  )
})
