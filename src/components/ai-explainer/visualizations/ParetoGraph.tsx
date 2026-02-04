import { memo, useRef, useEffect } from 'react'
import * as d3 from 'd3'

interface ParetoGraphProps {
  metrics: Record<string, number> | null
}

const colors = {
  blue: '#60a5fa',
  blueGlow: '#3b82f6',
  yellow: '#fbbf24',
  yellowGlow: '#f59e0b',
  grey: '#6b7280',
  greyDark: '#374151',
  greyDarker: '#1f2937',
  white: '#ffffff'
}

export const ParetoGraph = memo(function ParetoGraph({ metrics }: ParetoGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const prevPointRef = useRef<{ x: number; y: number } | null>(null)
  const hasChoice = metrics !== null
  const engagementValue = metrics?.engagement || 50
  const alignmentValue = metrics?.alignment || 50

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = 400
    const height = 280
    const margin = { top: 30, right: 30, bottom: 50, left: 60 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // Scales
    const xScale = d3.scaleLinear().domain([0, 100]).range([0, innerWidth])
    const yScale = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0])

    // Add definitions
    const defs = svg.append('defs')

    // Point glow
    const pointGlow = defs.append('radialGradient')
      .attr('id', 'pointGlow')
    pointGlow.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', colors.blue)
      .attr('stop-opacity', 0.6)
    pointGlow.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', colors.blue)
      .attr('stop-opacity', 0)

    // Frontier gradient
    const frontierGradient = defs.append('linearGradient')
      .attr('id', 'frontierGradient')
      .attr('x1', '0%')
      .attr('y1', '100%')
      .attr('x2', '100%')
      .attr('y2', '0%')
    frontierGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', colors.yellow)
      .attr('stop-opacity', 0.2)
    frontierGradient.append('stop')
      .attr('offset', '50%')
      .attr('stop-color', colors.yellow)
      .attr('stop-opacity', 0.6)
    frontierGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', colors.yellow)
      .attr('stop-opacity', 0.2)

    // Main group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Grid lines (subtle)
    const gridLines = g.append('g').attr('class', 'grid')

    // Vertical grid lines
    for (let i = 0; i <= 100; i += 25) {
      gridLines.append('line')
        .attr('x1', xScale(i))
        .attr('x2', xScale(i))
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', colors.greyDarker)
        .attr('stroke-width', 1)
        .attr('opacity', 0.5)
    }

    // Horizontal grid lines
    for (let i = 0; i <= 100; i += 25) {
      gridLines.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', yScale(i))
        .attr('y2', yScale(i))
        .attr('stroke', colors.greyDarker)
        .attr('stroke-width', 1)
        .attr('opacity', 0.5)
    }

    // Axes
    const xAxis = d3.axisBottom(xScale)
      .ticks(5)
      .tickFormat(d => `${d}%`)
      .tickSize(-5)

    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(d => `${d}%`)
      .tickSize(-5)

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .call(g => g.select('.domain').attr('stroke', colors.greyDark))
      .call(g => g.selectAll('.tick line').attr('stroke', colors.greyDark))
      .call(g => g.selectAll('.tick text').attr('fill', colors.grey).attr('font-size', '10px'))

    g.append('g')
      .call(yAxis)
      .call(g => g.select('.domain').attr('stroke', colors.greyDark))
      .call(g => g.selectAll('.tick line').attr('stroke', colors.greyDark))
      .call(g => g.selectAll('.tick text').attr('fill', colors.grey).attr('font-size', '10px'))

    // Axis labels
    svg.append('text')
      .attr('x', margin.left + innerWidth / 2)
      .attr('y', height - 10)
      .attr('text-anchor', 'middle')
      .attr('fill', colors.grey)
      .attr('font-size', '11px')
      .text('Engagement')

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(margin.top + innerHeight / 2))
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .attr('fill', colors.grey)
      .attr('font-size', '11px')
      .text('Alignment')

    // Pareto frontier curve (the optimal trade-off boundary)
    const frontierPath = d3.path()
    frontierPath.moveTo(xScale(15), yScale(95))
    frontierPath.bezierCurveTo(
      xScale(30), yScale(85),
      xScale(50), yScale(70),
      xScale(65), yScale(55)
    )
    frontierPath.bezierCurveTo(
      xScale(75), yScale(45),
      xScale(85), yScale(30),
      xScale(95), yScale(15)
    )

    // Frontier glow
    g.append('path')
      .attr('d', frontierPath.toString())
      .attr('fill', 'none')
      .attr('stroke', colors.yellow)
      .attr('stroke-width', 6)
      .attr('opacity', 0.15)
      .attr('filter', 'blur(4px)')

    // Main frontier line
    const frontierLine = g.append('path')
      .attr('d', frontierPath.toString())
      .attr('fill', 'none')
      .attr('stroke', 'url(#frontierGradient)')
      .attr('stroke-width', 2.5)
      .attr('stroke-linecap', 'round')

    // Animate frontier dash
    const frontierLength = frontierLine.node()?.getTotalLength() || 0
    frontierLine
      .attr('stroke-dasharray', `${frontierLength * 0.05} ${frontierLength * 0.03}`)
      .attr('stroke-dashoffset', 0)

    function animateFrontier() {
      frontierLine
        .transition()
        .duration(4000)
        .ease(d3.easeLinear)
        .attr('stroke-dashoffset', -frontierLength * 0.16)
        .on('end', animateFrontier)
    }
    animateFrontier()

    // Frontier label
    g.append('text')
      .attr('x', xScale(88))
      .attr('y', yScale(22))
      .attr('fill', colors.yellow)
      .attr('font-size', '9px')
      .attr('opacity', 0.7)
      .text('optimal')

    g.append('text')
      .attr('x', xScale(88))
      .attr('y', yScale(15))
      .attr('fill', colors.yellow)
      .attr('font-size', '9px')
      .attr('opacity', 0.7)
      .text('frontier')

    // Data point
    const pointX = hasChoice ? xScale(engagementValue) : xScale(50)
    const pointY = hasChoice ? yScale(alignmentValue) : yScale(50)
    const prevPoint = prevPointRef.current

    // Point glow (outer)
    if (hasChoice) {
      const glowCircle = g.append('circle')
        .attr('cx', prevPoint ? prevPoint.x : pointX)
        .attr('cy', prevPoint ? prevPoint.y : pointY)
        .attr('r', 25)
        .attr('fill', 'url(#pointGlow)')
        .attr('opacity', 0)

      glowCircle
        .transition()
        .duration(400)
        .attr('opacity', 1)
        .attr('cx', pointX)
        .attr('cy', pointY)

      // Pulse animation
      function pulseGlow() {
        glowCircle
          .transition()
          .duration(1500)
          .attr('r', 30)
          .attr('opacity', 0.6)
          .transition()
          .duration(1500)
          .attr('r', 25)
          .attr('opacity', 1)
          .on('end', pulseGlow)
      }
      pulseGlow()
    }

    // Main point
    const mainPoint = g.append('circle')
      .attr('cx', prevPoint ? prevPoint.x : pointX)
      .attr('cy', prevPoint ? prevPoint.y : pointY)
      .attr('r', hasChoice ? 10 : 8)
      .attr('fill', colors.blue)
      .attr('opacity', hasChoice ? 1 : 0.3)
      .attr('stroke', colors.white)
      .attr('stroke-width', 2)

    if (hasChoice) {
      mainPoint
        .transition()
        .duration(600)
        .ease(d3.easeCubicOut)
        .attr('cx', pointX)
        .attr('cy', pointY)
    }

    // Store current point for next animation
    prevPointRef.current = { x: pointX, y: pointY }

    // Value labels
    if (hasChoice) {
      const labelGroup = g.append('g')
        .attr('opacity', 0)

      labelGroup.append('text')
        .attr('x', pointX)
        .attr('y', pointY - 22)
        .attr('text-anchor', 'middle')
        .attr('fill', colors.white)
        .attr('font-size', '12px')
        .attr('font-weight', '600')
        .text(`${alignmentValue}% aligned`)

      labelGroup.append('text')
        .attr('x', pointX)
        .attr('y', pointY + 30)
        .attr('text-anchor', 'middle')
        .attr('fill', colors.grey)
        .attr('font-size', '10px')
        .text(`${engagementValue}% engaged`)

      labelGroup
        .transition()
        .delay(400)
        .duration(400)
        .attr('opacity', 1)
    }

    // Distance to frontier indicator
    if (hasChoice) {
      // Calculate closest point on frontier (simplified)
      const frontierY = 100 - engagementValue * 0.9 + 5
      const gap = Math.abs(alignmentValue - frontierY)

      if (gap > 10) {
        const distLine = g.append('line')
          .attr('x1', pointX)
          .attr('y1', pointY)
          .attr('x2', pointX)
          .attr('y2', yScale(frontierY))
          .attr('stroke', colors.yellow)
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '3,3')
          .attr('opacity', 0)

        distLine
          .transition()
          .delay(800)
          .duration(400)
          .attr('opacity', 0.5)
      }
    }

  }, [hasChoice, engagementValue, alignmentValue])

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 400 280"
      className="w-full h-auto"
      style={{ maxHeight: '280px' }}
    />
  )
})
