import { memo, useRef, useEffect } from 'react'
import * as d3 from 'd3'

interface FeedbackLoopProps {
  metrics: Record<string, number> | null
}

const colors = {
  purple: '#a78bfa',
  purpleGlow: '#8b5cf6',
  green: '#34d399',
  greenGlow: '#10b981',
  blue: '#60a5fa',
  blueGlow: '#3b82f6',
  grey: '#6b7280',
  greyDark: '#374151',
  white: '#ffffff'
}

interface Node {
  id: string
  label: string
  value: number
  color: string
  glow: string
  x: number
  y: number
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
    const height = 280
    const centerX = width / 2
    const centerY = 145
    const radius = 80

    // Node positions (equilateral triangle around center)
    const nodes: Node[] = [
      {
        id: 'capability',
        label: 'Capability',
        value: capabilityValue,
        color: colors.purple,
        glow: colors.purpleGlow,
        x: centerX,
        y: centerY - radius - 10
      },
      {
        id: 'trust',
        label: 'Trust',
        value: trustValue,
        color: colors.blue,
        glow: colors.blueGlow,
        x: centerX + radius * Math.cos(Math.PI / 6),
        y: centerY + radius * Math.sin(Math.PI / 6) + 20
      },
      {
        id: 'transparency',
        label: 'Transparency',
        value: transparencyValue,
        color: colors.green,
        glow: colors.greenGlow,
        x: centerX - radius * Math.cos(Math.PI / 6),
        y: centerY + radius * Math.sin(Math.PI / 6) + 20
      }
    ]

    // Edge definitions
    const edges = [
      { source: 0, target: 1, label: 'enables' },
      { source: 1, target: 2, label: 'builds' },
      { source: 2, target: 0, label: 'requires' }
    ]

    // Defs
    const defs = svg.append('defs')

    // Glow filters for each color
    nodes.forEach(node => {
      const glowFilter = defs.append('filter')
        .attr('id', `glow-${node.id}`)
        .attr('x', '-50%')
        .attr('y', '-50%')
        .attr('width', '200%')
        .attr('height', '200%')

      glowFilter.append('feGaussianBlur')
        .attr('stdDeviation', '4')
        .attr('result', 'coloredBlur')

      const feMerge = glowFilter.append('feMerge')
      feMerge.append('feMergeNode').attr('in', 'coloredBlur')
      feMerge.append('feMergeNode').attr('in', 'SourceGraphic')
    })

    // Arrow marker
    defs.append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L10,0L0,4')
      .attr('fill', colors.grey)

    // Gradient for flow effect
    nodes.forEach((node, i) => {
      const nextNode = nodes[(i + 1) % nodes.length]
      const gradient = defs.append('linearGradient')
        .attr('id', `flow-${i}`)
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', node.x)
        .attr('y1', node.y)
        .attr('x2', nextNode.x)
        .attr('y2', nextNode.y)

      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', node.color)
        .attr('stop-opacity', 0.8)
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', nextNode.color)
        .attr('stop-opacity', 0.8)
    })

    // Draw edges with curved paths
    edges.forEach((edge, i) => {
      const source = nodes[edge.source]
      const target = nodes[edge.target]

      // Calculate control point for curve (curve outward from center)
      const midX = (source.x + target.x) / 2
      const midY = (source.y + target.y) / 2
      const dx = midX - centerX
      const dy = midY - centerY
      const dist = Math.sqrt(dx * dx + dy * dy)
      const curveOffset = 25
      const ctrlX = midX + (dx / dist) * curveOffset
      const ctrlY = midY + (dy / dist) * curveOffset

      // Calculate offset for arrow (don't overlap with nodes)
      const nodeRadius = 38
      const angle1 = Math.atan2(target.y - source.y, target.x - source.x)
      const startX = source.x + Math.cos(angle1) * nodeRadius
      const startY = source.y + Math.sin(angle1) * nodeRadius

      const angle2 = Math.atan2(source.y - target.y, source.x - target.x)
      const endX = target.x + Math.cos(angle2) * (nodeRadius + 8)
      const endY = target.y + Math.sin(angle2) * (nodeRadius + 8)

      // Draw edge
      const edgePath = svg.append('path')
        .attr('d', `M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`)
        .attr('fill', 'none')
        .attr('stroke', hasChoice ? `url(#flow-${i})` : colors.greyDark)
        .attr('stroke-width', hasChoice ? 3 : 2)
        .attr('opacity', hasChoice ? 0.8 : 0.3)
        .attr('marker-end', 'url(#arrowhead)')

      // Animate flow
      if (hasChoice) {
        const pathLength = edgePath.node()?.getTotalLength() || 0
        edgePath
          .attr('stroke-dasharray', `${pathLength * 0.15} ${pathLength * 0.85}`)
          .attr('stroke-dashoffset', 0)

        function animateFlow() {
          edgePath
            .attr('stroke-dashoffset', 0)
            .transition()
            .duration(2000)
            .delay(i * 300)
            .ease(d3.easeLinear)
            .attr('stroke-dashoffset', -pathLength)
            .on('end', animateFlow)
        }
        animateFlow()
      }

      // Edge label
      svg.append('text')
        .attr('x', ctrlX + (i === 0 ? 10 : i === 1 ? 0 : -10))
        .attr('y', ctrlY + (i === 1 ? 15 : -5))
        .attr('text-anchor', 'middle')
        .attr('fill', colors.grey)
        .attr('font-size', '9px')
        .attr('opacity', hasChoice ? 0.7 : 0.3)
        .text(edge.label)
    })

