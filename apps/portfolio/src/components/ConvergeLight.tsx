import { useEffect, useMemo, useRef } from 'react'

/**
 * The bookend to /thinking's fork: two paths of light converge and
 * continue as one. A cool line and a warm one — the day work and the
 * after-dark work — meet and carry on together as white. The waver
 * phase drifts left to right, and the shared stretch past the merge
 * wobbles identically, one exposure again. Bare filaments, no glow:
 * one clean line each, drawn in on reveal.
 */

const N = 72
const X0 = -20
const X1 = 1640
const FLOW = 1.0

function smooth(t: number) {
  const c = Math.min(1, Math.max(0, t))
  return c * c * (3 - 2 * c)
}

function buildPath(dir: -1 | 1, time: number): string {
  const pts: string[] = []
  for (let i = 0; i <= N; i++) {
    const t = i / N
    const x = X0 + (X1 - X0) * t
    const shared =
      Math.sin(t * 5.1 + 2.2 - time * FLOW) * 3.2 +
      Math.sin(t * 11.7 + 0.8 - time * FLOW * 1.7) * 1.3
    /* separation is largest at the left edge and closes by ~58% across */
    const env = Math.pow(smooth((0.58 - t) / 0.58), 1.45)
    const spread = dir === -1 ? 132 : 158
    const own =
      (Math.sin(t * 7.3 + (dir === -1 ? 1.1 : 4.4) - time * FLOW * 1.3) * 2.6 +
        Math.sin(t * 15.9 + (dir === -1 ? 3.0 : 0.4) - time * FLOW * 2.1) * 1.1) *
      env
    const y = 210 + shared + dir * env * spread + own
    pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
  }
  return pts.join(' ')
}

const LAYERS = [{ width: 2, cls: 'fork-l-core' }] as const

export function ConvergeLight() {
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
        {/* each line keeps its temperature until the meeting, then both
            carry on white */}
        <linearGradient id="conv-grad-a" gradientUnits="userSpaceOnUse" x1="-20" y1="0" x2="1640" y2="0">
          <stop offset="0" stopColor="#d8e3f6" stopOpacity="0" />
          <stop offset="0.12" stopColor="#d8e3f6" stopOpacity="0.9" />
          <stop offset="0.58" stopColor="#f0f2f6" stopOpacity="1" />
          <stop offset="1" stopColor="#f4f2ee" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="conv-grad-b" gradientUnits="userSpaceOnUse" x1="-20" y1="0" x2="1640" y2="0">
          <stop offset="0" stopColor="#ffe3c2" stopOpacity="0" />
          <stop offset="0.12" stopColor="#ffe3c2" stopOpacity="0.9" />
          <stop offset="0.58" stopColor="#f4f0ea" stopOpacity="1" />
          <stop offset="1" stopColor="#f4f2ee" stopOpacity="0.95" />
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
          stroke="url(#conv-grad-a)"
          strokeWidth={l.width}
          strokeLinecap="round"
          className={`fork-path ${l.cls} fork-branch conv-glow-ref`}
        />
      ))}
      {LAYERS.map((l, i) => (
        <path
          key={`lo-${l.cls}`}
          ref={(el) => {
            lowerRefs.current[i] = el
          }}
          d={initial.lo}
          pathLength={1}
          fill="none"
          stroke="url(#conv-grad-b)"
          strokeWidth={l.width}
          strokeLinecap="round"
          className={`fork-path ${l.cls} fork-branch fork-branch-b conv-glow-ref`}
        />
      ))}
    </svg>
  )
}
