'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import * as d3 from 'd3'
import { stageColor as stageColors } from '@/lib/plant'

interface GraphNode {
  id: string
  title: string
  stage: string
  tags: string[]
  linkCount: number
  created?: number
  modified?: number
  description?: string
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

interface GraphEdge {
  source: string | GraphNode
  target: string | GraphNode
}

interface NoteGraphProps {
  nodes: GraphNode[]
  edges: GraphEdge[]
  currentSlug?: string
  fullscreen?: boolean
  className?: string
}

const stageLabels: Record<string, string> = {
  seedling: 'Seedling',
  budding: 'Budding',
  evergreen: 'Evergreen',
}

interface HoverInfo {
  node: GraphNode
  screenX: number
  screenY: number
}

const monthYearFormat = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' })
const monthYear = (ms: number) => monthYearFormat.format(ms)

export function NoteGraph({ nodes, edges, currentSlug, fullscreen = false, className }: NoteGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<HoverInfo | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const hoveredIdRef = useRef<string | null>(null)
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null)
  const svgSelRef = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined> | null>(null)

  const getNodeRadius = useCallback((d: GraphNode) => {
    const base = Math.min(2 + Math.sqrt(d.linkCount) * 2, fullscreen ? 12 : 8)
    return d.id === currentSlug ? base + 2 : base
  }, [currentSlug, fullscreen])

  // 1,090 connections shouldn't render as an unconnected dot field:
  // ~0.16 at the fullscreen 0.7x fit, capped at 0.3 zoomed in
  const restingEdgeOpacity = useCallback(
    (zoom: number) => Math.min(0.3, 0.1 + zoom * 0.08),
    []
  )

  // Label visibility threshold based on zoom
  const labelThreshold = useCallback((zoom: number): number => {
    if (zoom >= 3) return 0    // show all labels
    if (zoom >= 1.8) return 1  // show 1+ link labels
    if (zoom >= 1) return 3    // show 3+ link labels
    return 6                   // only big hubs
  }, [])

