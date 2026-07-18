import { memo } from 'react'
import type { Challenge } from '../../data/ai-challenges'
import { ChoiceButtons } from './ChoiceButtons'
import { TradeoffBars } from './TradeoffBars'

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
  chosenMetrics,
}: ChallengeCardProps) {
  return (
    <article
      data-challenge-card
      className="cell relative px-5 py-8 md:px-8 md:py-10"
    >
      <div className="relative max-w-3xl">
        <div>
          <h3
            className="display text-xl md:text-2xl mb-4"
            style={{ letterSpacing: '-0.02em' }}
          >
            {challenge.title}
          </h3>
          <p
            className="text-sm md:text-base leading-relaxed max-w-2xl mb-8"
            style={{ color: 'var(--ink-dim)' }}
          >
            {challenge.scenario}
          </p>

          <p className="index mb-4">Choose a path</p>
          <ChoiceButtons
            choices={challenge.choices}
            onChoice={onChoice}
            isAnimating={isAnimating}
          />

          <TradeoffBars choices={challenge.choices} chosenMetrics={chosenMetrics} />

          {chosenMetrics && (
            <div
              className="mt-8 p-5 md:p-7 rounded-xl"
              style={{ background: 'rgba(255, 255, 255, 0.04)' }}
            >
              <p className="index mb-3" style={{ color: 'var(--accent)' }}>
                Key insight
              </p>
              <p
                className="text-sm md:text-base leading-relaxed"
                style={{ color: 'var(--ink)' }}
              >
                {challenge.insight}
              </p>
            </div>
          )}
        </div>
      </div>
    </article>
  )
})
