'use client'

import { useMemo, type CSSProperties } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { cn } from '../utils/cn'

/** A deterministic particle lattice with subtle optional drift and twinkle. */
function bounded(value: number, fallback: number, min: number, max: number) {
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback
}

function rnd(i: number, salt: number, seed: number) {
  const phase = seed * 74.7
  const safePhase = Number.isFinite(phase) ? phase : (seed % 1_000_000) * 74.7
  const x = Math.sin(i * 127.1 + salt * 311.7 + safePhase) * 43758.5453
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
  /** @deprecated Reserved compatibility option; the original field emitted no travelers. */
  travelerCount?: number
  className?: string
}

export function AssembleField({
  seed: rawSeed = 0,
  cols: rawCols = 46,
  rows: rawRows = 12,
  width: rawWidth = 1600,
  height: rawHeight = 400,
  clusters: rawClusters,
  envelopeStart: rawEnvelopeStart = 0.34,
  envelopeEnd: rawEnvelopeEnd = 0.52,
  className,
}: AssembleFieldProps) {
  const reduced = useReducedMotion()
  const width = bounded(rawWidth, 1600, 1, 1_000_000)
  const height = bounded(rawHeight, 400, 1, 1_000_000)
  const cols = Math.floor(bounded(rawCols, 46, 1, 256))
  const rows = Math.floor(bounded(rawRows, 12, 1, 256))
  const seed = Number.isFinite(rawSeed) ? rawSeed : 0
  const envelopeStart = bounded(rawEnvelopeStart, 0.34, 0, 1)
  const envelopeEnd = rawEnvelopeEnd > 0 ? bounded(rawEnvelopeEnd, 0.52, 0.0001, 1) : 0.52
  const clusters = useMemo(() => {
    const valid = Array.isArray(rawClusters) ? rawClusters.filter((point) =>
      Array.isArray(point) && point.length >= 2 && Number.isFinite(point[0]) && Number.isFinite(point[1])
    ).map(([x, y]): [number, number] => [bounded(x, 0, -1_000_000, 1_000_000), bounded(y, 0, -1_000_000, 1_000_000)]) : []
    return valid.length ? valid : [[width * 0.75, height * 0.5] as [number, number]]
  }, [rawClusters, width, height])

  const dots = useMemo(() => {
    const W = width
    const H = height
    const dots: Dot[] = []
    for (let c = 0; c < cols; c++) {
      for (let row = 0; row < rows; row++) {
        const i = c * rows + row
        const t = cols === 1 ? 0.5 : c / (cols - 1)
        const padX = Math.min(30, W / 2)
        const gx = padX + (W - 2 * padX) * t
        const padY = Math.min(34, H / 2)
        const gy = rows === 1 ? H / 2 : padY + ((H - 2 * padY) * row) / (rows - 1)
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
          disorder,
          cluster: free ? -1 : k,
          tw: disorder > 0.45 && rnd(i, 14, seed) > 0.72,
        })
      }
    }
    return dots
  }, [seed, cols, rows, width, height, clusters, envelopeStart, envelopeEnd])

  return (
    <svg
      data-reduced-motion={reduced}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid slice"
      className={cn('n3wth-visual-field', className)}
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      {dots.map((d, i) => {
        const circle = (
          <circle
            cx={d.x}
            cy={d.y}
            r={Math.max(0.7, d.r)}
            fill="var(--color-text-primary, #eef1f6)"
            className="n3wth-visual-dot"
            opacity={d.fo}
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
              className="n3wth-visual-drift"
              style={
                {
                  '--gvx': `${((ddx / len) * amp).toFixed(2)}px`,
                  '--gvy': `${((ddy / len) * amp).toFixed(2)}px`,
                  '--gd': `${(7 + rnd(i, 18, seed) * 6).toFixed(2)}s`,
                  '--gl': `${((d.x / width) * 5 + rnd(i, 19, seed) * 2).toFixed(2)}s`,
                } as CSSProperties
              }
            >
              {circle}
            </g>
          )
          return d.tw ? (
            <g
              key={i}
              className="n3wth-visual-twinkle"
              style={{ '--twd': `${(5 + rnd(i, 19, seed) * 6).toFixed(2)}s`, '--tw': `${rnd(i, 20, seed) * 7}s` } as CSSProperties}
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
