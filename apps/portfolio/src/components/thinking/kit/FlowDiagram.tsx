import { useMemo } from 'react'
import { buildEdgePath } from './edgePath'

/**
 * Labeled nodes connected by gently curved, flowing lines — for any real
 * pipeline or process, not decoration. Use it only when the content is
 * actually sequential/relational; a plain list is better for anything
 * else. Edges are cubic-bezier arcs (the same idiom as MarginNote's
 * stem-and-leaf connector — a single perpendicular-offset curve rather
 * than a straight line) so even a dead-horizontal chain of nodes reads
 * as organic instead of a wiring diagram. Lines draw in on reveal
 * (.kit-line-draw), nodes fade up staggered left to right (.kit-node-in),
 * and a small pulse travels each edge continuously once it's drawn in
 * (the same <animateMotion> traveler technique as AssembleField) so the
 * diagram reads as flowing rather than static. Reduced motion drops the
 * travelers entirely and leaves lines/nodes in their settled end-state.
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

interface EdgePath {
  key: string
  d: string
  drawDelay: number
}

export function FlowDiagram({ nodes, edges, width = 1000, height = 220, className }: FlowDiagramProps) {
  const reduced = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  )

  const paths = useMemo<EdgePath[]>(() => {
    const byId = new Map(nodes.map((n) => [n.id, n]))
    const out: EdgePath[] = []
    edges.forEach((e, i) => {
      const a = byId.get(e.from)
      const b = byId.get(e.to)
      if (!a || !b) return
      out.push({
        key: `${e.from}-${e.to}-${i}`,
        d: buildEdgePath(a.x, a.y, b.x, b.y, i),
        drawDelay: 0.15 + i * 0.12,
      })
    })
    return out
  }, [nodes, edges])

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      className={className ?? 'block h-full w-full'}
      role="presentation"
      focusable="false"
    >
      {paths.map((p) => (
        <path
          key={p.key}
          d={p.d}
          pathLength={1}
          fill="none"
          stroke="var(--ink-dim)"
          strokeWidth={1.5}
          className="kit-line-draw"
          style={{ animationDelay: `${p.drawDelay}s` }}
        />
      ))}
      {!reduced &&
        paths.map((p, i) => {
          const begin = (p.drawDelay + 1.1 + i * 0.35).toFixed(2)
          return (
            <circle key={`pulse-${p.key}`} r={3} fill="var(--ink)" opacity={0}>
              <animateMotion dur="3.6s" begin={`${begin}s`} repeatCount="indefinite" path={p.d} />
              <animate
                attributeName="opacity"
                values="0;0.9;0.9;0"
                keyTimes="0;0.08;0.86;1"
                dur="3.6s"
                begin={`${begin}s`}
                repeatCount="indefinite"
              />
            </circle>
          )
        })}
      {nodes.map((n, i) => (
        <g key={n.id} className="kit-node-in" style={{ '--kn-delay': `${0.3 + i * 0.12}s` } as React.CSSProperties}>
          <circle
            cx={n.x}
            cy={n.y}
            r={7}
            fill={n.active ? 'var(--ink)' : 'var(--bg)'}
            stroke="var(--ink)"
            strokeWidth={1.5}
          />
          <text
            x={n.x}
            y={n.y - 16}
            textAnchor="middle"
            fontSize={15}
            fontWeight={500}
            fill="var(--ink)"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  )
}
