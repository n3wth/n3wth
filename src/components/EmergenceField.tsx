import { useMemo } from 'react'

/**
 * Hand-designed order becoming emergence: a true dot lattice on the
 * left that loses its grid along an easing envelope, the freed dots
 * pulled into constellation clusters with faint connecting wisps.
 * Everything is seeded — the same field every visit — and the motion
 * flows left to right: the reveal staggers across, and the emergent
 * dots drift on a phase wave that travels in the direction of the
 * dissolve. Reduced motion shows the finished field, still.
 */

const COLS = 46
const ROWS = 12
const W = 1600
const H = 400

const CLUSTERS: [number, number][] = [
  [1128, 62],
  [1286, 234],
  [1430, 46],
  [1348, 356],
  [1528, 176],
]

function rnd(i: number, salt: number) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453
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

export function EmergenceField() {
  const reduced = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  )
  const { dots, travelers } = useMemo(() => {
    const dots: Dot[] = []
    for (let c = 0; c < COLS; c++) {
      for (let row = 0; row < ROWS; row++) {
        const i = c * ROWS + row
        const t = c / (COLS - 1)
        const gx = 30 + (W - 60) * t
        const gy = 34 + ((H - 68) * row) / (ROWS - 1)
        const disorder = Math.pow(smooth((t - 0.34) / 0.52), 1.35)
        const free = rnd(i, 1) < 0.3
        const k = Math.floor(rnd(i, 2) * CLUSTERS.length)
        const [cx, cy] = CLUSTERS[k]
        const tx = free
          ? gx + (rnd(i, 3) - 0.3) * 230
          : cx + (rnd(i, 4) - 0.5) * 170 * (0.4 + rnd(i, 5))
        const ty = free
          ? gy + (rnd(i, 6) - 0.5) * 300
          : cy + (rnd(i, 7) - 0.5) * 170 * (0.4 + rnd(i, 8))
        const amt = disorder * (0.72 + rnd(i, 9) * 0.28)
        dots.push({
          x: gx + (tx - gx) * amt,
          y: gy + (ty - gy) * amt,
          r: 1.6,
          fo: 0.6,
          fd: t * 1.1 + rnd(i, 13) * 0.25,
          disorder,
          cluster: free ? -1 : k,
          tw: disorder > 0.45 && rnd(i, 14) > 0.72,
        })
      }
    }
    /* the story beat: every few seconds one dot leaves the hand-made
       grid, travels right, and is absorbed into a living cluster —
       designed by hand, shipped by agents */
    const travelers: Traveler[] = []
    const sources = dots.filter((d) => d.disorder < 0.12 && d.x > 240)
    const dests = dots.filter((d) => d.disorder > 0.6 && d.fo > 0.75)
    for (let j = 0; j < 3 && j < sources.length && j < dests.length; j++) {
      const a = sources[Math.floor(rnd(j, 21) * sources.length)]
      const b = dests[Math.floor(rnd(j, 22) * dests.length)]
      travelers.push({
        path: `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} C ${(a.x + 240).toFixed(1)} ${(a.y - 20 - rnd(j, 23) * 40).toFixed(1)}, ${(b.x - 280).toFixed(1)} ${(b.y + 10 + rnd(j, 24) * 30).toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`,
        begin: j * 9 + rnd(j, 25) * 3,
      })
    }
    return { dots, travelers }
  }, [])

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className="block h-full w-full"
      role="presentation"
      focusable="false"
    >
      {/* one dot at a time leaves the grid and joins a cluster */}
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
          <g>
            <circle
              cx={d.x}
              cy={d.y}
              r={Math.max(0.7, d.r)}
              fill="#eef1f6"
              className="work-dot"
              style={{ '--fo': d.fo, '--fd': `${d.fd.toFixed(2)}s` } as React.CSSProperties}
            />
          </g>
        )
        if (d.disorder > 0.15) {
          /* gravity grows left to right: each freed dot breathes toward
             the mass it belongs to, harder the deeper into emergence */
          const [cx, cy] = CLUSTERS[d.cluster === -1 ? 0 : d.cluster]
          const ddx = cx - d.x
          const ddy = cy - d.y
          const len = Math.hypot(ddx, ddy) || 1
          const amp = Math.pow(d.disorder, 1.5) * (2.5 + rnd(i, 17) * 3)
          const drift = (
            <g
              className="work-grav"
              style={
                {
                  '--gvx': `${((ddx / len) * amp).toFixed(2)}px`,
                  '--gvy': `${((ddy / len) * amp).toFixed(2)}px`,
                  '--gd': `${(7 + rnd(i, 18) * 6).toFixed(2)}s`,
                  '--gl': `${((d.x / W) * 5 + rnd(i, 19) * 2).toFixed(2)}s`,
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
              style={{ '--twd': `${(5 + rnd(i, 19) * 6).toFixed(2)}s`, '--tw': `${rnd(i, 20) * 7}s` } as React.CSSProperties}
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
