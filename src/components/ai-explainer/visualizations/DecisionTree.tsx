import { memo, useRef, useEffect } from 'react'
import * as d3 from 'd3'

interface DecisionTreeProps {
  metrics: Record<string, number> | null
}

const colors = {
  green: '#34d399',
  greenGlow: '#10b981',
  blue: '#60a5fa',
  blueGlow: '#3b82f6',
  grey: '#6b7280',
  greyDark: '#374151',
  white: '#ffffff'
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
    const height = 280
    const centerX = width / 2
    const topY = 60
    const bottomY = 180

    // Add gradient definitions
    const defs = svg.append('defs')

    // Green glow gradient
    const greenGlow = defs.append('radialGradient')
      .attr('id', 'greenGlow')
    greenGlow.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', colors.green)
      .attr('stop-opacity', 0.4)
    greenGlow.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', colors.green)
      .attr('stop-opacity', 0)

    // Blue glow gradient
    const blueGlow = defs.append('radialGradient')
      .attr('id', 'blueGlow')
    blueGlow.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', colors.blue)
      .attr('stop-opacity', 0.4)
    blueGlow.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', colors.blue)
      .attr('stop-opacity', 0)

    // Animated line gradient
    const lineGradient = defs.append('linearGradient')
      .attr('id', 'lineGradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', centerX)
      .attr('y1', topY)
      .attr('x2', '100')
      .attr('y2', bottomY)
    lineGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', colors.grey)
    lineGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', colors.green)

    const lineGradient2 = defs.append('linearGradient')
      .attr('id', 'lineGradient2')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', centerX)
      .attr('y1', topY)
      .attr('x2', '300')
      .attr('y2', bottomY)
    lineGradient2.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', colors.grey)
    lineGradient2.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', colors.blue)

    // Draw connections first (behind nodes)
    const leftLine = svg.append('path')
      .attr('d', `M ${centerX} ${topY + 30} Q ${centerX - 50} ${(topY + bottomY) / 2} 100 ${bottomY - 35}`)
      .attr('fill', 'none')
      .attr('stroke', hasChoice ? 'url(#lineGradient)' : colors.greyDark)
      .attr('stroke-width', hasChoice ? 3 : 2)
      .attr('opacity', hasChoice ? 1 : 0.3)

    const rightLine = svg.append('path')
      .attr('d', `M ${centerX} ${topY + 30} Q ${centerX + 50} ${(topY + bottomY) / 2} 300 ${bottomY - 35}`)
      .attr('fill', 'none')
      .attr('stroke', hasChoice ? 'url(#lineGradient2)' : colors.greyDark)
      .attr('stroke-width', hasChoice ? 3 : 2)
      .attr('opacity', hasChoice ? 1 : 0.3)

    // Animate lines when choice is made
    if (hasChoice) {
      const leftLength = leftLine.node()?.getTotalLength() || 0
      leftLine
        .attr('stroke-dasharray', leftLength)
        .attr('stroke-dashoffset', leftLength)
        .transition()
        .duration(800)
        .ease(d3.easeCubicOut)
        .attr('stroke-dashoffset', 0)

      const rightLength = rightLine.node()?.getTotalLength() || 0
      rightLine
        .attr('stroke-dasharray', rightLength)
        .attr('stroke-dashoffset', rightLength)
        .transition()
        .duration(800)
        .ease(d3.easeCubicOut)
        .attr('stroke-dashoffset', 0)
    }

    // Root node
    const rootGroup = svg.append('g')
      .attr('transform', `translate(${centerX}, ${topY})`)

    rootGroup.append('circle')
      .attr('r', 32)
      .attr('fill', colors.greyDark)
      .attr('stroke', colors.grey)
      .attr('stroke-width', 2)

    rootGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', colors.white)
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .text('Decision')

    // Safety node (left)
    const safetyGroup = svg.append('g')
      .attr('transform', `translate(100, ${bottomY})`)

    // Glow effect
    if (hasChoice) {
      safetyGroup.append('circle')
        .attr('r', 55)
        .attr('fill', 'url(#greenGlow)')
        .attr('opacity', 0)
        .transition()
        .delay(400)
        .duration(600)
        .attr('opacity', 1)
    }

    // Outer ring with animated dash
    const safetyRing = safetyGroup.append('circle')
      .attr('r', 42)
      .attr('fill', 'transparent')
      .attr('stroke', colors.green)
      .attr('stroke-width', hasChoice ? 3 : 2)
      .attr('opacity', hasChoice ? 1 : 0.3)
      .attr('stroke-dasharray', hasChoice ? '8,4' : 'none')

    if (hasChoice) {
      // Animate the dash rotation
      function animateDash() {
        safetyRing
          .attr('stroke-dashoffset', 0)
          .transition()
          .duration(3000)
          .ease(d3.easeLinear)
          .attr('stroke-dashoffset', -24)
          .on('end', animateDash)
      }
      animateDash()
    }

    // Inner filled circle
    safetyGroup.append('circle')
      .attr('r', hasChoice ? 38 : 36)
      .attr('fill', colors.green)
      .attr('opacity', hasChoice ? 0.15 : 0.05)

    safetyGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.5em')
      .attr('fill', colors.green)
      .attr('font-size', '10px')
      .attr('font-weight', '500')
      .text('Safety')

    // Animated value counter
    const safetyValueText = safetyGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1em')
      .attr('fill', colors.white)
      .attr('font-size', '18px')
      .attr('font-weight', '700')
      .text(hasChoice ? '0%' : '—')

    if (hasChoice) {
      safetyValueText
        .transition()
        .delay(500)
        .duration(800)
        .tween('text', function() {
          const interpolator = d3.interpolateNumber(0, safetyValue)
          return function(t) {
            this.textContent = `${Math.round(interpolator(t))}%`
          }
        })
    }

    // Fairness node (right)
    const fairnessGroup = svg.append('g')
      .attr('transform', `translate(300, ${bottomY})`)

    // Glow effect
    if (hasChoice) {
      fairnessGroup.append('circle')
        .attr('r', 55)
        .attr('fill', 'url(#blueGlow)')
        .attr('opacity', 0)
        .transition()
        .delay(400)
        .duration(600)
        .attr('opacity', 1)
    }

    // Outer ring with animated dash
    const fairnessRing = fairnessGroup.append('circle')
      .attr('r', 42)
      .attr('fill', 'transparent')
      .attr('stroke', colors.blue)
      .attr('stroke-width', hasChoice ? 3 : 2)
      .attr('opacity', hasChoice ? 1 : 0.3)
      .attr('stroke-dasharray', hasChoice ? '8,4' : 'none')

    if (hasChoice) {
      function animateFairnessDash() {
        fairnessRing
          .attr('stroke-dashoffset', 0)
          .transition()
          .duration(3000)
          .ease(d3.easeLinear)
          .attr('stroke-dashoffset', 24)
          .on('end', animateFairnessDash)
      }
      animateFairnessDash()
    }

    // Inner filled circle
    fairnessGroup.append('circle')
      .attr('r', hasChoice ? 38 : 36)
      .attr('fill', colors.blue)
      .attr('opacity', hasChoice ? 0.15 : 0.05)

    fairnessGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.5em')
      .attr('fill', colors.blue)
      .attr('font-size', '10px')
      .attr('font-weight', '500')
      .text('Fairness')

    // Animated value counter
    const fairnessValueText = fairnessGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1em')
      .attr('fill', colors.white)
      .attr('font-size', '18px')
      .attr('font-weight', '700')
      .text(hasChoice ? '0%' : '—')

    if (hasChoice) {
      fairnessValueText
        .transition()
        .delay(500)
        .duration(800)
        .tween('text', function() {
          const interpolator = d3.interpolateNumber(0, fairnessValue)
          return function(t) {
            this.textContent = `${Math.round(interpolator(t))}%`
          }
        })
    }

    // Labels
    svg.append('text')
      .attr('x', 100)
      .attr('y', 250)
      .attr('text-anchor', 'middle')
      .attr('fill', colors.grey)
      .attr('font-size', '9px')
      .attr('opacity', hasChoice ? 0.7 : 0.4)
      .text('Catch more harm')

    svg.append('text')
      .attr('x', 300)
      .attr('y', 250)
      .attr('text-anchor', 'middle')
      .attr('fill', colors.grey)
      .attr('font-size', '9px')
      .attr('opacity', hasChoice ? 0.7 : 0.4)
      .text('Fewer false positives')

  }, [hasChoice, safetyValue, fairnessValue])

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 400 280"
      className="w-full h-auto"
      style={{ maxHeight: '280px' }}
    />
  )
})
