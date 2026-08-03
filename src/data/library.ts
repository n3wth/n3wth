/**
 * The typed registry behind /library and the ⌘K palette: what exists across
 * n3wth.com, garden, @n3wth/ui, and skills, what each thing is for, and how
 * to start using it. Data only, no JSX. See CONTRACT.md (consolidation
 * planning doc) for the verified facts this file is built from; don't add
 * numbers here that don't trace back to it.
 */

export interface KitPrimitive {
  id: string // 'beat'
  name: string // 'Beat'
  /** One line. What it does, in the voice of someone who wrote it. */
  blurb: string
  /** The props signature, verbatim TypeScript, rendered in a <pre>. */
  signature: string
  /** Repo-relative source path. */
  source: string
  /** Slug of a registered Thinking piece that uses it, for a "seen in" link. */
  usedIn?: string
  /** Whether the /library page renders a live demo inline. r3f ones are too heavy. */
  demo?: 'beat' | 'flow' | 'toggle' | 'field'
}

/**
 * The essay kit that powers every Thinking piece: eight primitives, all
 * living in src/components/thinking/kit/. It never had a page of its own
 * until this one; the pieces just imported it. Order matches how a piece
 * is actually built: layout unit first, then the specimens that go inside it.
 */
export const kitPrimitives: KitPrimitive[] = [
  {
    id: 'beat',
    name: 'Beat',
    blurb:
      'The grid unit every piece runs on: prose in the main column, an optional note in the margin, and space underneath for a specimen that wants the full width. Stage numbers are optional; use them only when the beats form a real sequence, not just a list.',
    signature: `{
  stage?: { n: string; label: string }
  prose: ReactNode
  margin?: ReactNode
  children?: ReactNode
}`,
    source: 'src/components/thinking/kit/Beat.tsx',
    usedIn: 'compound-engineering',
    demo: 'beat',
  },
  {
    id: 'margin-note',
    name: 'MarginNote',
    blurb:
      "A sidenote that points at a real note on garden.n3wth.com. The connector is a small stem-and-leaf line, not a card or a border. Skip it when there's no note worth linking; a MarginNote invented to fill space reads exactly like that.",
    signature: `interface MarginNoteProps {
  href: string
  title: string
  description?: string
}`,
    source: 'src/components/thinking/kit/MarginNote.tsx',
    usedIn: 'home-automation',
  },
  {
    id: 'toggle-compare',
    name: 'ToggleCompare',
    blurb:
      'Two states, one button group, no crossfade. The point is the visible difference between before and after, not a transition, so the swap is instant and keyboard-reachable, aria-pressed and all.',
    signature: `interface ToggleCompareProps {
  beforeLabel: string
  afterLabel: string
  before: ReactNode
  after: ReactNode
  caption?: ReactNode
}`,
    source: 'src/components/thinking/kit/ToggleCompare.tsx',
    usedIn: 'ambient-ai',
    demo: 'toggle',
  },
  {
    id: 'flow-diagram',
    name: 'FlowDiagram',
    blurb:
      "Labelled nodes and curved edges for something that's genuinely a pipeline: a build order, a request path, an org chart. Lines draw in, a pulse travels each edge once it's settled, and reduced motion drops the pulse and leaves the diagram in its end state.",
    signature: `interface FlowNode {
  id: string
  label: string
  x: number
  y: number
  active?: boolean
}

interface FlowEdge {
  from: string
  to: string
}

interface FlowDiagramProps {
  nodes: FlowNode[]
  edges: FlowEdge[]
  width?: number
  height?: number
  className?: string
}`,
    source: 'src/components/thinking/kit/FlowDiagram.tsx',
    usedIn: 'agents-org-design',
    demo: 'flow',
  },
  {
    id: 'assemble-field',
    name: 'AssembleField',
    blurb:
      'A grid of dots that gives up its order past a threshold and drifts into the shapes you hand it. Same seeded randomness and drift CSS as the homepage field, so every piece that uses this looks related without importing one fixed layout twice.',
    signature: `interface AssembleFieldProps {
  seed?: number
  cols?: number
  rows?: number
  width?: number
  height?: number
  clusters: [number, number][]
  envelopeStart?: number
  envelopeEnd?: number
  travelerCount?: number
  className?: string
}`,
    source: 'src/components/thinking/kit/AssembleField.tsx',
    usedIn: '2026-goals',
    demo: 'field',
  },
  {
    id: 'live-constellation-demo',
    name: 'LiveConstellationDemo',
    blurb:
      "The actual radio telescope model from the homepage, dropped into its own canvas with cursor tilt. No props needed; it's the one demo that's just 'here's the real asset, go touch it.'",
    signature: '// no props (reads /models/telescope.glb and the cursor directly)',
    source: 'src/components/thinking/kit/LiveConstellationDemo.tsx',
    usedIn: 'night-field',
  },
  {
    id: 'live-material-demo',
    name: 'LiveMaterialDemo',
    blurb:
      'The bug and the fix on the same rock mesh from the homepage. Toggle between metalness 1, which renders black, and the corrected material, and watch the model change under identical light.',
    signature: '// no props (reads /models/rocks.glb and toggles its own state)',
    source: 'src/components/thinking/kit/LiveMaterialDemo.tsx',
    usedIn: 'night-field',
  },
  {
    id: 'thinking-index',
    name: 'ThinkingIndex',
    blurb:
      "The map above all the pieces: date, title, one line of dek, grouped by whether it's a position or a build log. It takes the registered pieces array directly, so it can't drift out of sync with what's actually published.",
    signature: '{ pieces: RegisteredPiece[] }',
    source: 'src/components/thinking/kit/ThinkingIndex.tsx',
  },
]

