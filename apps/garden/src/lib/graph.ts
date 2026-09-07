import { getPublishedNotes, resolveWikilink, type GrowthStage } from './content'
import { extractWikilinks } from './backlinks'
import contentHistory from '@/data/content-history.json'

const history = contentHistory as Record<string, { c: number; m: number }>

export interface GraphNode {
  id: string
  title: string
  stage: GrowthStage
  tags: string[]
  linkCount: number
  description?: string
  /** Unix ms of the note's first and latest git commit (from content-history.json). */
  created?: number
  modified?: number
}

export interface GraphEdge {
  source: string
  target: string
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

let cachedGraph: GraphData | null = null

export function getGraphData(): GraphData {
  if (cachedGraph) return cachedGraph

  /* Published notes only, so the graph (and every stat derived from it)
     agrees with the counts on /notes and the headlines — the '' index
     and 'notes' shadow slugs used to appear as extra nodes. */
  const notes = getPublishedNotes()
  const published = new Set(notes.map((n) => n.slug))
  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []
  const edgeSet = new Set<string>()

  for (const note of notes) {
    const targets = extractWikilinks(note.content)
    let linkCount = 0

    for (const target of targets) {
      const resolvedSlug = resolveWikilink(target)
      if (!resolvedSlug || resolvedSlug === note.slug) continue
      if (!published.has(resolvedSlug)) continue

      const edgeKey = [note.slug, resolvedSlug].sort().join('::')
      if (!edgeSet.has(edgeKey)) {
        edgeSet.add(edgeKey)
        edges.push({ source: note.slug, target: resolvedSlug })
      }
      linkCount++
    }

    const h = history[note.filePath]
    nodes.push({
      id: note.slug,
      title: note.title,
      stage: note.stage,
      tags: note.tags.slice(0, 3),
      linkCount,
      description: note.description || undefined,
      created: h?.c,
      modified: h?.m,
    })
  }

  cachedGraph = { nodes, edges }
  return cachedGraph
}

export function getLocalGraph(slug: string, depth: number = 1): GraphData {
  const full = getGraphData()
  const connected = new Set<string>()
  connected.add(slug)

  for (let d = 0; d < depth; d++) {
    const current = [...connected]
    for (const edge of full.edges) {
      if (current.includes(edge.source)) connected.add(edge.target)
      if (current.includes(edge.target)) connected.add(edge.source)
    }
  }

  return {
    nodes: full.nodes.filter((n) => connected.has(n.id)),
    edges: full.edges.filter((e) => connected.has(e.source) && connected.has(e.target)),
  }
}
