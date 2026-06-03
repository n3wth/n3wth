import { memo } from 'react'
import type { Challenge } from '../../data/ai-challenges'
import { ChoiceButtons } from './ChoiceButtons'
import { ConsequenceViz } from './ConsequenceViz'

interface ChallengeCardProps {
  challenge: Challenge
  index: number
  onChoice: (metrics: Record<string, number>) => void
  isAnimating: boolean
  chosenMetrics: Record<string, number> | null
}

export const ChallengeCard = memo(function ChallengeCard({
  challenge,
  index,
  onChoice,
  isAnimating,
  chosenMetrics,
}: ChallengeCardProps) {
  return (
    <article
      data-reveal
      data-challenge-card
      className="reveal relative py-10 md:py-14"
      style={{ borderBottom: '1px solid var(--rail)' }}
    >
      <div className="grid gap-6 md:grid-cols-[7rem_minmax(0,1fr)] md:gap-10">
        <span className="index md:pt-2">{String(index + 1).padStart(2, '0')}</span>

        <div>
          <h3 className="display text-[clamp(1.5rem,4vw,2.5rem)] mb-5">
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

          <ConsequenceViz
            challengeId={challenge.id}
            metrics={chosenMetrics}
            isAnimating={isAnimating}
            poleLabels={
              challenge.choices.length >= 2
                ? [challenge.choices[0].label, challenge.choices[1].label]
                : undefined
            }
          />

          {chosenMetrics && (
            <div
              className="mt-8 p-5 md:p-7"
              style={{ border: '1px solid var(--rail)' }}
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
