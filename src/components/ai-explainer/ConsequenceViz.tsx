import { memo } from "react"
import { TensionField } from "./TensionField"

interface ConsequenceVizProps {
  challengeId: string
  metrics: Record<string, number> | null
  isAnimating: boolean
  poleLabels?: [string, string]
}

/**
 * Shows the consequence of a choice as a two-pole tension field. The field
 * redistributes toward whatever the choice optimized for, so the trade-off is
 * visible without numbers or labeled nodes.
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
          Trade-off
        </p>
        <p className="index">
          {metrics ? "What you optimized for" : "Before you choose"}
        </p>
      </div>
      <p className="meta mb-5 max-w-2xl">
        Each choice pulls the field toward one priority and away from another.
      </p>

      <TensionField metrics={metrics} isAnimating={isAnimating} />

      {poleLabels && (
        <div className="mt-4 flex items-center justify-between">
          <span className="index">
            {poleLabels[0]}
          </span>
          <span className="index">
            {poleLabels[1]}
          </span>
        </div>
      )}
    </div>
  )
})
