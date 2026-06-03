/**
 * Geometric blueprint marks — stroke-based, monochrome, flat.
 * Decorative: aria-hidden. Inherit color via currentColor.
 */

type MarkProps = { className?: string; size?: number }

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 64 64',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1,
  'aria-hidden': true as const,
})

/** Concentric rings + node — trust / scale */
export function RingsMark({ className, size = 64 }: MarkProps) {
  return (
    <svg {...base(size)} className={className}>
      <circle cx="32" cy="32" r="6" />
      <circle cx="32" cy="32" r="15" />
      <circle cx="32" cy="32" r="24" />
      <circle cx="32" cy="32" r="2" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Node graph — ambient / multi-agent coordination */
export function NodesMark({ className, size = 64 }: MarkProps) {
  return (
    <svg {...base(size)} className={className}>
      <line x1="14" y1="18" x2="50" y2="14" />
      <line x1="50" y1="14" x2="44" y2="48" />
      <line x1="44" y1="48" x2="14" y2="18" />
      <line x1="14" y1="18" x2="44" y2="48" />
      <circle cx="14" cy="18" r="3.5" fill="var(--canvas)" />
      <circle cx="50" cy="14" r="3.5" fill="var(--canvas)" />
      <circle cx="44" cy="48" r="3.5" fill="var(--canvas)" />
    </svg>
  )
}

/** Isometric cube — platforms / building */
export function CubeMark({ className, size = 64 }: MarkProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M32 10 L52 21 L52 43 L32 54 L12 43 L12 21 Z" />
      <path d="M32 10 L32 32 L52 21 M32 32 L12 21 M32 32 L32 54" />
    </svg>
  )
}

/** Grid — frameworks / structure */
export function GridMark({ className, size = 64 }: MarkProps) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="12" y="12" width="40" height="40" />
      <line x1="25.3" y1="12" x2="25.3" y2="52" />
      <line x1="38.6" y1="12" x2="38.6" y2="52" />
      <line x1="12" y1="25.3" x2="52" y2="25.3" />
      <line x1="12" y1="38.6" x2="52" y2="38.6" />
    </svg>
  )
}

/** Fork — decisions / trade-offs */
export function ForkMark({ className, size = 64 }: MarkProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M32 52 L32 34" />
      <path d="M32 34 L16 14" />
      <path d="M32 34 L48 14" />
      <circle cx="32" cy="54" r="2.5" fill="currentColor" stroke="none" />
      <circle cx="16" cy="12" r="2.5" fill="currentColor" stroke="none" />
      <circle cx="48" cy="12" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Radiating beams — light / creative installations */
export function BeamsMark({ className, size = 64 }: MarkProps) {
  return (
    <svg {...base(size)} className={className}>
      <circle cx="32" cy="32" r="5" />
      <line x1="32" y1="6" x2="32" y2="16" />
      <line x1="32" y1="48" x2="32" y2="58" />
      <line x1="6" y1="32" x2="16" y2="32" />
      <line x1="48" y1="32" x2="58" y2="32" />
      <line x1="14" y1="14" x2="21" y2="21" />
      <line x1="43" y1="43" x2="50" y2="50" />
      <line x1="50" y1="14" x2="43" y2="21" />
      <line x1="21" y1="43" x2="14" y2="50" />
    </svg>
  )
}

/** Signal / arrow — contact */
export function ArrowMark({ className, size = 64 }: MarkProps) {
  return (
    <svg {...base(size)} className={className}>
      <line x1="14" y1="50" x2="50" y2="14" />
      <path d="M30 14 L50 14 L50 34" />
    </svg>
  )
}
