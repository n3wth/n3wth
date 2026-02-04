import { memo, useMemo } from 'react'
import { DecisionTree } from './visualizations/DecisionTree'
import { ParetoGraph } from './visualizations/ParetoGraph'
import { FeedbackLoop } from './visualizations/FeedbackLoop'

interface ConsequenceVizProps {
  challengeId: string
  metrics: Record<string, number> | null
  isAnimating: boolean
}

export const ConsequenceViz = memo(function ConsequenceViz({
  challengeId,
  metrics,
  isAnimating
}: ConsequenceVizProps) {
  const vizComponent = useMemo(() => {
    switch (challengeId) {
      case 'challenge-1':
        return <DecisionTree metrics={metrics} />
      case 'challenge-2':
        return <ParetoGraph metrics={metrics} />
      case 'challenge-3':
        return <FeedbackLoop metrics={metrics} />
      default:
        return null
    }
  }, [challengeId, metrics])

  return (
    <div
      data-consequence-viz
      className="mt-8 sm:mt-10 p-4 sm:p-6 md:p-8 rounded-2xl transition-all duration-500"
      style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        opacity: isAnimating ? 1 : 0.85
      }}
    >
      <div className="text-xs sm:text-sm mb-4" style={{ color: 'var(--color-grey-500)' }}>
        Consequences
      </div>
      {vizComponent}
    </div>
  )
})
