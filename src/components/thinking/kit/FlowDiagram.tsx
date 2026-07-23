/**
 * Labeled nodes connected by drawn lines — for any real pipeline or
 * process, not decoration. Use it only when the content is actually
 * sequential/relational; a plain list is better for anything else.
 * Lines draw in on reveal (.kit-line-draw), nodes fade up staggered
 * left to right (.kit-node-in). Both collapse to a static end-state
 * under reduced motion.
 */

export interface FlowNode {
  id: string
  label: string
  x: number
  y: number
  /** Marks the node as the one under discussion right now (e.g. active stage). */
  active?: boolean
}

export interface FlowEdge {
  from: string
  to: string
}

export interface FlowDiagramProps {
  nodes: FlowNode[]
  edges: FlowEdge[]
  width?: number
  height?: number
  className?: string
}

export function FlowDiagram({ nodes, edges, width = 1000, height = 220, className }: FlowDiagramProps) {
  const byId = new Map(nodes.map((n) => [n.id, n]))

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      className={className ?? 'block h-full w-full'}
      role="presentation"
      focusable="false"
    >
      {edges.map((e, i) => {
        const a = byId.get(e.from)
        const b = byId.get(e.to)
        if (!a || !b) return null
        return (
          <line
            key={`${e.from}-${e.to}-${i}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            pathLength={1}
            stroke="var(--rail-strong)"
            strokeWidth={1}
            className="kit-line-draw"
            style={{ animationDelay: `${0.15 + i * 0.12}s` }}
          />
        )
      })}
      {nodes.map((n, i) => (
        <g key={n.id} className="kit-node-in" style={{ '--kn-delay': `${0.3 + i * 0.12}s` } as React.CSSProperties}>
          <circle
            cx={n.x}
            cy={n.y}
            r={5}
            fill={n.active ? 'var(--ink)' : 'var(--bg)'}
            stroke="var(--rail-strong)"
            strokeWidth={1}
          />
          <text
            x={n.x}
            y={n.y - 14}
            textAnchor="middle"
            fontSize={13}
            fill="var(--ink-dim)"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  )
}
