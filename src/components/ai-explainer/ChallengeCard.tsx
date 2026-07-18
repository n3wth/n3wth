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

/* Choice-first: the scenario and the two paths are all you see. The
   trade-off bars and the call Oliver actually made appear only after
   you commit — showing the bars up front spoiled the choice and turned
   the card into a spreadsheet. */
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
      <div className="relative">
        <div className="max-w-3xl">
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

          <p className="index mb-4">
            {chosenMetrics ? 'Your call' : 'Make the call'}
          </p>
          <ChoiceButtons
            choices={challenge.choices}
            onChoice={onChoice}
            isAnimating={isAnimating}
          />
        </div>

        {chosenMetrics && (
          <div className="challenge-reveal">
            <TradeoffBars choices={challenge.choices} chosenMetrics={chosenMetrics} />

            <div
              className="mt-8 p-5 md:p-7 rounded-xl"
              style={{ background: 'rgba(255, 255, 255, 0.04)' }}
            >
              <p className="index mb-3" style={{ color: 'var(--accent)' }}>
                The call I made
              </p>
              <p
                className="text-sm md:text-base leading-relaxed max-w-3xl"
                style={{ color: 'var(--ink)' }}
              >
                {challenge.insight}
              </p>
            </div>
          </div>
        )}
      </div>
    </article>
  )
})
