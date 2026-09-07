import { FlowDiagram } from '../thinking/kit/FlowDiagram'
import type { FlowEdge, FlowNode } from '../thinking/kit/FlowDiagram'

/**
 * FlowDiagram, running, on a pipeline that actually exists: the build-time
 * fetch that puts the grove counts further down this page. The component's
 * own docs say to use it only when the content is genuinely sequential, so
 * the demo had to be a real four-step chain rather than four nouns in a
 * row. Node x positions are hand-set to keep the labels from colliding at
 * the widths this container reaches.
 */

const NODES: FlowNode[] = [
  { id: 'garden', label: 'garden.n3wth.com', x: 100, y: 76 },
  { id: 'script', label: 'fetch script', x: 300, y: 76 },
  { id: 'json', label: 'garden-index.json', x: 500, y: 76 },
  { id: 'page', label: '/library', x: 660, y: 76, active: true },
]

const EDGES: FlowEdge[] = [
  { from: 'garden', to: 'script' },
  { from: 'script', to: 'json' },
  { from: 'json', to: 'page' },
]

export default function DemoFlow() {
  return (
    <figure className="m-0">
      <div className="h-24 w-full max-w-2xl sm:h-28">
        <FlowDiagram nodes={NODES} edges={EDGES} width={720} height={120} />
      </div>
      <figcaption className="mt-2 max-w-[62ch] text-sm leading-relaxed" style={{ color: 'var(--ink-dim)' }}>
        The build script fetches garden data, saves it as JSON, and supplies the{' '}
        <a href="#garden" className="link-underline">topic counts below</a>.
      </figcaption>
    </figure>
  )
}
