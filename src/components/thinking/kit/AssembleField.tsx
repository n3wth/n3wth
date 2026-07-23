import { useMemo } from 'react'

/**
 * Generic version of the particle field built for /work's EmergenceField:
 * a seeded dot lattice that loses its grid along an easing envelope, freed
 * dots pulled into cluster positions with the same drift/twinkle CSS
 * (.work-dot/.work-grav/.work-tw in index.css — kept as-is so every field
 * on the site shares one animation system instead of N copies of it).
 * Each Thinking piece passes its own seed + cluster layout to get a
 * distinct shape without new CSS or new randomness code.
 */

function rnd(i: number, salt: number, seed: number) {
  const x = Math.sin(i * 127.1 + salt * 311.7 + seed * 74.7) * 43758.5453
  return x - Math.floor(x)
}

function smooth(t: number) {
  const c = Math.min(1, Math.max(0, t))
  return c * c * (3 - 2 * c)
}

interface Traveler {
  path: string
  begin: number
}

interface Dot {
  x: number
  y: number
  r: number
  fo: number
  fd: number
  disorder: number
  cluster: number
  tw: boolean
}

export interface AssembleFieldProps {
  /** Any integer — changes which dots go where without changing the shape rules. */
  seed?: number
  cols?: number
  rows?: number
  width?: number
  height?: number
  /** Where freed dots gather, in the same coordinate space as width/height. */
  clusters: [number, number][]
  /** Fraction of width (0-1) where the grid starts giving way to disorder. */
  envelopeStart?: number
  envelopeEnd?: number
  travelerCount?: number
  className?: string
}

export function AssembleField({
  seed = 0,
  cols = 46,
  rows = 12,
  width = 1600,
  height = 400,
  clusters,
  envelopeStart = 0.34,
  envelopeEnd = 0.52,
  travelerCount = 3,
  className,
}: AssembleFieldProps) {
  const reduced = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  )

  const { dots, travelers } = useMemo(() => {
    const W = width
    const H = height
    const dots: Dot[] = []
    for (let c = 0; c < cols; c++) {
      for (let row = 0; row < rows; row++) {
        const i = c * rows + row
        const t = c / (cols - 1)
        const gx = 30 + (W - 60) * t
        const gy = 34 + ((H - 68) * row) / (rows - 1)
        const disorder = Math.pow(smooth((t - envelopeStart) / envelopeEnd), 1.35)
        const free = rnd(i, 1, seed) < 0.3
        const k = Math.floor(rnd(i, 2, seed) * clusters.length)
        const [cx, cy] = clusters[k]
        const tx = free
          ? gx + (rnd(i, 3, seed) - 0.3) * 230
          : cx + (rnd(i, 4, seed) - 0.5) * 170 * (0.4 + rnd(i, 5, seed))
        const ty = free
          ? gy + (rnd(i, 6, seed) - 0.5) * 300
          : cy + (rnd(i, 7, seed) - 0.5) * 170 * (0.4 + rnd(i, 8, seed))
        const amt = disorder * (0.72 + rnd(i, 9, seed) * 0.28)
        dots.push({
          x: gx + (tx - gx) * amt,
          y: gy + (ty - gy) * amt,
          r: 1.6,
          fo: 0.6,
          fd: t * 1.1 + rnd(i, 13, seed) * 0.25,
          disorder,
          cluster: free ? -1 : k,
          tw: disorder > 0.45 && rnd(i, 14, seed) > 0.72,
        })
      }
    }
    const travelers: Traveler[] = []
    const sources = dots.filter((d) => d.disorder < 0.12 && d.x > W * 0.15)
    const dests = dots.filter((d) => d.disorder > 0.6 && d.fo > 0.75)
    for (let j = 0; j < travelerCount && j < sources.length && j < dests.length; j++) {
      const a = sources[Math.floor(rnd(j, 21, seed) * sources.length)]
      const b = dests[Math.floor(rnd(j, 22, seed) * dests.length)]
      travelers.push({
        path: `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} C ${(a.x + 240).toFixed(1)} ${(a.y - 20 - rnd(j, 23, seed) * 40).toFixed(1)}, ${(b.x - 280).toFixed(1)} ${(b.y + 10 + rnd(j, 24, seed) * 30).toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`,
        begin: j * 9 + rnd(j, 25, seed) * 3,
      })
    }
    return { dots, travelers }
  }, [seed, cols, rows, width, height, clusters, envelopeStart, envelopeEnd, travelerCount])

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid slice"
      className={className ?? 'block h-full w-full'}
      role="presentation"
      focusable="false"
    >
      {!reduced &&
        travelers.map((tr, i) => (
          <circle key={`t${i}`} r={1.7} fill="#f4f7fc" opacity={0}>
            <animateMotion
              dur="27s"
              begin={`${tr.begin.toFixed(1)}s`}
              repeatCount="indefinite"
              path={tr.path}
              calcMode="spline"
              keyTimes="0;0.35;1"
              keyPoints="0;1;1"
              keySplines="0.45 0 0.2 1;0 0 1 1"
            />
            <animate
              attributeName="opacity"
              values="0;0.95;0.95;0;0"
              keyTimes="0;0.05;0.3;0.35;1"
              dur="27s"
              begin={`${tr.begin.toFixed(1)}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      {dots.map((d, i) => {
        const circle = (
          <circle
            cx={d.x}
            cy={d.y}
            r={Math.max(0.7, d.r)}
            fill="#eef1f6"
            className="work-dot"
            style={{ '--fo': d.fo, '--fd': `${d.fd.toFixed(2)}s` } as React.CSSProperties}
          />
        )
        if (d.disorder > 0.15) {
          const [cx, cy] = clusters[d.cluster === -1 ? 0 : d.cluster]
          const ddx = cx - d.x
          const ddy = cy - d.y
          const len = Math.hypot(ddx, ddy) || 1
          const amp = Math.pow(d.disorder, 1.5) * (2.5 + rnd(i, 17, seed) * 3)
          const drift = (
            <g
              className="work-grav"
              style={
                {
                  '--gvx': `${((ddx / len) * amp).toFixed(2)}px`,
                  '--gvy': `${((ddy / len) * amp).toFixed(2)}px`,
                  '--gd': `${(7 + rnd(i, 18, seed) * 6).toFixed(2)}s`,
                  '--gl': `${((d.x / width) * 5 + rnd(i, 19, seed) * 2).toFixed(2)}s`,
                } as React.CSSProperties
              }
            >
              {circle}
            </g>
          )
          return d.tw ? (
            <g
              key={i}
              className="work-tw"
              style={{ '--twd': `${(5 + rnd(i, 19, seed) * 6).toFixed(2)}s`, '--tw': `${rnd(i, 20, seed) * 7}s` } as React.CSSProperties}
            >
              {drift}
            </g>
          ) : (
            <g key={i}>{drift}</g>
          )
        }
        return <g key={i}>{circle}</g>
      })}
    </svg>
  )
}
