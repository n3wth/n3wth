import { memo } from 'react'

interface Choice {
  label: string
  metrics: Record<string, number>
}

interface TradeoffBarsProps {
  choices: Choice[]
  /** The metrics of the choice the visitor picked, or null before choosing. */
  chosenMetrics: Record<string, number> | null
}

/**
 * Shows the real trade-off between the two choices as labeled bars. Every
 * dilemma scores the same axes (e.g. safety, fairness, coverage) differently —
 * laying both choices side by side makes "what you gain vs. what you give up"
 * legible at a glance. The picked choice is emphasised once chosen.
 */
export const TradeoffBars = memo(function TradeoffBars({
  choices,
  chosenMetrics,
}: TradeoffBarsProps) {
  if (choices.length < 2) return null
  const [a, b] = choices
  const axes = Object.keys(a.metrics)

  const chosenLabel = chosenMetrics
    ? choices.find((c) => c.metrics === chosenMetrics)?.label ?? null
    : null

  return (
    <div className="mt-8 p-5 md:p-7" style={{ border: '1px solid var(--rail)' }}>
      <div className="flex items-baseline justify-between gap-4 mb-1">
        <p className="index" style={{ color: 'var(--accent)' }}>
          Trade-off
        </p>
        <p className="index">
          {chosenLabel ? `You chose: ${chosenLabel}` : 'What each path costs'}
        </p>
      </div>
      <p className="meta mb-6 max-w-2xl">
        Higher isn't better — every gain on one axis is paid for on another.
      </p>

      {/* Column headers */}
      <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] sm:grid-cols-[7rem_minmax(0,1fr)] gap-x-4 sm:gap-x-6 mb-4">
        <span />
        <div className="grid grid-cols-2 gap-4">
          {[a, b].map((c) => {
            const isChosen = chosenLabel === c.label
            return (
              <span
                key={c.label}
                className="index"
                style={{ color: isChosen ? 'var(--ink)' : 'var(--ink-dim)' }}
              >
                {c.label}
              </span>
            )
          })}
        </div>
      </div>

      <div className="space-y-4">
        {axes.map((axis) => (
          <div
            key={axis}
            className="grid grid-cols-[5.5rem_minmax(0,1fr)] sm:grid-cols-[7rem_minmax(0,1fr)] gap-x-4 sm:gap-x-6 items-center"
          >
            <span className="meta capitalize">{axis}</span>
            <div className="grid grid-cols-2 gap-4">
              {[a, b].map((c) => {
                const value = c.metrics[axis] ?? 0
                const isChosen = chosenLabel === c.label
                const dim = chosenLabel !== null && !isChosen
                return (
                  <div key={c.label} className="flex items-center gap-3">
                    <div
                      className="relative h-1.5 flex-1 overflow-hidden"
                      style={{ background: 'var(--rail)' }}
                    >
                      <div
                        className="absolute inset-y-0 left-0 transition-[width] duration-700 ease-out"
                        style={{
                          width: `${value}%`,
                          background: isChosen ? 'var(--accent)' : 'var(--ink-dim)',
                          opacity: dim ? 0.4 : 1,
                        }}
                      />
                    </div>
                    <span
                      className="mono text-xs tabular-nums w-7 text-right shrink-0"
                      style={{ color: dim ? 'var(--ink-faint)' : 'var(--ink-dim)' }}
                    >
                      {value}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})
