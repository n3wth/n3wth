import { memo, useRef, useEffect } from 'react'
import * as d3 from 'd3'

interface ParetoGraphProps {
  metrics: Record<string, number> | null
}

export const ParetoGraph = memo(function ParetoGraph({ metrics }: ParetoGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const hasChoice = metrics !== null
  const engagementValue = metrics?.engagement || 50
  const alignmentValue = metrics?.alignment || 50

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = 400
    const height = 260
    const margin = { top: 25, right: 25, bottom: 45, left: 55 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // Colors - flat
    const blue = '#60a5fa'
    const yellow = '#fbbf24'
    const grey = '#6b7280'
    const greyDark = '#374151'
    const greyDarker = '#1f2937'
    const white = '#ffffff'

    // Scales
    const xScale = d3.scaleLinear().domain([0, 100]).range([0, innerWidth])
    const yScale = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0])

    // Main group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Grid lines (subtle)
    for (let i = 25; i <= 75; i += 25) {
      g.append('line')
        .attr('x1', xScale(i))
        .attr('x2', xScale(i))
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', greyDarker)
        .attr('stroke-width', 1)

      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', yScale(i))
        .attr('y2', yScale(i))
        .attr('stroke', greyDarker)
        .attr('stroke-width', 1)
    }

    // Axes
    g.append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', innerHeight)
      .attr('y2', innerHeight)
      .attr('stroke', greyDark)
      .attr('stroke-width', 2)

    g.append('line')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', greyDark)
      .attr('stroke-width', 2)

    // Axis labels
    g.append('text')
      .attr('x', 0)
      .attr('y', innerHeight + 12)
      .attr('fill', grey)
      .attr('font-size', '9px')
      .text('0')

    g.append('text')
      .attr('x', innerWidth - 20)
      .attr('y', innerHeight + 12)
      .attr('fill', grey)
      .attr('font-size', '9px')
      .text('100%')

    g.append('text')
      .attr('x', -8)
      .attr('y', innerHeight)
      .attr('fill', grey)
      .attr('font-size', '9px')
      .attr('text-anchor', 'end')
      .text('0')

    g.append('text')
      .attr('x', -8)
      .attr('y', 5)
      .attr('fill', grey)
      .attr('font-size', '9px')
      .attr('text-anchor', 'end')
      .text('100%')

    // Axis titles
    svg.append('text')
      .attr('x', margin.left + innerWidth / 2)
      .attr('y', height - 8)
      .attr('text-anchor', 'middle')
      .attr('fill', grey)
      .attr('font-size', '11px')
      .text('Engagement')

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(margin.top + innerHeight / 2))
      .attr('y', 14)
      .attr('text-anchor', 'middle')
      .attr('fill', grey)
      .attr('font-size', '11px')
      .text('Alignment')

    // Pareto frontier (optimal trade-off curve) - dashed line
    const frontierPoints: [number, number][] = [
      [15, 95], [30, 80], [50, 60], [70, 40], [85, 25], [95, 15]
    ]
    const lineGenerator = d3.line()
      .x(d => xScale(d[0]))
      .y(d => yScale(d[1]))
      .curve(d3.curveMonotoneX)

    g.append('path')
      .datum(frontierPoints)
      .attr('d', lineGenerator)
      .attr('fill', 'none')
      .attr('stroke', yellow)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '6,4')
      .attr('opacity', 0.7)

    g.append('text')
      .attr('x', xScale(90))
      .attr('y', yScale(20))
      .attr('fill', yellow)
      .attr('font-size', '9px')
      .attr('opacity', 0.8)
      .text('frontier')

    // Data point - fixed position calculation
    const pointX = xScale(engagementValue)
    const pointY = yScale(alignmentValue)
    const defaultX = xScale(50)
    const defaultY = yScale(50)

    // Point
    const point = g.append('circle')
      .attr('cx', hasChoice ? defaultX : defaultX)
      .attr('cy', hasChoice ? defaultY : defaultY)
      .attr('r', 10)
      .attr('fill', blue)
      .attr('stroke', white)
      .attr('stroke-width', 2)
      .attr('opacity', hasChoice ? 1 : 0.3)

    if (hasChoice) {
      point.transition()
        .duration(500)
        .ease(d3.easeCubicOut)
        .attr('cx', pointX)
        .attr('cy', pointY)
    }

    // Value labels (appear after point moves)
    if (hasChoice) {
      const labelGroup = g.append('g').attr('opacity', 0)

      labelGroup.append('text')
        .attr('x', pointX)
        .attr('y', pointY - 18)
        .attr('text-anchor', 'middle')
        .attr('fill', white)
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .text(`${alignmentValue}% aligned`)

      labelGroup.append('text')
        .attr('x', pointX)
        .attr('y', pointY + 26)
        .attr('text-anchor', 'middle')
        .attr('fill', grey)
        .attr('font-size', '10px')
        .text(`${engagementValue}% engaged`)

      labelGroup.transition()
        .delay(400)
        .duration(300)
        .attr('opacity', 1)
    }

  }, [hasChoice, engagementValue, alignmentValue])

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 400 260"
      className="w-full h-auto"
      style={{ maxHeight: '260px' }}
    />
  )
})
