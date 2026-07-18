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
  [1130, 104],
  [1286, 238],
  [1424, 88],
  [1352, 326],
  [1524, 204],
]

function rnd(i: number, salt: number) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453
  return x - Math.floor(x)
}

function smooth(t: number) {
  const c = Math.min(1, Math.max(0, t))
  return c * c * (3 - 2 * c)
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
  const { dots, wisps } = useMemo(() => {
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
          ? gx + (rnd(i, 3) - 0.5) * 190
          : cx + (rnd(i, 4) - 0.5) * 150 * (0.4 + rnd(i, 5))
        const ty = free
          ? gy + (rnd(i, 6) - 0.5) * 160
          : cy + (rnd(i, 7) - 0.5) * 120 * (0.4 + rnd(i, 8))
        const amt = disorder * (0.5 + rnd(i, 9) * 0.5)
        dots.push({
          x: gx + (tx - gx) * amt,
          y: gy + (ty - gy) * amt,
          r: 1.5 + disorder * (rnd(i, 10) * 1.7 - 0.3),
          fo: 0.32 + rnd(i, 11) * 0.3 + disorder * rnd(i, 12) * 0.38,
          fd: t * 1.1 + rnd(i, 13) * 0.25,
          disorder,
          cluster: free ? -1 : k,
          tw: disorder > 0.45 && rnd(i, 14) > 0.72,
        })
      }
    }
    /* wisps: faint threads between near cluster-mates */
    const wisps: string[] = []
    for (let k = 0; k < CLUSTERS.length; k++) {
      const members = dots.filter((d) => d.cluster === k && d.disorder > 0.55)
      for (let j = 0; j + 1 < members.length && j < 8; j += 2) {
        const a = members[j]
        const b = members[j + 1]
        const mx = (a.x + b.x) / 2 + (rnd(k * 31 + j, 15) - 0.5) * 46
        const my = (a.y + b.y) / 2 + (rnd(k * 31 + j, 16) - 0.5) * 46
        wisps.push(`M ${a.x.toFixed(1)} ${a.y.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`)
      }
    }
    return { dots, wisps }
  }, [])

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className="block h-full w-full"
      role="presentation"
      focusable="false"
    >
      <defs>
        <filter id="work-halo-blur" x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      {wisps.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#dfe6f2" strokeWidth={0.7} className="work-wisp" />
      ))}
      {dots.map((d, i) => {
        const halo = d.disorder > 0.55 && d.fo > 0.78
        const circle = (
          <g>
            {halo && (
              <circle
                cx={d.x}
                cy={d.y}
                r={Math.max(0.7, d.r) * 4}
                fill="#dfe7f4"
                filter="url(#work-halo-blur)"
                className="work-halo"
                style={{ '--fd': `${(d.fd + 0.5).toFixed(2)}s` } as React.CSSProperties}
              />
            )}
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
        if (d.disorder > 0.3) {
          /* emergent dots ride a slow drift wave that travels +x */
          const drift = (
            <g
              className="work-drift"
              style={
                {
                  '--dd': `${(8 + rnd(i, 17) * 5).toFixed(2)}s`,
                  '--dl': `${(d.x / W) * 6 + rnd(i, 18)}s`,
                  '--da': `${(2 + d.disorder * 4).toFixed(1)}px`,
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
