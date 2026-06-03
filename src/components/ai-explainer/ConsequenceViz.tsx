import { memo } from "react"
import { TensionField } from "./TensionField"

interface ConsequenceVizProps {
  challengeId: string
  metrics: Record<string, number> | null
  isAnimating: boolean
  poleLabels?: [string, string]
}

/**
 * The consequence of a choice, rendered as art rather than a chart.
 * A generative two-pole tension field — the seam between two opposing forces.
 * The field redistributes toward whatever the choice optimized for; the
 * imbalance is felt, not tallied. No numbers, no percentages, no labeled nodes.
 */
export const ConsequenceViz = memo(function ConsequenceViz({
  metrics,
  isAnimating,
  poleLabels,
}: ConsequenceVizProps) {
  return (
    <div
      className="mt-8 p-4 sm:p-6 md:p-8"
      style={{ border: "1px solid var(--rail)" }}
    >
      <div className="flex items-baseline justify-between gap-4 mb-1">
        <p className="index" style={{ color: "var(--accent)" }}>
          The Geometry of Equilibrium
        </p>
        <p className="index">
          {metrics ? "What you optimized for" : "The field at rest"}
        </p>
      </div>
      <p className="meta mb-5 max-w-2xl">
        Two opposing forces in one field. Alignment is the art of holding the seam.
      </p>

      <TensionField metrics={metrics} isAnimating={isAnimating} />

      {poleLabels && (
        <div className="mt-4 flex items-center justify-between">
          <span className="index" style={{ color: "var(--ink-faint)" }}>
            {poleLabels[0]}
          </span>
          <span className="index" style={{ color: "var(--ink-faint)" }}>
            {poleLabels[1]}
          </span>
        </div>
      )}
    </div>
  )
})
