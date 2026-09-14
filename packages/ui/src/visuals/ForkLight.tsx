'use client'

import { useId } from 'react'
import { useLightPaths } from './useLightPaths'

/**
 * The page's subject as a drawing instead of a photograph: one path of
 * light that forks. The two branches are sampled from the same wavering
 * base line and peel apart on a smooth divergence envelope — no fork
 * kink, and the shared stretch wobbles identically the way one exposure
 * would. The waver phase drifts continuously so the ripples travel
 * left to right, the direction the light is going. Each branch is a
 * clean filament, with an alternating pulse travelling along it.
 *
 * Filaments are visible immediately; reduced motion freezes the waveform.
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

const LAYERS = [{ width: 2, cls: 'n3wth-visual-light-core' }] as const

export function ForkLight() {
  const { upperRefs, lowerRefs, initial } = useLightPaths(buildPath)
  const id = useId().replace(/:/g, '')
  const gradientA = `n3wth-fork-${id}-a`
  const gradientB = `n3wth-fork-${id}-b`

  return (
    <svg
      viewBox="0 0 1600 420"
      preserveAspectRatio="xMidYMid slice"
      className="n3wth-visual-light"
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* tails fade in from the left edge; tips carry the temperature */}
        <linearGradient id={gradientA} gradientUnits="userSpaceOnUse" x1="-20" y1="0" x2="1640" y2="0">
          <stop offset="0" stopColor="var(--color-text-primary, #f2f0ec)" stopOpacity="0" />
          <stop offset="0.18" stopColor="var(--color-text-primary, #f2f0ec)" stopOpacity="0.85" />
          <stop offset="0.55" stopColor="var(--color-text-primary, #f0f2f6)" stopOpacity="1" />
          <stop offset="1" stopColor="color-mix(in srgb, var(--color-text-primary, #d8e3f6) 50%, #d8e3f6)" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id={gradientB} gradientUnits="userSpaceOnUse" x1="-20" y1="0" x2="1640" y2="0">
          <stop offset="0" stopColor="var(--color-text-primary, #f2f0ec)" stopOpacity="0" />
          <stop offset="0.18" stopColor="var(--color-text-primary, #f2f0ec)" stopOpacity="0.85" />
          <stop offset="0.55" stopColor="var(--color-text-primary, #f4f0ea)" stopOpacity="1" />
          <stop offset="1" stopColor="color-mix(in srgb, var(--color-text-primary, #ffe3c2) 50%, #ffe3c2)" stopOpacity="0.95" />
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
          stroke={`url(#${gradientA})`}
          strokeWidth={l.width}
          strokeLinecap="round"
          className={`n3wth-visual-light-path ${l.cls} n3wth-visual-light-branch`}
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
        stroke="var(--color-text-primary, #ffffff)"
        strokeWidth={2.6}
        strokeLinecap="round"
        className="n3wth-visual-light-pulse n3wth-visual-light-pulse-a"
      />
      <path
        ref={(el) => {
          lowerRefs.current[LAYERS.length] = el
        }}
        d={initial.lo}
        pathLength={1}
        fill="none"
        stroke="var(--color-text-primary, #ffffff)"
        strokeWidth={2.6}
        strokeLinecap="round"
        className="n3wth-visual-light-pulse n3wth-visual-light-pulse-b"
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
          stroke={`url(#${gradientB})`}
          strokeWidth={l.width}
          strokeLinecap="round"
          className={`n3wth-visual-light-path ${l.cls} n3wth-visual-light-branch n3wth-visual-light-branch-b`}
        />
      ))}
    </svg>
  )
}
