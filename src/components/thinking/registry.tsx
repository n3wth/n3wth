import { lazy } from 'react'
import type { ComponentType } from 'react'

/**
 * Registry of rich Thinking pieces — each owns its own interaction
 * pattern (registered in docs/thinking-pieces-tracker.md), lazy-loaded
 * so a piece using e.g. react-three-fiber doesn't add weight to pieces
 * that don't need it. Rendered before the plain thoughtPieces list in
 * src/components/sections/Thinking.tsx.
 */

export interface ThinkingPieceMeta {
  id: string
  title: string
  dek: string
  date: string
}

export interface RegisteredPiece {
  meta: ThinkingPieceMeta
  Body: ComponentType
}

const NightField = lazy(() => import('./pieces/NightField'))

export const registeredPieces: RegisteredPiece[] = [
  {
    meta: {
      id: 'night-field',
      title: 'What the night field broke',
      dek: 'The homepage is a real 3D scene built by an agent team. Here is everything that went black, span around the wrong point, or skated across the ground before it worked.',
      date: '2026-07-22',
    },
    Body: NightField,
  },
]
