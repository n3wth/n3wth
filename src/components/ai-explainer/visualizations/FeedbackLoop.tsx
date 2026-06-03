import { memo, useRef, useEffect } from 'react'
import * as d3 from 'd3'

interface FeedbackLoopProps {
  metrics: Record<string, number> | null
}

export const FeedbackLoop = memo(function FeedbackLoop({ metrics }: FeedbackLoopProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const hasChoice = metrics !== null
  const capabilityValue = metrics?.capability || 0
  const transparencyValue = metrics?.transparency || 0
  const trustValue = metrics?.trust || 0

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = 400
    const centerX = width / 2
    const centerY = 135

    // Colors - flat
    const purple = '#a78bfa'
    const green = '#34d399'
    const blue = '#60a5fa'
    const grey = '#6b7280'
    const greyDark = '#374151'
    const white = '#ffffff'

    // Fixed node positions (equilateral triangle)
    const radius = 75
    const nodes = [
      { id: 'capability', label: 'Capability', value: capabilityValue, color: purple, x: centerX, y: centerY - radius },
      { id: 'trust', label: 'Trust', value: trustValue, color: blue, x: centerX + radius * 0.87, y: centerY + radius * 0.5 },
      { id: 'transparency', label: 'Transparency', value: transparencyValue, color: green, x: centerX - radius * 0.87, y: centerY + radius * 0.5 }
    ]

    const edges = [
      { from: 0, to: 1, label: 'enables' },
      { from: 1, to: 2, label: 'builds' },
      { from: 2, to: 0, label: 'requires' }
    ]

    // Arrow marker
    const defs = svg.append('defs')
    defs.append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 5)
      .attr('markerHeight', 5)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L10,0L0,4')
      .attr('fill', hasChoice ? grey : greyDark)

    // Draw edges
    edges.forEach((edge, i) => {
      const from = nodes[edge.from]
      const to = nodes[edge.to]

      // Calculate angle and offset from node centers
      const angle = Math.atan2(to.y - from.y, to.x - from.x)
      const nodeRadius = 36
      const x1 = from.x + Math.cos(angle) * nodeRadius
      const y1 = from.y + Math.sin(angle) * nodeRadius
      const x2 = to.x - Math.cos(angle) * (nodeRadius + 8)
      const y2 = to.y - Math.sin(angle) * (nodeRadius + 8)

      // Curved edge
      const midX = (x1 + x2) / 2
      const midY = (y1 + y2) / 2
      const dx = midX - centerX
      const dy = midY - centerY
      const dist = Math.sqrt(dx * dx + dy * dy)
      const curveOffset = 15
      const ctrlX = midX + (dx / dist) * curveOffset
      const ctrlY = midY + (dy / dist) * curveOffset

      svg.append('path')
        .attr('d', `M ${x1} ${y1} Q ${ctrlX} ${ctrlY} ${x2} ${y2}`)
        .attr('fill', 'none')
        .attr('stroke', hasChoice ? grey : greyDark)
        .attr('stroke-width', 2)
        .attr('opacity', hasChoice ? 0.6 : 0.3)
        .attr('marker-end', 'url(#arrow)')

      // Edge label
      svg.append('text')
        .attr('x', ctrlX + (i === 0 ? 8 : i === 1 ? 0 : -8))
        .attr('y', ctrlY + (i === 1 ? 12 : -4))
        .attr('text-anchor', 'middle')
        .attr('fill', grey)
        .attr('font-size', '9px')
        .attr('opacity', hasChoice ? 0.7 : 0.4)
        .text(edge.label)
    })

    // Draw nodes
    nodes.forEach((node, i) => {
      const g = svg.append('g')
        .attr('transform', `translate(${node.x}, ${node.y})`)

      // Node circle
      g.append('circle')
        .attr('r', 36)
        .attr('fill', hasChoice ? node.color : greyDark)
        .attr('fill-opacity', hasChoice ? 0.15 : 0.1)
        .attr('stroke', hasChoice ? node.color : greyDark)
        .attr('stroke-width', 2)

      // Label
      g.append('text')
        .attr('y', -6)
        .attr('text-anchor', 'middle')
        .attr('fill', hasChoice ? node.color : grey)
        .attr('font-size', '10px')
        .attr('font-weight', '500')
        .text(node.label)

      // Value with count-up
      const valueText = g.append('text')
        .attr('y', 12)
        .attr('text-anchor', 'middle')
        .attr('fill', white)
        .attr('font-size', '16px')
        .attr('font-weight', '700')
        .text(hasChoice ? '0%' : '—')

      if (hasChoice) {
        valueText.transition()
          .delay(i * 100)
          .duration(500)
          .tween('text', function() {
            const interpolator = d3.interpolateNumber(0, node.value)
            return function(t) {
              this.textContent = `${Math.round(interpolator(t))}%`
            }
          })
      }
    })

  }, [hasChoice, capabilityValue, transparencyValue, trustValue])

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 400 260"
      className="w-full h-auto"
      style={{ maxHeight: '260px' }}
    />
  )
})
