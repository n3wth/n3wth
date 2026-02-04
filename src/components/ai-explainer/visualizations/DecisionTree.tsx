import { memo } from 'react'

interface DecisionTreeProps {
  metrics: Record<string, number> | null
}

export const DecisionTree = memo(function DecisionTree({ metrics }: DecisionTreeProps) {
  const safetyValue = metrics?.safety || 0
  const fairnessValue = metrics?.fairness || 0
  const hasChoice = metrics !== null

  return (
    <svg viewBox="0 0 400 280" className="w-full h-auto" style={{ maxHeight: '280px' }}>
      {/* Root node */}
      <circle
        cx="200"
        cy="50"
        r="35"
        fill="none"
        stroke="var(--color-grey-500)"
        strokeWidth="2"
        opacity={hasChoice ? 1 : 0.4}
      />
      <text
        x="200"
        y="55"
        textAnchor="middle"
        fill="var(--color-grey-300)"
        fontSize="12"
        fontWeight="600"
      >
        Decision
      </text>

      {/* Left branch - Safety */}
      <line
        x1="170"
        y1="78"
        x2="100"
        y2="140"
        stroke="var(--color-green-500)"
        strokeWidth="2"
        opacity={hasChoice ? 0.8 : 0.3}
      />
      <circle
        cx="100"
        cy="170"
        r="40"
        fill="var(--color-green-500)"
        opacity={hasChoice ? 0.15 : 0.05}
      />
      <circle
        cx="100"
        cy="170"
        r="40"
        fill="none"
        stroke="var(--color-green-500)"
        strokeWidth="2"
        opacity={hasChoice ? 0.8 : 0.3}
      />
      <text
        x="100"
        y="165"
        textAnchor="middle"
        fill="var(--color-green-400)"
        fontSize="11"
        fontWeight="500"
      >
        Safety
      </text>
      <text
        x="100"
        y="182"
        textAnchor="middle"
        fill="white"
        fontSize="16"
        fontWeight="700"
      >
        {hasChoice ? `${safetyValue}%` : '—'}
      </text>

      {/* Right branch - Fairness */}
      <line
        x1="230"
        y1="78"
        x2="300"
        y2="140"
        stroke="var(--color-blue-500)"
        strokeWidth="2"
        opacity={hasChoice ? 0.8 : 0.3}
      />
      <circle
        cx="300"
        cy="170"
        r="40"
        fill="var(--color-blue-500)"
        opacity={hasChoice ? 0.15 : 0.05}
      />
      <circle
        cx="300"
        cy="170"
        r="40"
        fill="none"
        stroke="var(--color-blue-500)"
        strokeWidth="2"
        opacity={hasChoice ? 0.8 : 0.3}
      />
      <text
        x="300"
        y="165"
        textAnchor="middle"
        fill="var(--color-blue-400)"
        fontSize="11"
        fontWeight="500"
      >
        Fairness
      </text>
      <text
        x="300"
        y="182"
        textAnchor="middle"
        fill="white"
        fontSize="16"
        fontWeight="700"
      >
        {hasChoice ? `${fairnessValue}%` : '—'}
      </text>

      {/* Labels */}
      <text x="80" y="245" fill="var(--color-grey-500)" fontSize="10" textAnchor="middle">
        Catch more harm
      </text>
      <text x="320" y="245" fill="var(--color-grey-500)" fontSize="10" textAnchor="middle">
        Fewer false positives
      </text>
    </svg>
  )
})