export interface UiTier {
  name: string
  count: number
  components: string[]
}

/**
 * @n3wth/ui's three tiers, atoms up to organisms. Component names and
 * counts are from the package's own exports, not from ui.n3wth.com's docs
 * table; that table currently shows a subset (7/6/4). This is the fuller,
 * accurate list.
 */
export const uiTiers: UiTier[] = [
  {
    name: 'Atoms',
    count: 20,
    components: [
      'AnimatedText',
      'Avatar',
      'Badge',
      'Button',
      'Character',
      'CodeBlock',
      'HamburgerIcon',
      'Icon',
      'Input',
      'Label',
      'NoiseOverlay',
      'Progress',
      'ScrollIndicator',
      'Separator',
      'Shape',
      'Skeleton',
      'SpeechBubble',
      'Switch',
      'Textarea',
      'Tooltip',
    ],
  },
  {
    name: 'Molecules',
    count: 12,
    components: [
      'Accordion',
      'Card',
      'CommandBox',
      'CompositeShape',
      'Dropdown',
      'ErrorBoundary',
      'MobileDrawer',
      'Modal',
      'NavLink',
      'Tabs',
      'ThemeToggle',
      'Toast',
    ],
  },
  {
    name: 'Organisms',
    count: 4,
    components: ['Footer', 'Hero', 'Nav', 'Section'],
  },
]

/** @n3wth/ui's 11 hooks, in package export order. */
export const uiHooks: string[] = [
  'useButtonPulse',
  'useCountUp',
  'useKeyboardShortcuts',
  'useMediaQuery',
  'usePageTransition',
  'useReducedMotion',
  'useScrollReveal',
  'useStaggerList',
  'useTextReveal',
  'useTheme',
  'useToast',
]

/** Verbatim from the @n3wth/ui package README. */
export const uiQuickStart = `import { Button, Card, Hero, Section } from '@n3wth/ui'
import '@n3wth/ui/styles'`

export interface EcosystemProperty {
  id: string
  name: string // 'n3wth/garden'
  href: string
  /** What it is FOR, one line. Not a description of its contents. */
  purpose: string
  /** Real, verified counts only. Omit when unverified. */
  stat?: string
}

/**
 * The four properties. n3wth.com's own `stat` is left off on purpose: the
 * honest number is `${registeredPieces.length} pieces`, and hardcoding it
 * here would just be a second place for it to go stale. Derive it at render
 * time from src/components/thinking/registry.tsx's registeredPieces.length.
 */
export const ecosystem: EcosystemProperty[] = [
  {
    id: 'n3wth-com',
    name: 'n3wth.com',
    href: '/',
    purpose:
      'The front door: the writing and the tools behind it, gathered here instead of scattered across three separate sites.',
  },
  {
    id: 'garden',
    name: 'n3wth/garden',
    href: 'https://garden.n3wth.com',
    purpose:
      "For working out an idea before it's finished enough to defend, then finding it again later through links instead of folders.",
    stat: '248 notes · 1,056 links',
  },
  {
    id: 'ui',
    name: '@n3wth/ui',
    href: 'https://ui.n3wth.com',
    purpose: 'For dropping a themed Button, Card, or Nav into a new project without rebuilding it from scratch.',
    stat: '36 components · 11 hooks',
  },
  {
    id: 'skills',
    name: 'n3wth/skills',
    href: 'https://skills.n3wth.com',
    purpose: "For giving a coding agent a skill it didn't ship with, installed locally and usable offline.",
  },
]

export interface GardenTopic {
  name: string
  href: string
  count: number
}

/**
 * No populated array here on purpose: real topic counts live in
 * src/data/garden-index.json (Agent DATA's file, fetched from the live
 * site). This type exists so that JSON, and whatever in src/pages/Library.tsx
 * or src/components/library/* reads it, has one shared shape to agree on.
 */
