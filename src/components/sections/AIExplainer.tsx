import { SectionHeader } from '../Frame'
import { ForkMark } from '../marks'
import { aiChallenges } from '../../data/ai-challenges'
import { useAIExplainerState } from '../../hooks/useAIExplainerState'
import { ChallengeCard } from '../ai-explainer/ChallengeCard'

export function AIExplainer() {
  const { makeChoice, getChallengeState } = useAIExplainerState()

  return (
    <section id="ai-explainer" aria-label="Alignment">
      <SectionHeader
        index="04"
        eyebrow="Alignment"
        title={
          <>
            Most AI safety calls are <span className="accent">trade-offs</span>,
            not clean answers
          </>
        }
        lede="Each is a real dilemma I've worked through, and every option costs real people something. Pick a path, see exactly what it trades away, then read the call I actually made."
        mark={<ForkMark size={56} />}
      />

      <div className="section-pad pad-tight !pt-0">
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
