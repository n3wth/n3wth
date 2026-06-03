import { memo, useRef, useEffect } from 'react'
import * as d3 from 'd3'

interface DecisionTreeProps {
  metrics: Record<string, number> | null
}

export const DecisionTree = memo(function DecisionTree({ metrics }: DecisionTreeProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const hasChoice = metrics !== null
  const safetyValue = metrics?.safety || 0
  const fairnessValue = metrics?.fairness || 0

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = 400
    const centerX = width / 2

    // Fixed positions - no shifting
    const rootY = 50
    const leafY = 170
    const leftX = 100
    const rightX = 300

    // Colors - flat, no gradients
    const green = '#34d399'
    const blue = '#60a5fa'
    const grey = '#6b7280'
    const greyDark = '#374151'
    const white = '#ffffff'

    // Draw connections (straight lines, clean)
    svg.append('line')
      .attr('x1', centerX)
      .attr('y1', rootY + 25)
      .attr('x2', leftX)
      .attr('y2', leafY - 35)
      .attr('stroke', hasChoice ? green : greyDark)
      .attr('stroke-width', 2)
      .attr('opacity', hasChoice ? 1 : 0.4)

    svg.append('line')
      .attr('x1', centerX)
      .attr('y1', rootY + 25)
      .attr('x2', rightX)
      .attr('y2', leafY - 35)
      .attr('stroke', hasChoice ? blue : greyDark)
      .attr('stroke-width', 2)
      .attr('opacity', hasChoice ? 1 : 0.4)

    // Root node
    svg.append('circle')
      .attr('cx', centerX)
      .attr('cy', rootY)
      .attr('r', 28)
      .attr('fill', greyDark)
      .attr('stroke', grey)
      .attr('stroke-width', 2)

    svg.append('text')
      .attr('x', centerX)
      .attr('y', rootY)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', white)
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .text('Decision')

    // Safety node (left)
    svg.append('circle')
      .attr('cx', leftX)
      .attr('cy', leafY)
      .attr('r', 38)
      .attr('fill', hasChoice ? green : greyDark)
      .attr('fill-opacity', hasChoice ? 0.15 : 0.1)
      .attr('stroke', hasChoice ? green : greyDark)
      .attr('stroke-width', 2)

    svg.append('text')
      .attr('x', leftX)
      .attr('y', leafY - 8)
      .attr('text-anchor', 'middle')
      .attr('fill', hasChoice ? green : grey)
      .attr('font-size', '10px')
      .attr('font-weight', '500')
      .text('Safety')

    // Safety value - count up animation
    const safetyText = svg.append('text')
      .attr('x', leftX)
      .attr('y', leafY + 12)
      .attr('text-anchor', 'middle')
      .attr('fill', white)
      .attr('font-size', '18px')
      .attr('font-weight', '700')
      .text(hasChoice ? '0%' : '—')

    if (hasChoice) {
      safetyText.transition()
        .duration(600)
        .tween('text', function() {
          const i = d3.interpolateNumber(0, safetyValue)
          return function(t) {
            this.textContent = `${Math.round(i(t))}%`
          }
        })
    }

    // Fairness node (right)
    svg.append('circle')
      .attr('cx', rightX)
      .attr('cy', leafY)
      .attr('r', 38)
      .attr('fill', hasChoice ? blue : greyDark)
      .attr('fill-opacity', hasChoice ? 0.15 : 0.1)
      .attr('stroke', hasChoice ? blue : greyDark)
      .attr('stroke-width', 2)

    svg.append('text')
      .attr('x', rightX)
      .attr('y', leafY - 8)
      .attr('text-anchor', 'middle')
      .attr('fill', hasChoice ? blue : grey)
      .attr('font-size', '10px')
      .attr('font-weight', '500')
      .text('Fairness')

    // Fairness value - count up animation
    const fairnessText = svg.append('text')
      .attr('x', rightX)
      .attr('y', leafY + 12)
      .attr('text-anchor', 'middle')
      .attr('fill', white)
      .attr('font-size', '18px')
      .attr('font-weight', '700')
      .text(hasChoice ? '0%' : '—')

    if (hasChoice) {
      fairnessText.transition()
        .duration(600)
        .tween('text', function() {
          const i = d3.interpolateNumber(0, fairnessValue)
          return function(t) {
            this.textContent = `${Math.round(i(t))}%`
          }
        })
    }

    // Labels explaining the trade-off
    svg.append('text')
      .attr('x', leftX)
      .attr('y', 235)
      .attr('text-anchor', 'middle')
      .attr('fill', grey)
      .attr('font-size', '9px')
      .text('Catches more harm')

    svg.append('text')
      .attr('x', rightX)
      .attr('y', 235)
      .attr('text-anchor', 'middle')
      .attr('fill', grey)
      .attr('font-size', '9px')
      .text('Fewer false positives')

  }, [hasChoice, safetyValue, fairnessValue])

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 400 260"
      className="w-full h-auto"
      style={{ maxHeight: '260px' }}
    />
  )
})
