import { useEffect, useMemo, useRef } from 'react'

/**
 * The page's subject as a drawing instead of a photograph: one path of
 * light that forks. The two branches are sampled from the same wavering
 * base line and peel apart on a smooth divergence envelope — no fork
 * kink, and the shared stretch wobbles identically the way one exposure
 * would. The waver phase drifts continuously so the ripples travel
 * left to right, the direction the light is going; turbulence filters
 * add fine shimmer on top. Three strokes per path (haze, glow,
 * filament) make it read as light rather than line art.
 *
 * Draw-in is keyed off the reveal system ([data-reveal].is-in); reduced
 * motion gets a still line and still filters.
 */

const N = 72
const X0 = -20
const X1 = 1640
const FLOW = 1.0 // waver phase speed — ripples travel +x

function smooth(t: number) {
  const c = Math.min(1, Math.max(0, t))
  return c * c * (3 - 2 * c)
}

function buildPath(dir: -1 | 1, time: number): string {
  const pts: string[] = []
  for (let i = 0; i <= N; i++) {
    const t = i / N
    const x = X0 + (X1 - X0) * t
    /* the line every exposure shares: two slow, incommensurate wavers,
       phases receding so the pattern flows toward +x */
    const shared =
      Math.sin(t * 5.1 + 1.4 - time * FLOW) * 3.2 +
      Math.sin(t * 11.7 + 4.0 - time * FLOW * 1.7) * 1.3
    /* peel: nothing until ~40% across, then an eased, slightly
       asymmetric divergence */
    const env = Math.pow(smooth((t - 0.4) / 0.6), 1.55)
    const spread = dir === -1 ? 148 : 176
    /* each branch finds its own small waver as it leaves the trunk */
    const own =
      (Math.sin(t * 7.3 + (dir === -1 ? 0.6 : 3.9) - time * FLOW * 1.3) * 2.6 +
        Math.sin(t * 15.9 + (dir === -1 ? 2.1 : 5.2) - time * FLOW * 2.1) * 1.1) *
      env
    const y = 212 + shared + dir * env * spread + own
    pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
  }
  return pts.join(' ')
}

const LAYERS = [{ width: 2, cls: 'fork-l-core' }] as const

export function ForkLight() {
  const upperRefs = useRef<(SVGPathElement | null)[]>([])
  const lowerRefs = useRef<(SVGPathElement | null)[]>([])

  const initial = useMemo(() => ({ up: buildPath(-1, 0), lo: buildPath(1, 0) }), [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const time = (now - t0) / 1000
      const up = buildPath(-1, time)
      const lo = buildPath(1, time)
      for (const el of upperRefs.current) el?.setAttribute('d', up)
      for (const el of lowerRefs.current) el?.setAttribute('d', lo)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <svg
      viewBox="0 0 1600 420"
      preserveAspectRatio="xMidYMid slice"
      className="block h-full w-full"
      role="presentation"
      focusable="false"
    >
      <defs>
        {/* tails fade in from the left edge; tips carry the temperature */}
        <linearGradient id="fork-grad-a" gradientUnits="userSpaceOnUse" x1="-20" y1="0" x2="1640" y2="0">
          <stop offset="0" stopColor="#f2f0ec" stopOpacity="0" />
          <stop offset="0.18" stopColor="#f2f0ec" stopOpacity="0.85" />
          <stop offset="0.55" stopColor="#f0f2f6" stopOpacity="1" />
          <stop offset="1" stopColor="#d8e3f6" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="fork-grad-b" gradientUnits="userSpaceOnUse" x1="-20" y1="0" x2="1640" y2="0">
          <stop offset="0" stopColor="#f2f0ec" stopOpacity="0" />
          <stop offset="0.18" stopColor="#f2f0ec" stopOpacity="0.85" />
          <stop offset="0.55" stopColor="#f4f0ea" stopOpacity="1" />
          <stop offset="1" stopColor="#ffe3c2" stopOpacity="0.95" />
        </linearGradient>
      </defs>
      {LAYERS.map((l, i) => (
        <path
          key={`up-${l.cls}`}
          ref={(el) => {
            upperRefs.current[i] = el
          }}
          d={initial.up}
          pathLength={1}
          fill="none"
          stroke="url(#fork-grad-a)"
          strokeWidth={l.width}
          strokeLinecap="round"
          className={`fork-path ${l.cls} fork-branch`}
        />
      ))}
      {/* decisions in motion: a pulse travels the trunk, hesitates at
          the fork, then commits — alternating branches. The same call,
          made differently at different times. */}
      <path
        ref={(el) => {
          upperRefs.current[LAYERS.length] = el
        }}
        d={initial.up}
        pathLength={1}
        fill="none"
        stroke="#ffffff"
        strokeWidth={2.6}
        strokeLinecap="round"
        className="fork-pulse fork-pulse-a"
      />
      <path
        ref={(el) => {
          lowerRefs.current[LAYERS.length] = el
        }}
        d={initial.lo}
        pathLength={1}
        fill="none"
        stroke="#ffffff"
        strokeWidth={2.6}
        strokeLinecap="round"
        className="fork-pulse fork-pulse-b"
      />
      {LAYERS.map((l, i) => (
        <path
          key={`lo-${l.cls}`}
          ref={(el) => {
            lowerRefs.current[i] = el
          }}
          d={initial.lo}
          pathLength={1}
          fill="none"
          stroke="url(#fork-grad-b)"
          strokeWidth={l.width}
          strokeLinecap="round"
          className={`fork-path ${l.cls} fork-branch fork-branch-b`}
        />
      ))}
    </svg>
  )
}
