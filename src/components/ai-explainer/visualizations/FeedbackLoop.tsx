import { memo } from 'react'

interface FeedbackLoopProps {
  metrics: Record<string, number> | null
}

export const FeedbackLoop = memo(function FeedbackLoop({ metrics }: FeedbackLoopProps) {
  const capabilityValue = metrics?.capability || 0
  const transparencyValue = metrics?.transparency || 0
  const trustValue = metrics?.trust || 0
  const hasChoice = metrics !== null

  return (
    <svg viewBox="0 0 400 280" className="w-full h-auto" style={{ maxHeight: '280px' }}>
      <defs>
        <marker
          id="arrowhead"
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="4"
          orient="auto"
        >
          <polygon points="0 0, 8 4, 0 8" fill="var(--color-grey-500)" />
        </marker>
      </defs>

      {/* Outer ring */}
      <circle
        cx="200"
        cy="140"
        r="100"
        fill="none"
        stroke="var(--color-grey-700)"
        strokeWidth="1"
        opacity="0.3"
      />

      {/* Capability node - top */}
      <circle
        cx="200"
        cy="50"
        r="35"
        fill="var(--color-purple-500)"
        opacity={hasChoice ? 0.2 : 0.05}
      />
      <circle
        cx="200"
        cy="50"
        r="35"
        fill="none"
        stroke="var(--color-purple-500)"
        strokeWidth="2"
        opacity={hasChoice ? 0.8 : 0.3}
      />
      <text x="200" y="45" textAnchor="middle" fill="var(--color-purple-400)" fontSize="10">
        Capability
      </text>
      <text x="200" y="60" textAnchor="middle" fill="white" fontSize="14" fontWeight="700">
        {hasChoice ? `${capabilityValue}%` : '—'}
      </text>

      {/* Transparency node - bottom left */}
      <circle
        cx="100"
        cy="200"
        r="35"
        fill="var(--color-green-500)"
        opacity={hasChoice ? 0.2 : 0.05}
      />
      <circle
        cx="100"
        cy="200"
        r="35"
        fill="none"
        stroke="var(--color-green-500)"
        strokeWidth="2"
        opacity={hasChoice ? 0.8 : 0.3}
      />
      <text x="100" y="195" textAnchor="middle" fill="var(--color-green-400)" fontSize="10">
        Transparency
      </text>
      <text x="100" y="210" textAnchor="middle" fill="white" fontSize="14" fontWeight="700">
        {hasChoice ? `${transparencyValue}%` : '—'}
      </text>

      {/* Trust node - bottom right */}
      <circle
        cx="300"
        cy="200"
        r="35"
        fill="var(--color-blue-500)"
        opacity={hasChoice ? 0.2 : 0.05}
      />
      <circle
        cx="300"
        cy="200"
        r="35"
        fill="none"
        stroke="var(--color-blue-500)"
        strokeWidth="2"
        opacity={hasChoice ? 0.8 : 0.3}
      />
      <text x="300" y="195" textAnchor="middle" fill="var(--color-blue-400)" fontSize="10">
        Trust
      </text>
      <text x="300" y="210" textAnchor="middle" fill="white" fontSize="14" fontWeight="700">
        {hasChoice ? `${trustValue}%` : '—'}
      </text>

      {/* Arrows connecting nodes */}
      <path
        d="M 230 65 Q 270 100 285 165"
        fill="none"
        stroke="var(--color-grey-500)"
        strokeWidth="2"
        markerEnd="url(#arrowhead)"
        opacity={hasChoice ? 0.6 : 0.2}
      />
      <path
        d="M 265 210 Q 200 240 135 210"
        fill="none"
        stroke="var(--color-grey-500)"
        strokeWidth="2"
        markerEnd="url(#arrowhead)"
        opacity={hasChoice ? 0.6 : 0.2}
      />
      <path
        d="M 115 165 Q 130 100 170 65"
        fill="none"
        stroke="var(--color-grey-500)"
        strokeWidth="2"
        markerEnd="url(#arrowhead)"
        opacity={hasChoice ? 0.6 : 0.2}
      />

      {/* Labels on arrows */}
      <text x="290" y="120" fill="var(--color-grey-500)" fontSize="9" opacity="0.7">
        enables
      </text>
      <text x="190" y="255" fill="var(--color-grey-500)" fontSize="9" opacity="0.7">
        builds
      </text>
      <text x="110" y="120" fill="var(--color-grey-500)" fontSize="9" opacity="0.7">
        requires
      </text>
    </svg>
  )
})
