import { lazy } from 'react'
import type { ComponentType } from 'react'

/**
 * Registry of rich Thinking pieces — each owns its own interaction
 * pattern (registered in docs/thinking-pieces-tracker.md), lazy-loaded
 * so a piece using e.g. react-three-fiber doesn't add weight to pieces
 * that don't need it. Each piece renders in full on its own route
 * (/thinking/:slug, src/pages/ThinkingPiece.tsx) and collapses to a
 * stop in the index at the top of src/components/sections/Thinking.tsx
 * (src/components/thinking/kit/ThinkingIndex.tsx).
 */

export interface ThinkingPieceMeta {
  id: string
  title: string
  dek: string
  date: string
  /** Which spine this piece's index stop sits on — a belief vs. a build
      story, assigned by what the piece actually is, not registration order. */
  group: 'position' | 'system'
  /** The Every.to-style closing question, shown inline in the index too
      (not just on the piece's own page) so the index reads as a reference
      document instead of a table of contents. Not yet written for every
      piece — leave undefined rather than invent filler copy. */
  test?: string
}

export interface RegisteredPiece {
  meta: ThinkingPieceMeta
  Body: ComponentType
}

const NightField = lazy(() => import('./pieces/NightField'))
const AgentsOrgDesign = lazy(() => import('./pieces/AgentsOrgDesign'))
const TrustProduction = lazy(() => import('./pieces/TrustProduction'))
const AmbientAi = lazy(() => import('./pieces/AmbientAi'))
const GtdMini = lazy(() => import('./pieces/GtdMini'))

export const registeredPieces: RegisteredPiece[] = [
  {
    meta: {
      id: 'night-field',
      title: 'What the night field broke',
      dek: 'The homepage is a real 3D scene built by an agent team. Here is everything that went black, spun around the wrong point, or skated across the ground before it worked.',
      date: '2026-07-22',
      group: 'system',
    },
    Body: NightField,
  },
  {
    meta: {
      id: 'agents-org-design',
      title: 'Agents are an org design problem',
      dek: 'A standing team of coding agents with named desks and a boundary that does not move — the leverage is in the org chart, not the model card.',
      date: '2026-07-22',
      group: 'position',
    },
    Body: AgentsOrgDesign,
  },
  {
    meta: {
      id: 'trust-production',
      title: 'Trust is a runtime property',
      dek: 'A policy that says harmful content never surfaces without review is enforced by a latency number, not by the document that states it. Drag the slider.',
      date: '2026-07-22',
      group: 'position',
    },
    Body: TrustProduction,
  },
  {
    meta: {
      id: 'ambient-ai',
      title: 'AI should be present, not summoned',
      dek: 'The chat box makes you stop and decide what to ask. An ambient layer reads the room instead.',
      date: '2026-07-22',
      group: 'position',
    },
    Body: AmbientAi,
  },
  {
    meta: {
      id: 'gtd-mini',
      title: 'The machine that runs my todo list while I sleep',
      dek: 'A headless Mac Mini, a cron job every fifteen minutes, and a timeline of what it actually did.',
      date: '2026-07-22',
      group: 'system',
    },
    Body: GtdMini,
  },
]
