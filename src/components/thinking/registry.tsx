import { lazy } from 'react'
import type { ComponentType } from 'react'

/**
 * Registry of rich Thinking pieces. Each owns its own interaction
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
  /** Which spine this piece's index stop sits on: a belief vs. a build
      story, assigned by what the piece actually is, not registration order. */
  group: 'position' | 'system'
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
const AiDesignSlop = lazy(() => import('./pieces/AiDesignSlop'))
const LiveArtifacts = lazy(() => import('./pieces/LiveArtifacts'))
const PersonalKnowledgeGraph = lazy(() => import('./pieces/PersonalKnowledgeGraph'))
const HomeAutomation = lazy(() => import('./pieces/HomeAutomation'))
const CompoundEngineering = lazy(() => import('./pieces/CompoundEngineering'))
const AutonomousAgents = lazy(() => import('./pieces/AutonomousAgents'))
const LlmInference = lazy(() => import('./pieces/LlmInference'))
const EdgeTypescript = lazy(() => import('./pieces/EdgeTypescript'))
const HopFlights = lazy(() => import('./pieces/HopFlights'))

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
      dek: 'A standing team of coding agents, each with a named desk and a real schedule — and one boundary that has never moved, no matter how good the model got.',
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
  {
    meta: {
      id: 'ai-design-slop',
      title: 'Why every AI-generated UI looks the same',
      dek: 'Purple-to-blue gradient cards, a centered icon grid, low-contrast dark mode. The tell is hardcoded hex drifting away from a token file nobody is checking against.',
      date: '2026-07-22',
      group: 'position',
    },
    Body: AiDesignSlop,
  },
  {
    meta: {
      id: 'live-artifacts',
      title: 'Live artifacts are three different architectures',
      dek: 'A sandboxed page with a versioned link, a full dev environment in a browser tab, and real production component code all get called the same thing, and each trades control against containment differently.',
      date: '2026-07-22',
      group: 'position',
    },
    Body: LiveArtifacts,
  },
  {
    meta: {
      id: 'personal-knowledge-graph',
      title: 'A knowledge base becomes a graph once something else can query it',
      dek: 'PARA and Zettelkasten pushed back on hierarchy for a human reader. The graph shape only starts to matter once an agent can traverse it multiple hops and audit what it finds.',
      date: '2026-07-22',
      group: 'position',
    },
    Body: PersonalKnowledgeGraph,
  },
  {
    meta: {
      id: 'home-automation',
      title: 'Automation is arbitration plumbing',
      dek: 'A sensor reports, a hub decides, an actuator acts. From inside the house, each of those three roles fails silently in its own way.',
      date: '2026-07-22',
      group: 'position',
    },
    Body: HomeAutomation,
  },
  {
    meta: {
      id: 'compound-engineering',
      title: 'Compound engineering, applied to a personal site',
      dek: "Five real pull requests from this site's own git history (a build, a review, a three-line fix, an extraction, and a compliance rule) show what compounding actually looks like when a fix from one PR gets applied automatically three PRs later without anyone repeating the instruction.",
      date: '2026-07-22',
      group: 'system',
    },
    Body: CompoundEngineering,
  },
  {
    meta: {
      id: 'autonomous-agents',
      title: 'What "autonomous" actually means in production',
      dek: 'Click through what an agent can take back and what it can’t — the two lists have almost nothing in common, and that gap is the entire job of designing one.',
      date: '2026-07-22',
      group: 'position',
    },
    Body: AutonomousAgents,
  },
  {
    meta: {
      id: 'llm-inference',
      title: 'The toll booth is memory, not math',
      dek: "Prefill runs once, in parallel. Every token after that is its own round trip to memory to reload the model's weights and KV cache — which is why decode speed lives or dies on memory bandwidth.",
      date: '2026-07-22',
      group: 'position',
    },
    Body: LlmInference,
  },
  {
    meta: {
      id: 'edge-typescript',
      title: 'TypeScript at the edge',
      dek: 'Cloudflare Workers run TypeScript inside V8 isolates instead of VMs or containers: sub-millisecond starts, no cold-start boot cost, and a stack built around that same disposable unit of compute.',
      date: '2026-07-22',
      group: 'system',
    },
    Body: EdgeTypescript,
  },
  {
    meta: {
      id: 'hop-flights',
      title: 'A computed verdict can still be wrong',
      dek: "hop.flights' whole pitch is a verdict that's computed, not guessed. For any search with more than one passenger, it was computing that verdict from two numbers that didn't describe the same trip.",
      date: '2026-07-22',
      group: 'system',
    },
    Body: HopFlights,
  },
]