    // Draw nodes
    nodes.forEach((node, i) => {
      const nodeGroup = svg.append('g')
        .attr('transform', `translate(${node.x}, ${node.y})`)

      // Outer glow
      if (hasChoice) {
        const glowCircle = nodeGroup.append('circle')
          .attr('r', 50)
          .attr('fill', node.color)
          .attr('opacity', 0)
          .attr('filter', `url(#glow-${node.id})`)

        glowCircle
          .transition()
          .delay(i * 200)
          .duration(600)
          .attr('opacity', 0.15)

        // Pulse animation
        function pulse() {
          glowCircle
            .transition()
            .duration(2000)
            .attr('r', 55)
            .attr('opacity', 0.1)
            .transition()
            .duration(2000)
            .attr('r', 50)
            .attr('opacity', 0.15)
            .on('end', pulse)
        }
        pulse()
      }

      // Outer ring (spinning dashes when active)
      const outerRing = nodeGroup.append('circle')
        .attr('r', 40)
        .attr('fill', 'none')
        .attr('stroke', node.color)
        .attr('stroke-width', hasChoice ? 2.5 : 2)
        .attr('opacity', hasChoice ? 1 : 0.3)
        .attr('stroke-dasharray', hasChoice ? '6,4' : 'none')

      if (hasChoice) {
        function spinRing() {
          outerRing
            .attr('stroke-dashoffset', 0)
            .transition()
            .duration(4000)
            .ease(d3.easeLinear)
            .attr('stroke-dashoffset', i % 2 === 0 ? -20 : 20)
            .on('end', spinRing)
        }
        spinRing()
      }

      // Inner filled circle
      nodeGroup.append('circle')
        .attr('r', 36)
        .attr('fill', node.color)
        .attr('opacity', hasChoice ? 0.12 : 0.05)

      // Label
      nodeGroup.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '-0.6em')
        .attr('fill', node.color)
        .attr('font-size', '10px')
        .attr('font-weight', '500')
        .text(node.label)

      // Value with count-up animation
      const valueText = nodeGroup.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '1.1em')
        .attr('fill', colors.white)
        .attr('font-size', '16px')
        .attr('font-weight', '700')
        .text(hasChoice ? '0%' : '—')

      if (hasChoice) {
        valueText
          .transition()
          .delay(400 + i * 150)
          .duration(800)
          .tween('text', function() {
            const interpolator = d3.interpolateNumber(0, node.value)
            return function(t) {
              this.textContent = `${Math.round(interpolator(t))}%`
            }
          })
      }
    })

    // Center indicator (shows the feedback cycle)
    if (hasChoice) {
      const centerGroup = svg.append('g')
        .attr('transform', `translate(${centerX}, ${centerY})`)

      // Rotating ring in center
      const innerRing = centerGroup.append('circle')
        .attr('r', 15)
        .attr('fill', 'none')
        .attr('stroke', colors.grey)
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4,4')
        .attr('opacity', 0.4)

      function rotateCenterRing() {
        innerRing
          .attr('stroke-dashoffset', 0)
          .transition()
          .duration(3000)
          .ease(d3.easeLinear)
          .attr('stroke-dashoffset', 16)
          .on('end', rotateCenterRing)
      }
      rotateCenterRing()
    }

  }, [hasChoice, capabilityValue, transparencyValue, trustValue])

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 400 280"
      className="w-full h-auto"
      style={{ maxHeight: '280px' }}
    />
  )
})
