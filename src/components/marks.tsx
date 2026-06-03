import type { CSSProperties } from 'react'

/**
 * Geometric blueprint marks — stroke-based, monochrome, flat.
 * Decorative: aria-hidden. Inherit color via currentColor.
 * Grammar: 64x64 viewBox, stroke 1, fill none (except deliberate nodes),
 * layered strokeOpacity ramp (0.18 / 0.28 / 0.45) so lines read as a
 * diagram rather than a thin hairline. No hover animation.
 */

type MarkProps = { className?: string; size?: number; style?: CSSProperties }

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 64 64',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1,
  'aria-hidden': true as const,
})

const R1 = 0.18
const R2 = 0.28
const R3 = 0.45

/** Concentric rings + node — trust / scale */
export function RingsMark({ className, size = 64 }: MarkProps) {
  // Two concentric ring families, slightly offset, so the strokes beat
  // against each other into a soft interference (moiré) figure — trust as
  // many overlapping signals resolving toward one center.
  const a = { cx: 29, cy: 32 }
  const b = { cx: 35, cy: 32 }
  return (
    <svg {...base(size)} className={className}>
      {[26, 21, 16, 11, 6].map((r, i) => (
        <circle
          key={'a' + r}
          cx={a.cx}
          cy={a.cy}
          r={r}
          strokeOpacity={R1 + i * 0.05}
        />
      ))}
      {[26, 21, 16, 11, 6].map((r, i) => (
        <circle
          key={'b' + r}
          cx={b.cx}
          cy={b.cy}
          r={r}
          strokeOpacity={R1 + i * 0.04}
        />
      ))}
      <circle cx="32" cy="32" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Node graph — ambient / multi-agent coordination */
export function NodesMark({ className, size = 64 }: MarkProps) {
  return (
    <svg {...base(size)} className={className}>
      <line x1="14" y1="18" x2="50" y2="14" strokeOpacity={R2} />
      <line x1="50" y1="14" x2="44" y2="48" strokeOpacity={R2} />
      <line x1="44" y1="48" x2="14" y2="18" strokeOpacity={R2} />
      <line x1="14" y1="18" x2="44" y2="48" strokeOpacity={R1} />
      <circle cx="14" cy="18" r="3.5" fill="var(--bg)" strokeOpacity={R3} />
      <circle cx="50" cy="14" r="3.5" fill="var(--bg)" strokeOpacity={R3} />
      <circle cx="44" cy="48" r="3.5" fill="var(--bg)" strokeOpacity={R3} />
    </svg>
  )
}

/** Isometric cube — platforms / building */
export function CubeMark({ className, size = 64 }: MarkProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M32 10 L52 21 L52 43 L32 54 L12 43 L12 21 Z" strokeOpacity={R3} />
      <path
        d="M32 10 L32 32 L52 21 M32 32 L12 21 M32 32 L32 54"
        strokeOpacity={R1}
      />
    </svg>
  )
}

/** Grid — frameworks / structure */
export function GridMark({ className, size = 64 }: MarkProps) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="12" y="12" width="40" height="40" strokeOpacity={R3} />
      <line x1="25.3" y1="12" x2="25.3" y2="52" strokeOpacity={R1} />
      <line x1="38.6" y1="12" x2="38.6" y2="52" strokeOpacity={R1} />
      <line x1="12" y1="25.3" x2="52" y2="25.3" strokeOpacity={R1} />
      <line x1="12" y1="38.6" x2="52" y2="38.6" strokeOpacity={R1} />
    </svg>
  )
}

/** Fork — decisions / trade-offs */
export function ForkMark({ className, size = 64 }: MarkProps) {
  // A single stream that splits into two flowing paths — a decision as a
  // current parting, not a rigid wishbone. Layered ghosts trail each branch.
  return (
    <svg {...base(size)} className={className} strokeLinecap="round">
      <path d="M32 56 C32 46 32 42 32 36" strokeOpacity={R3} />
      <path d="M32 36 C30 28 24 22 15 13" strokeOpacity={R2} />
      <path d="M32 36 C34 28 40 22 49 13" strokeOpacity={R2} />
      <path d="M32 38 C29 30 22 25 13 18" strokeOpacity={R1} />
      <path d="M32 38 C35 30 42 25 51 18" strokeOpacity={R1} />
      <circle cx="32" cy="56" r="2" fill="currentColor" stroke="none" />
      <circle cx="15" cy="13" r="2" fill="currentColor" stroke="none" />
      <circle cx="49" cy="13" r="2" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Radiating beams — light / creative installations */
export function BeamsMark({ className, size = 64 }: MarkProps) {
  // A field of LED pixels radiating from a bright core — light scattered into
  // the dark, the way his desert installations read at night. Pixel size and
  // brightness fall off with distance from center.
  const pts: { x: number; y: number; d: number }[] = []
  for (let ring = 1; ring <= 3; ring++) {
    const count = ring * 6
    const rad = ring * 9
    for (let k = 0; k < count; k++) {
      const ang = (k / count) * Math.PI * 2 + ring * 0.4
      pts.push({
        x: 32 + Math.cos(ang) * rad,
        y: 32 + Math.sin(ang) * rad,
        d: ring,
      })
    }
  }
  return (
    <svg {...base(size)} className={className}>
      <rect x="30.5" y="30.5" width="3" height="3" fill="currentColor" stroke="none" />
      {pts.map((p, i) => {
        const sz = 2.4 - p.d * 0.45
        const op = R3 - (p.d - 1) * 0.1
        return (
          <rect
            key={i}
            x={p.x - sz / 2}
            y={p.y - sz / 2}
            width={sz}
            height={sz}
            fill="currentColor"
            stroke="none"
            fillOpacity={op}
          />
        )
      })}
    </svg>
  )
}

/** Signal / arrow — contact */
export function ArrowMark({ className, size = 64 }: MarkProps) {
  return (
    <svg {...base(size)} className={className}>
      <line x1="14" y1="50" x2="50" y2="14" strokeOpacity={R3} />
      <path d="M30 14 L50 14 L50 34" strokeOpacity={R2} />
    </svg>
  )
}

/**
 * Agentic cursor / pointer glyph — the wordmark logo.
 * Rounded arrow-pointer (ChatGPT-agent-style). White via currentColor.
 */
export function CursorMark({ className, size = 18, style }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={className}
      style={style}
    >
      <path
        d="M7.4 5.1 26.8 14.2c1.5.7 1.4 2.9-.2 3.4l-7.6 2.2a2.4 2.4 0 0 0-1.6 1.5l-2.7 7.5c-.6 1.6-2.9 1.5-3.3-.2L5.3 7.2C4.9 5.6 6 4.4 7.4 5.1Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}
