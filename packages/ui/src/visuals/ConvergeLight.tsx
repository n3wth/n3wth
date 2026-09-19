'use client'

import { useId } from 'react'
import { useLightPaths } from './useLightPaths'
import { buildLightPath, smoothEnvelope } from './lightPath'

/**
 * The bookend to /thinking's fork: two paths of light converge and
 * continue as one. A cool line and a warm one — the day work and the
 * after-dark work — meet and carry on together as white. The waver
 * phase drifts left to right, and the shared stretch past the merge
 * wobbles identically, one exposure again. Bare filaments, no glow:
 * one clean line each, visible immediately.
 */

const buildPath = buildLightPath({
  baseline: 210,
  sharedPhase: [2.2, 0.8],
  /* separation is largest at the left edge and closes by ~58% across */
  envelope: (t) => Math.pow(smoothEnvelope((0.58 - t) / 0.58), 1.45),
  spread: (dir) => (dir === -1 ? 132 : 158),
  ownPhase: (dir) => (dir === -1 ? [1.1, 3.0] : [4.4, 0.4]),
})

const LAYERS = [{ width: 2, cls: 'n3wth-visual-light-core' }] as const

export function ConvergeLight() {
  const { upperRefs, lowerRefs, initial } = useLightPaths(buildPath)
  const id = useId().replace(/:/g, '')
  const gradientA = `n3wth-converge-${id}-a`
  const gradientB = `n3wth-converge-${id}-b`

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
        {/* each line keeps its temperature until the meeting, then both
            carry on white */}
        <linearGradient id={gradientA} gradientUnits="userSpaceOnUse" x1="-20" y1="0" x2="1640" y2="0">
          <stop offset="0" stopColor="color-mix(in srgb, var(--color-text-primary, #d8e3f6) 50%, #d8e3f6)" stopOpacity="0" />
          <stop offset="0.12" stopColor="color-mix(in srgb, var(--color-text-primary, #d8e3f6) 50%, #d8e3f6)" stopOpacity="0.9" />
          <stop offset="0.58" stopColor="var(--color-text-primary, #f0f2f6)" stopOpacity="1" />
          <stop offset="1" stopColor="var(--color-text-primary, #f4f2ee)" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id={gradientB} gradientUnits="userSpaceOnUse" x1="-20" y1="0" x2="1640" y2="0">
          <stop offset="0" stopColor="color-mix(in srgb, var(--color-text-primary, #ffe3c2) 50%, #ffe3c2)" stopOpacity="0" />
          <stop offset="0.12" stopColor="color-mix(in srgb, var(--color-text-primary, #ffe3c2) 50%, #ffe3c2)" stopOpacity="0.9" />
          <stop offset="0.58" stopColor="var(--color-text-primary, #f4f0ea)" stopOpacity="1" />
          <stop offset="1" stopColor="var(--color-text-primary, #f4f2ee)" stopOpacity="0.95" />
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
