export interface WritingNode {
  id: string
  title: string
  description: string
  stage: 'seedling' | 'budding' | 'evergreen'
  tags: string[]
  linkCount: number
}

export interface WritingWorld {
  nodes: WritingNode[]
  edges: { source: string; target: string }[]
}

export interface GroveTree extends WritingNode {
  x: number
  z: number
  height: number
}

export interface PlantSegment {
  a: [number, number, number]
  b: [number, number, number]
  detail: boolean
}

// Garden's seeded generator keeps each note's silhouette stable across visits.
export function hashString(value: string) {
  let hash = 2166136261
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Bounded topic bands leave the centre and landmark sightlines clear.
 * Sorting and seeded spacing replace Garden's quadratic simulation.
 */
export function layoutWritingGroves(nodes: WritingNode[], compact: boolean, spread = 1): GroveTree[] {
  const topics = new Map<string, WritingNode[]>()
  for (const node of nodes) {
    const topic = node.tags[0] ?? 'notes'
    const members = topics.get(topic) ?? []
    members.push(node)
    topics.set(topic, members)
  }
  const result: GroveTree[] = []
  const groups = [...topics.entries()].sort(([a], [b]) => a.localeCompare(b))
  const rows = Math.max(1, Math.ceil(nodes.length / 8) - 1)
  groups.forEach(([, members]) => {
    members.sort((a, b) => a.id.localeCompare(b.id)).forEach((node) => {
      const index = result.length
      const side = index % 2 === 0 ? -1 : 1
      const row = Math.floor(index / 8)
      const column = Math.floor(index / 2) % 4
      const random = mulberry32(hashString(node.id))
      const depth = row / rows * 40
      const z = -6 - depth + (random() - 0.5) * 0.6
      // Perspective bands widen toward the back without extending to infinity.
      // Leave gaps along the art, Work, Notes and near-field portal sightlines.
      const angle = compact ? 0.135 + column * 0.021 : 0.23 + column * 0.023
      const x = side * ((compact ? 26 : 22) - z) * angle * (compact ? spread : 1)
      result.push({
        ...node,
        x,
        z,
        height: ({ seedling: 1, budding: 2.4, evergreen: 4.2 })[node.stage],
      })
    })
  })
  return result
}

/** Garden's bowed trunks, link-count branches and evergreen leaf ticks. */
export function plantSegments(node: GroveTree): PlantSegment[] {
  const random = mulberry32(hashString(node.id) ^ 0x9e3779b9)
  const segments: PlantSegment[] = []
  const azimuth = random() * Math.PI * 2
  const bow = node.height * (0.03 + random() * 0.05)
  const trunk = (fraction: number): [number, number, number] => [
    node.x + Math.cos(azimuth) * Math.sin(Math.PI * fraction) * bow,
    node.height * fraction,
    node.z + Math.sin(azimuth) * Math.sin(Math.PI * fraction) * bow,
  ]
  for (let i = 0; i < 3; i++) segments.push({ a: trunk(i / 3), b: trunk((i + 1) / 3), detail: false })
  const branches = Math.min(6, node.stage === 'seedling' ? 1 + Math.round(random()) : (node.stage === 'evergreen' ? 4 : 2) + Math.round(Math.sqrt(node.linkCount)))
  for (let i = 0; i < branches; i++) {
    const base = trunk(0.35 + random() * 0.55)
    const angle = random() * Math.PI * 2
    const length = node.height * (0.12 + random() * 0.16)
    const tip: [number, number, number] = [base[0] + Math.cos(angle) * length, base[1] + length * (node.stage === 'evergreen' ? 0.55 : 0.3), base[2] + Math.sin(angle) * length]
    segments.push({ a: base, b: tip, detail: true })
    if (node.stage === 'evergreen') {
      const leafAngle = angle + Math.PI / 2 + random() - 0.5
      const leafLength = (4 + random() * 6) * node.height / 175
      segments.push({ a: tip, b: [tip[0] + Math.cos(leafAngle) * leafLength, tip[1] + leafLength * 0.5, tip[2] + Math.sin(leafAngle) * leafLength], detail: true })
    }
  }
  return segments
}
