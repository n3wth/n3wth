import { useRef } from 'react'
import { useReveal } from '../../hooks/useReveal'
import { SectionHeader } from '../Frame'
import { ForkMark } from '../marks'
import { aiChallenges } from '../../data/ai-challenges'
import { useAIExplainerState } from '../../hooks/useAIExplainerState'
import { ChallengeCard } from '../ai-explainer/ChallengeCard'

export function AIExplainer() {
  const ref = useRef<HTMLElement>(null)
  const { makeChoice, getChallengeState } = useAIExplainerState()
  useReveal(ref)

  return (
    <section ref={ref} id="ai-explainer" aria-label="Alignment">
      <SectionHeader
        index="05"
        eyebrow="The decisions that keep me up at night"
        title={
          <>
            Every AI decision is a <span className="signal">bet</span> on what
            matters most
          </>
        }
        lede="There are no clean answers in AI safety — only trade-offs with real consequences for real people. Three dilemmas I've faced. Make a choice and see what you're actually optimizing for."
        mark={<ForkMark size={56} />}
      />

      <div className="section-pad !pt-0">
        <div style={{ borderTop: '1px solid var(--rail)' }}>
          {aiChallenges.map((challenge, i) => {
            const state = getChallengeState(challenge.id)
            return (
              <ChallengeCard
                key={challenge.id}
                index={i}
                challenge={challenge}
                onChoice={(metrics) => makeChoice(challenge.id, metrics)}
                isAnimating={state.isAnimating}
                chosenMetrics={state.chosenMetrics}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
