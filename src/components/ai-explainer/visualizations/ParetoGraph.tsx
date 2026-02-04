import { memo } from 'react'

interface ParetoGraphProps {
  metrics: Record<string, number> | null
}

export const ParetoGraph = memo(function ParetoGraph({ metrics }: ParetoGraphProps) {
  const engagementValue = metrics?.engagement || 50
  const alignmentValue = metrics?.alignment || 50
  const hasChoice = metrics !== null

  // Map values to coordinates
  const pointX = 50 + (engagementValue / 100) * 300
  const pointY = 250 - (alignmentValue / 100) * 200

  return (
    <svg viewBox="0 0 400 280" className="w-full h-auto" style={{ maxHeight: '280px' }}>
      {/* Grid */}
      <defs>
        <pattern id="grid" width="30" height="20" patternUnits="userSpaceOnUse">
          <path d="M 30 0 L 0 0 0 20" fill="none" stroke="var(--color-grey-800)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect x="50" y="50" width="300" height="200" fill="url(#grid)" opacity="0.5" />

      {/* Axes */}
      <line x1="50" y1="250" x2="350" y2="250" stroke="var(--color-grey-600)" strokeWidth="2" />
      <line x1="50" y1="250" x2="50" y2="50" stroke="var(--color-grey-600)" strokeWidth="2" />

      {/* Axis labels */}
      <text x="200" y="275" textAnchor="middle" fill="var(--color-grey-400)" fontSize="11">
        Engagement
      </text>
      <text
        x="20"
        y="150"
        textAnchor="middle"
        fill="var(--color-grey-400)"
        fontSize="11"
        transform="rotate(-90, 20, 150)"
      >
        Alignment
      </text>

      {/* Pareto frontier curve */}
      <path
        d="M 70 230 Q 120 180 180 140 Q 250 100 330 70"
        stroke="var(--color-yellow-500)"
        strokeWidth="2"
        fill="none"
        opacity="0.4"
        strokeDasharray="6,4"
      />
      <text x="340" y="65" fill="var(--color-yellow-500)" fontSize="9" opacity="0.7">
        frontier
      </text>

      {/* Data point */}
      <circle
        cx={hasChoice ? pointX : 200}
        cy={hasChoice ? pointY : 150}
        r="12"
        fill="var(--color-blue-500)"
        opacity={hasChoice ? 0.9 : 0.3}
      />
      <circle
        cx={hasChoice ? pointX : 200}
        cy={hasChoice ? pointY : 150}
        r="12"
        fill="none"
        stroke="white"
        strokeWidth="2"
        opacity={hasChoice ? 0.8 : 0.2}
      />

      {/* Value labels near point */}
      {hasChoice && (
        <>
          <text
            x={pointX}
            y={pointY - 20}
            textAnchor="middle"
            fill="white"
            fontSize="11"
            fontWeight="600"
          >
            {alignmentValue}% aligned
          </text>
          <text
            x={pointX}
            y={pointY + 28}
            textAnchor="middle"
            fill="var(--color-grey-400)"
            fontSize="10"
          >
            {engagementValue}% engaged
          </text>
        </>
      )}

      {/* Scale markers */}
      <text x="50" y="265" fill="var(--color-grey-600)" fontSize="9">0</text>
      <text x="345" y="265" fill="var(--color-grey-600)" fontSize="9">100</text>
      <text x="35" y="255" fill="var(--color-grey-600)" fontSize="9">0</text>
      <text x="35" y="55" fill="var(--color-grey-600)" fontSize="9">100</text>
    </svg>
  )
})
