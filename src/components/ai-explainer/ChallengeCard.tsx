import { memo } from 'react'
import type { Challenge } from '../../data/ai-challenges'
import { ChoiceButtons } from './ChoiceButtons'
import { ConsequenceViz } from './ConsequenceViz'

interface ChallengeCardProps {
  challenge: Challenge
  onChoice: (metrics: Record<string, number>) => void
  isAnimating: boolean
  chosenMetrics: Record<string, number> | null
}

export const ChallengeCard = memo(function ChallengeCard({
  challenge,
  onChoice,
  isAnimating,
  chosenMetrics
}: ChallengeCardProps) {
  return (
    <article
      data-challenge-card
      className="py-16 sm:py-20 md:py-24"
      style={{ borderTop: '1px solid var(--glass-border)' }}
    >
      <div className="mb-8 sm:mb-10">
        <h3 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-white mb-4 tracking-tight">
          {challenge.title}
        </h3>
        <p
          className="text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl"
          style={{ color: 'var(--color-grey-300)' }}
        >
          {challenge.scenario}
        </p>
      </div>

      <div className="mb-8 sm:mb-10">
        <div className="text-xs sm:text-sm mb-4" style={{ color: 'var(--color-grey-500)' }}>
          Choose a path
        </div>
        <ChoiceButtons
          choices={challenge.choices}
          onChoice={onChoice}
          isAnimating={isAnimating}
        />
      </div>

      <ConsequenceViz
        challengeId={challenge.id}
        metrics={chosenMetrics}
        isAnimating={isAnimating}
      />

      {chosenMetrics && (
        <div
          className="mt-8 sm:mt-10 p-4 sm:p-6 md:p-8 rounded-2xl"
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)'
          }}
        >
          <div className="text-xs sm:text-sm mb-2" style={{ color: 'var(--color-grey-500)' }}>
            Key Insight
          </div>
          <p
            className="text-sm sm:text-base md:text-lg leading-relaxed"
            style={{ color: 'var(--color-grey-200)' }}
          >
            {challenge.insight}
          </p>
        </div>
      )}
    </article>
  )
})