  // Resting label opacity: at the fullscreen 0.7x fit, hub labels rise
  // from a smear (~0.38) to legible (~0.61) against #08090b — still
  // quieter than the tooltip.
  const labelOpacity = useCallback((k: number): number => Math.min(0.9, 0.55 + (k - 0.5) * 0.3), [])

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || nodes.length === 0) return

    const container = containerRef.current
    const w = container.clientWidth
    const h = container.clientHeight

    // Zero-link seedlings render as ~8px circles; a 2px transparent hit
    // area is too small to tap reliably, so touch devices get a bigger
    // invisible ring around the same visible dot.
    const hitStrokeWidth = window.matchMedia('(pointer: coarse)').matches ? 12 : 2

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.attr('viewBox', `0 0 ${w} ${h}`)
    svgSelRef.current = svg

    const g = svg.append('g')

    // Create groups first so zoom handler can reference them
    const linkGroup = g.append('g')
    const nodeGroup = g.append('g')
    const labelGroup = g.append('g').attr('pointer-events', 'none')
    const tagGroup = g.append('g').attr('pointer-events', 'none')

    // Label collision culling runs after labels exist; the zoom handler
    // fires before that, so it goes through this holder.
    const cullHolder = { run: () => {} }
    let cullQueued = false
    const queueCull = () => {
      if (cullQueued) return
      cullQueued = true
      requestAnimationFrame(() => {
        cullQueued = false
        cullHolder.run()
      })
    }

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 8])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
        const k = event.transform.k
        setZoomLevel(k)

        // Semantic zoom: update label visibility
        // Font sizes are in graph-space; divide by k to keep constant screen size
        const thresh = labelThreshold(k)
        const labelSize = 11 / k  // 11px on screen regardless of zoom — the site's micro step
        const tagSize = 11 / k
        labelGroup.selectAll('text')
          .attr('opacity', (d: any) => {
            if (d.id === hoveredIdRef.current) return 0
            if (d.id === currentSlug) return 1
            return d.linkCount >= thresh ? labelOpacity(k) : 0
          })
          .attr('font-size', (d: any) => {
            return d.id === currentSlug ? 13 / k : labelSize
          })
          .attr('dy', (d: any) => -(getNodeRadius(d) + 6 / k))

        // Show tags at high zoom, scale inversely
        tagGroup.selectAll('text')
          .attr('opacity', k >= 2.5 ? 0.5 : 0)
          .attr('font-size', tagSize)
          .attr('dy', (d: any) => getNodeRadius(d) + 12 / k)

        // Edges are the subject of this page — keep them readable at rest,
        // brighter as you zoom in
        linkGroup.selectAll('line').attr('stroke-opacity', restingEdgeOpacity(k))

        // Nodes hold a sane on-screen size instead of ballooning with zoom
        const rScale = k > 1 ? 1 / Math.sqrt(k) : 1
        nodeGroup.selectAll('circle').attr('r', (d: any) => getNodeRadius(d) * rScale)

        queueCull()
      })

    zoomRef.current = zoom
    svg.call(zoom)

    // Initial zoom to fit
    const initialScale = fullscreen ? 0.7 : 0.9
    svg.call(zoom.transform, d3.zoomIdentity.translate(w / 2, h / 2).scale(initialScale).translate(-w / 2, -h / 2))

    const nodesCopy: GraphNode[] = nodes.map((n) => ({ ...n }))
    const edgesCopy = edges.map((e) => ({ ...e }))

    const sim = d3.forceSimulation(nodesCopy as d3.SimulationNodeDatum[])
      .force('link', d3.forceLink(edgesCopy as d3.SimulationLinkDatum<d3.SimulationNodeDatum>[])
        .id((d: any) => d.id)
        .distance((d: any) => {
          const srcLinks = (d.source as GraphNode).linkCount || 1
          const tgtLinks = (d.target as GraphNode).linkCount || 1
          return 20 + 60 / Math.sqrt(Math.min(srcLinks, tgtLinks))
        }))
      .force('charge', d3.forceManyBody()
        .strength((d: any) => -30 - d.linkCount * 4))
      .force('center', d3.forceCenter(w / 2, h / 2))
      .force('collide', d3.forceCollide((d: any) => getNodeRadius(d) + 2))
      .force('x', d3.forceX(w / 2).strength(0.04))
      .force('y', d3.forceY(h / 2).strength(0.04))

    // Edges
    const link = linkGroup
      .selectAll('line')
      .data(edgesCopy)
      .join('line')
      /* Near-solid stroke color: stroke-opacity is the only dial. The old
         rgba(...,0.15) color multiplied against stroke-opacity, leaving
         edges at ~2% alpha — invisible. */
      .attr('stroke', 'rgba(255,255,255,0.6)')
      .attr('stroke-opacity', restingEdgeOpacity(fullscreen ? 0.7 : 0.9))
      .attr('stroke-width', 0.5)

    // Nodes: each circle lives inside a real SVG <a> so the browser handles
    // cmd/ctrl/middle-click, right-click "open in new tab", and keyboard
    // activation for free — a synthetic click handler on the circle can't.
    const nodeAnchor = nodeGroup
      .selectAll<SVGAElement, GraphNode>('a')
      .data(nodesCopy)
      .join('a')
      .attr('href', (d: any) => '/' + d.id)
      .attr('aria-label', (d: any) => d.title)
      .attr('cursor', 'pointer')

    const node = nodeAnchor
      .selectAll('circle')
      .data((d: any) => [d])
      .join('circle')
      .attr('r', (d: any) => getNodeRadius(d))
      .attr('fill', (d: any) => d.id === currentSlug ? '#ffffff' : (stageColors[d.stage] || '#9aa0a8'))
      .attr('opacity', (d: any) => d.id === currentSlug ? 1 : 0.75)
      .attr('stroke', 'transparent')
      .attr('stroke-width', hitStrokeWidth)

    function highlightNode(this: any, event: MouseEvent | FocusEvent, d: any) {
      d3.select(this).select('circle')
        .transition().duration(150)
        .attr('opacity', 1)
        .attr('stroke', 'rgba(255, 255, 255, 0.32)') // --color-accent-rail
        .attr('stroke-width', hitStrokeWidth)

      // Highlight connected edges
      linkGroup.selectAll('line')
        .attr('stroke-opacity', (e: any) => {
          const src = typeof e.source === 'string' ? e.source : e.source.id
          const tgt = typeof e.target === 'string' ? e.target : e.target.id
          return (src === d.id || tgt === d.id) ? 0.55 : 0.05
        })
        .attr('stroke', (e: any) => {
          const src = typeof e.source === 'string' ? e.source : e.source.id
          const tgt = typeof e.target === 'string' ? e.target : e.target.id
          return (src === d.id || tgt === d.id) ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255,255,255,0.6)'
        })
        .attr('stroke-width', (e: any) => {
          const src = typeof e.source === 'string' ? e.source : e.source.id
          const tgt = typeof e.target === 'string' ? e.target : e.target.id
          return (src === d.id || tgt === d.id) ? 1.5 : 0.5
        })

      // Highlight connected nodes
      const connected = new Set<string>()
      edgesCopy.forEach((e: any) => {
        const src = typeof e.source === 'string' ? e.source : e.source.id
        const tgt = typeof e.target === 'string' ? e.target : e.target.id
        if (src === d.id) connected.add(tgt)
        if (tgt === d.id) connected.add(src)
      })
      nodeGroup.selectAll('circle')
        .attr('opacity', (n: any) => n.id === d.id || connected.has(n.id) ? 1 : 0.15)

      // Hide the canvas label for this node while tooltip is showing
      hoveredIdRef.current = d.id
      labelGroup.selectAll('text')
        .filter((n: any) => n.id === d.id)
        .attr('opacity', 0)
      tagGroup.selectAll('text')
        .filter((n: any) => n.id === d.id)
        .attr('opacity', 0)

      const rect = container.getBoundingClientRect()
      if ('clientX' in event) {
        setHover({ node: d, screenX: event.clientX - rect.left, screenY: event.clientY - rect.top })
      } else {
        // Keyboard focus carries no pointer position — center the tooltip on the node itself.
        const target = (this as SVGAElement).getBoundingClientRect()
        setHover({
          node: d,
          screenX: target.left + target.width / 2 - rect.left,
          screenY: target.top + target.height / 2 - rect.top,
        })
      }
    }

    function restoreNode(this: any, _event: MouseEvent | FocusEvent, d: any) {
      hoveredIdRef.current = null
      d3.select(this).select('circle')
        .transition().duration(200)
        .attr('opacity', d.id === currentSlug ? 1 : 0.75)
        .attr('stroke', 'transparent')
        .attr('stroke-width', hitStrokeWidth)

      linkGroup.selectAll('line')
        .attr('stroke-opacity', restingEdgeOpacity(d3.zoomTransform(svg.node()!).k))
        .attr('stroke', 'rgba(255,255,255,0.6)')
        .attr('stroke-width', 0.5)

      nodeGroup.selectAll('circle')
        .attr('opacity', (n: any) => n.id === currentSlug ? 1 : 0.75)

      // Restore label visibility for the previously hovered node
      const k = d3.zoomTransform(svg.node()!).k
      const thresh = labelThreshold(k)
      labelGroup.selectAll('text')
        .filter((n: any) => n.id === d.id)
        .attr('opacity', (n: any) => {
          if (n.id === currentSlug) return 1
          return n.linkCount >= thresh ? labelOpacity(k) : 0
        })

      setHover(null)
    }

    // A drag that actually moved the node must not also fire the anchor's
    // click-to-navigate — otherwise releasing a drag teleports you away.
    let dragMoved = false

    nodeAnchor
      .on('mouseenter', highlightNode)
      .on('focus', highlightNode)
      .on('mousemove', function (event: MouseEvent, d: any) {
        const rect = container.getBoundingClientRect()
        setHover({
          node: d,
          screenX: event.clientX - rect.left,
          screenY: event.clientY - rect.top,
        })
      })
      .on('mouseleave', restoreNode)
      .on('blur', restoreNode)
      .on('click', (event: MouseEvent) => {
        if (dragMoved) event.preventDefault()
      })

    // Drag
    const drag = d3.drag<SVGAElement, GraphNode>()
      .on('start', (event, d: any) => {
        dragMoved = false
        event.sourceEvent?.preventDefault()
        if (!event.active) sim.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
      })
      .on('drag', (event, d: any) => {
        dragMoved = true
        d.fx = event.x
        d.fy = event.y
      })
      .on('end', (event, d: any) => {
        if (!event.active) sim.alphaTarget(0)
        d.fx = null
        d.fy = null
      })
    nodeAnchor.call(drag as any)

    // Labels (semantic zoom controls visibility)
    const label = labelGroup
      .selectAll('text')
      .data(nodesCopy)
      .join('text')
      .text((d: any) => d.title.length > 24 ? d.title.slice(0, 24) + '\u2026' : d.title)
      .attr('font-size', 11)
      .attr('font-family', 'var(--font-family-body)')
      .attr('fill', 'rgba(255,255,255,0.8)')
      .attr('text-anchor', 'middle')
      .attr('dy', (d: any) => -(getNodeRadius(d) + 6))
      .attr('opacity', (d: any) => {
        if (d.id === currentSlug) return 1
        return d.linkCount >= 6 ? 0.6 : 0
      })

    /* Greedy screen-space label culling: in the dense hub cluster dozens
       of labels used to overprint into an unreadable smear. Priority goes
       to the current note, then the most-connected — an overlapping
       lower-priority label is hidden rather than stacked. */
    const culled = new Set<string>()
    cullHolder.run = () => {
      const t = d3.zoomTransform(svg.node()!)
      const k = t.k
      const thresh = labelThreshold(k)
      const eligible = (nodesCopy as any[])
        .filter((d) => d.x != null && (d.id === currentSlug || d.linkCount >= thresh))
        .sort(
          (a, b) =>
            (b.id === currentSlug ? 1e9 : b.linkCount) -
            (a.id === currentSlug ? 1e9 : a.linkCount)
        )
      culled.clear()
      const placed: { x1: number; y1: number; x2: number; y2: number }[] = []
      for (const d of eligible) {
        const chars = Math.min(d.title.length, 25)
        const wpx = chars * 5.6 // ~10px screen font, mean glyph width
        const hpx = 12
        const cx = t.applyX(d.x)
        const cy = t.applyY(d.y) - getNodeRadius(d) * k - 6 - hpx / 2
        const box = { x1: cx - wpx / 2, y1: cy - hpx / 2, x2: cx + wpx / 2, y2: cy + hpx / 2 }
        const hits = placed.some(
          (p) => box.x1 < p.x2 && box.x2 > p.x1 && box.y1 < p.y2 && box.y2 > p.y1
        )
        if (hits && d.id !== currentSlug) culled.add(d.id)
        else placed.push(box)
      }
      labelGroup.selectAll('text').attr('opacity', (d: any) => {
        if (d.id === hoveredIdRef.current) return 0
        if (culled.has(d.id)) return 0
        if (d.id === currentSlug) return 1
        return d.linkCount >= thresh ? labelOpacity(k) : 0
      })
    }

    // Tags (only visible at high zoom)
    tagGroup
      .selectAll('text')
      .data(nodesCopy.filter((n: any) => n.tags.length > 0))
      .join('text')
      .text((d: any) => d.tags.slice(0, 2).map((t: string) => '#' + t).join(' '))
      .attr('font-size', 11)
      .attr('font-family', 'var(--font-family-body)')
      .attr('fill', 'rgba(255,255,255,0.55)')
      .attr('text-anchor', 'middle')
      .attr('dy', (d: any) => getNodeRadius(d) + 14)
      .attr('opacity', 0)

    const ticked = () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y)
      node.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y)
      label.attr('x', (d: any) => d.x).attr('y', (d: any) => d.y)
      tagGroup.selectAll('text')
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y)
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Settle the layout synchronously instead of animating
      sim.stop()
      sim.tick(Math.ceil(Math.log(sim.alphaMin()) / Math.log(1 - sim.alphaDecay())))
      ticked()
      queueCull()
      sim.on('tick', ticked) // keep positions updating during drag
    } else {
      sim.on('tick', ticked)
      sim.on('end', queueCull)
    }

    return () => { sim.stop() }
  }, [nodes, edges, currentSlug, fullscreen, getNodeRadius, labelThreshold, labelOpacity])

  const handleZoomIn = useCallback(() => {
    if (!svgSelRef.current || !zoomRef.current) return
    svgSelRef.current.transition().duration(300).call(zoomRef.current.scaleBy, 1.5)
  }, [])

  const handleZoomOut = useCallback(() => {
    if (!svgSelRef.current || !zoomRef.current) return
    svgSelRef.current.transition().duration(300).call(zoomRef.current.scaleBy, 0.67)
  }, [])

  const handleReset = useCallback(() => {
    if (!svgSelRef.current || !zoomRef.current || !containerRef.current) return
    const w = containerRef.current.clientWidth
    const h = containerRef.current.clientHeight
    const scale = fullscreen ? 0.7 : 0.9
    svgSelRef.current.transition().duration(500).call(
      zoomRef.current.transform,
      d3.zoomIdentity.translate(w / 2, h / 2).scale(scale).translate(-w / 2, -h / 2)
    )
  }, [fullscreen])

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative', overflow: 'hidden' }}>
      <svg ref={svgRef} width="100%" height="100%" style={{ cursor: 'grab' }} />

      {/* Zoom controls */}
      {fullscreen && (
        <div className="absolute bottom-6 right-6 flex flex-col gap-1" style={{ zIndex: 20 }}>
          <button
            onClick={handleZoomIn}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-sm transition-colors"
            style={{ background: 'var(--color-background-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
          >+</button>
          <button
            onClick={handleZoomOut}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-sm transition-colors"
            style={{ background: 'var(--color-background-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
          >&minus;</button>
          <button
            onClick={handleReset}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-xs transition-colors mt-1"
            style={{ background: 'var(--color-background-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
            title="Reset view"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7a5 5 0 019-3M12 7a5 5 0 01-9 3M2 4V1.5M2 4h2.5M12 10v2.5M12 10h-2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      )}

      {/* Hover detail panel */}
      {hover && (
        <div
          className="rounded-lg p-3"
          style={{
            position: 'absolute',
            left: Math.min(hover.screenX + 16, (containerRef.current?.clientWidth || 400) - 220),
            top: Math.min(hover.screenY - 10, (containerRef.current?.clientHeight || 400) - 120),
            zIndex: 30,
            pointerEvents: 'none',
            background: 'var(--color-background-surface)',
            border: '1px solid var(--color-border-emphasized)',
            minWidth: 180,
            maxWidth: 240,
          }}
        >
          <p className="text-sm font-semibold leading-tight mb-1" style={{ color: 'var(--color-text-primary)' }}>
            {hover.node.title}
          </p>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs" style={{ color: stageColors[hover.node.stage] || '#9aa0a8' }}>
              {stageLabels[hover.node.stage] || hover.node.stage}
            </span>
            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              {hover.node.linkCount} connection{hover.node.linkCount !== 1 ? 's' : ''}
            </span>
          </div>
          {hover.node.created && hover.node.modified && (
            <p className="mb-1.5" style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
              Planted {monthYear(hover.node.created)} &middot; tended {monthYear(hover.node.modified)}
            </p>
          )}
          {hover.node.description && (
            <p
              className="mb-1.5"
              style={{
                fontSize: 12,
                color: 'var(--color-text-secondary)',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {hover.node.description}
            </p>
          )}
          {hover.node.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {hover.node.tags.map((tag) => (
                <span key={tag} className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>#{tag}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Zoom level indicator (fullscreen only) */}
      {fullscreen && (
        <div
          className="absolute bottom-6 left-6 text-xs tabular-nums"
          style={{ color: 'var(--color-text-disabled)', zIndex: 20 }}
        >
          {Math.round(zoomLevel * 100)}%
        </div>
      )}
    </div>
  )
}
