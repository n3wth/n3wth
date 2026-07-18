/**
 * The page's subject as a drawing instead of a photograph: one path of
 * light that forks. Three strokes per path — haze, glow, filament — so
 * it reads as light, not line art. The two branches run slightly
 * different temperatures: no choice is neutral.
 *
 * Draw-in is keyed off the reveal system: [data-reveal].is-in starts
 * the dashoffset animation; reduced motion shows it complete.
 */

const TRUNK = 'M -20 214 C 300 204, 620 214, 858 210'
const UPPER = 'M 858 210 C 1140 194, 1350 148, 1630 82'
const LOWER = 'M 858 210 C 1150 234, 1330 302, 1630 376'

const LAYERS = [
  { width: 22, filter: 'url(#fork-haze)', opacity: 0.2, cls: 'fork-haze' },
  { width: 7, filter: 'url(#fork-glow)', opacity: 0.5, cls: 'fork-glow' },
  { width: 2, filter: undefined, opacity: 1, cls: 'fork-core' },
] as const

const PATHS = [
  { d: TRUNK, color: '#f2f0ec', cls: 'fork-trunk' },
  { d: UPPER, color: '#d8e3f6', cls: 'fork-branch' },
  { d: LOWER, color: '#ffe3c2', cls: 'fork-branch fork-branch-b' },
] as const

export function ForkLight() {
  return (
    <svg
      viewBox="0 0 1600 420"
      preserveAspectRatio="xMidYMid slice"
      className="block h-full w-full"
      role="presentation"
      focusable="false"
    >
      <defs>
        <filter id="fork-haze" x="-20%" y="-300%" width="140%" height="700%">
          <feGaussianBlur stdDeviation="13" />
        </filter>
        <filter id="fork-glow" x="-20%" y="-300%" width="140%" height="700%">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
      </defs>
      {PATHS.map((p) =>
        LAYERS.map((l) => (
          <path
            key={p.cls + l.cls}
            d={p.d}
            pathLength={1}
            fill="none"
            stroke={p.color}
            strokeWidth={l.width}
            strokeLinecap="round"
            filter={l.filter}
            opacity={l.opacity}
            className={`fork-path ${p.cls}`}
          />
        ))
      )}
    </svg>
  )
}
