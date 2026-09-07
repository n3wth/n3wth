/**
 * The typed registry behind /library and site search: what exists across
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
      'A prose column, an optional margin note, and a full-width area for diagrams or demos. Supports numbered stages.',
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
      'A margin link to a garden note, with a title and optional description.',
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
      'Switches between two views using keyboard-accessible buttons. Supports labels and an optional caption.',
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
      'A diagram of labelled nodes and curved edges. Edges animate in sequence; reduced motion shows the completed diagram.',
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
      'Animates a grid of dots into supplied clusters, with a configurable seed, grid size, and transition range.',
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
      'The homepage telescope model in a standalone canvas with cursor tilt.',
    signature: '// no props (reads /models/telescope.glb and the cursor directly)',
    source: 'src/components/thinking/kit/LiveConstellationDemo.tsx',
    usedIn: 'night-field',
  },
  {
    id: 'live-material-demo',
    name: 'LiveMaterialDemo',
    blurb:
      'Compares two materials on the homepage rock mesh under the same light: metalness 1 and the corrected setting.',
    signature: '// no props (reads /models/rocks.glb and toggles its own state)',
    source: 'src/components/thinking/kit/LiveMaterialDemo.tsx',
    usedIn: 'night-field',
  },
  {
    id: 'thinking-index',
    name: 'ThinkingIndex',
    blurb:
      'Lists registered essays by date, title, and summary, grouped into positions and build logs.',
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
}

/**
 * The four properties: what each is for, no counts.
 */
export const ecosystem: EcosystemProperty[] = [
  {
    id: 'n3wth-com',
    name: 'n3wth.com',
    href: '/',
    purpose:
      'Work, art, essays, and source code.',
  },
  {
    id: 'garden',
    name: 'n3wth/garden',
    href: 'https://garden.n3wth.com',
    purpose:
      'Working notes, connected by topic and links.',
  },
  {
    id: 'ui',
    name: '@n3wth/ui',
    href: 'https://ui.n3wth.com',
    purpose: 'React components and theme tokens.',
  },
  {
    id: 'skills',
    name: 'n3wth/skills',
    href: 'https://skills.n3wth.com',
    purpose: 'Skills to install locally for coding agents.',
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
