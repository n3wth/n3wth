'use client'

import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { WorldGarden } from '@/components/WorldGarden'
import { FocusedNotePanel } from '@/components/FocusedNotePanel'
import { getVisited } from '@/lib/visited'
import type { WorldNode, WorldEdge } from '@/lib/worldLayout'

const WorldGarden3D = dynamic(
  () => import('@/components/WorldGarden3D').then((m) => m.WorldGarden3D),
  { ssr: false, loading: () => <div className="absolute inset-0" style={{ background: '#08090b' }} /> }
)

interface WorldGardenClientProps {
  nodes: WorldNode[]
  edges: WorldEdge[]
  /** Fly the camera in from high above on first render. */
  intro?: boolean
}

/** Detect WebGL support without holding onto the probe context/canvas. */
function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

/**
 * Progressive enhancement: the 2D canvas garden (WorldGarden) is the
 * baseline that always works. Once mounted in the browser, if WebGL is
 * available and the reader hasn't asked for reduced motion, we upgrade
 * to the immersive 3D garden (WorldGarden3D). Same props either way.
 */
export function WorldGardenClient({ nodes, edges, intro = true }: WorldGardenClientProps) {
  /* null = not yet decided. This starts undecided rather than false on
     purpose: booting at false mounted the 2D garden, let it play its
     intro, then swapped it for the 3D one mid-flight, which played a
     second intro from a different framing. The visitor saw the view jump
     between two renderers. Now nothing paints until the probe answers,
     and exactly one renderer ever runs an intro. */
  const [use3D, setUse3D] = useState<boolean | null>(null)
  // 3D selection lives here so the focused-note panel is shared with 2D;
  // the 2D renderer keeps its own selection (it also flies the camera).
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [visited, setVisited] = useState<Set<string>>(() => new Set())

  // Layout effect, not effect: the probe is synchronous, so resolving it
  // before the browser paints means the undecided state never shows.
  useLayoutEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setUse3D(!reduceMotion && supportsWebGL())
  }, [])

  useEffect(() => {
    setVisited(new Set(Object.keys(getVisited())))
  }, [])

  // Escape dismisses the 3D selection (2D handles its own Escape)
  useEffect(() => {
    if (!use3D) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      const el = document.activeElement
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) return
      setSelectedId(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [use3D])

  const nodeById = useMemo(() => {
    const m = new Map<string, WorldNode>()
    for (const n of nodes) m.set(n.id, n)
    return m
  }, [nodes])

  const neighbors = useMemo(() => {
    const map = new Map<string, Set<string>>()
    for (const e of edges) {
      if (!map.has(e.source)) map.set(e.source, new Set())
      if (!map.has(e.target)) map.set(e.target, new Set())
      map.get(e.source)!.add(e.target)
      map.get(e.target)!.add(e.source)
    }
    return map
  }, [edges])

  const selected = selectedId !== null ? nodeById.get(selectedId) ?? null : null
  const selectedNeighbors = selectedId !== null
    ? [...(neighbors.get(selectedId) || [])]
        .map((id) => nodeById.get(id))
        .filter((n): n is WorldNode => !!n)
        .sort((a, b) => b.linkCount - a.linkCount)
    : []

  return (
    <div className="absolute inset-0" data-world-mode={use3D === null ? 'pending' : use3D ? '3d' : '2d'}>
      {use3D === null ? (
        <div className="absolute inset-0" style={{ background: '#08090b' }} />
      ) : use3D ? (
        <WorldGarden3D nodes={nodes} edges={edges} intro={intro} onSelect={setSelectedId} />
      ) : (
        <WorldGarden nodes={nodes} edges={edges} intro={intro} />
      )}

      {/* Focused-note panel for the 3D world; navigation happens only from its CTA */}
      {use3D && selected && (
        <FocusedNotePanel
          note={selected}
          neighbors={selectedNeighbors}
          visited={visited}
          onSelectNeighbor={setSelectedId}
        />
      )}
    </div>
  )
}
