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
      test: 'Open the homepage with reduced motion off and cursor movement fast. If anything spins around the wrong point or skates across the ground, the process that was supposed to catch it didn’t.',
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
      test: 'Ask who on the team is accountable for one specific failure mode by name. If the honest answer is "the model," the org chart hasn’t been decided yet.',
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
      test: 'Find the number that enforces your trust policy at 2am with no human in the loop. If you can’t name it, the policy is a document, not a runtime property.',
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
      test: 'Count how many times a day you have to open something and ask it a question versus how many times it tells you something worth knowing unprompted. The ratio is the product.',
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
      test: 'Go five days without opening your own task list. If nothing important slipped, the system is doing the job you used to do by hand.',
    },
    Body: GtdMini,
  },
  {
    meta: {
      id: 'ai-design-slop',
      title: 'Why every AI-generated UI looks the same',
      dek: 'Purple-to-blue gradient cards, a centered icon grid, low-contrast dark mode — the tell is hardcoded hex drifting away from a token file nobody is checking against.',
      date: '2026-07-22',
      group: 'position',
      test: 'Grep the codebase for hex codes outside the token file. If you find more than a handful, the drift has already started.',
    },
    Body: AiDesignSlop,
  },
  {
    meta: {
      id: 'live-artifacts',
      title: 'Live artifacts are three different architectures',
      dek: 'A sandboxed page with a versioned link, a full dev environment in a browser tab, and real production component code all get called the same thing — and each trades control against containment differently.',
      date: '2026-07-22',
      group: 'position',
      test: "When someone sends you a link to what they built, do you actually know which of the three you're about to open?",
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
      test: "Ask your own notes a question that needs two hops to answer. If nothing answers, it's an archive, not a graph.",
    },
    Body: PersonalKnowledgeGraph,
  },
  {
    meta: {
      id: 'home-automation',
      title: 'Automation is arbitration plumbing',
      dek: 'A sensor reports, a hub decides, an actuator acts — and from inside the house, each of those three roles fails silently in its own way.',
      date: '2026-07-22',
      group: 'position',
      test: 'Pull the battery out of one sensor. Does anything tell you within the hour?',
    },
    Body: HomeAutomation,
  },
  {
    meta: {
      id: 'compound-engineering',
      title: 'Compound engineering, applied to a personal site',
      dek: "Five real pull requests from this site's own git history — a build, a review, a three-line fix, an extraction, and a compliance rule — show what compounding actually looks like when a fix from one PR gets applied automatically three PRs later without anyone repeating the instruction.",
      date: '2026-07-22',
      group: 'system',
      test: 'Run git log --oneline in this repo and read PR #72, #73, #75, and #76 in order: #72 is a three-line style fix, #73 is the reason no later piece had to rewrite that layout logic, and #76 is the same compliance rule from #75 catching a new violation in unrelated files with zero new instructions given.',
    },
    Body: CompoundEngineering,
  },
  {
    meta: {
      id: 'autonomous-agents',
      title: 'What "autonomous" actually means in production',
      dek: 'Click through what an agent can take back and what it can’t — "autonomous" describes the self-correcting loop, not the boundary on what that loop is allowed to touch.',
      date: '2026-07-22',
      group: 'position',
      test: "Before calling any agent setup \"autonomous\" in a design doc, write down the specific next action it would take that you would not let it undo alone. If you can't name one, the word is doing marketing work, not engineering work.",
    },
    Body: AutonomousAgents,
  },
  {
    meta: {
      id: 'llm-inference',
      title: 'The toll booth is memory, not math',
      dek: "Prefill runs once, in parallel, but every token after it is a separate round trip to memory to reload the model's weights and KV cache — which is why decode speed is a memory-bandwidth problem, not a compute one.",
      date: '2026-07-22',
      group: 'position',
      test: 'Next time a service claims "fast inference," ask whether they mean time-to-first-token or tokens-per-second after that — they measure different phases of the request, and only one of them tells you how the reply will feel once it starts streaming.',
    },
    Body: LlmInference,
  },
  {
    meta: {
      id: 'edge-typescript',
      title: 'TypeScript at the edge',
      dek: 'Cloudflare Workers run TypeScript inside V8 isolates instead of VMs or containers — sub-millisecond starts, no cold-start boot cost, and a stack built around that same disposable unit of compute.',
      date: '2026-07-22',
      group: 'system',
      test: "Pick any two Cloudflare edge locations far apart, fire the same request at both simultaneously, and compare first-byte time — if the isolate model holds, neither shows a cold-start tail, even the one that's never seen this Worker's traffic before.",
    },
    Body: EdgeTypescript,
  },
  {
    meta: {
      id: 'hop-flights',
      title: 'A computed verdict can still be wrong',
      dek: "hop.flights' whole pitch is a verdict that's computed, not guessed — for any search with more than one passenger, it was computing that verdict from two numbers that didn't describe the same trip.",
      date: '2026-07-22',
      group: 'system',
      test: 'Search hop.flights for one passenger, note the verdict, then rerun the identical flight for a family of four — if the recommendation flips instead of holding steady, the arithmetic is still wrong.',
    },
    Body: HopFlights,
  },
]
