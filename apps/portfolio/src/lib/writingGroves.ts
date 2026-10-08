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
  grove: string
  x: number
  z: number
  height: number
}

export interface PlantSegment {
  a: [number, number, number]
  b: [number, number, number]
  detail: boolean
  leaf?: boolean
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

// A single planted clearing combines writing foliage and illuminated flowers.
export function layoutWritingGroves(nodes: WritingNode[], compact: boolean, spread = 1): GroveTree[] {
  return [...nodes].sort((a, b) => a.id.localeCompare(b.id)).map((node, index) => {
    const random = mulberry32(hashString(node.id))
    const radius = Math.sqrt((index + 1) / nodes.length)
    const angle = index * 2.3999632297
    let x = (compact ? -4.2 * spread : -6) + Math.cos(angle) * radius * (compact ? 5 * spread : 12)
    const z = -25 + Math.sin(angle) * radius * 18
    if (compact && Math.abs(z + 28) < 8) x = Math.min(x, 4.6 * spread - 11)
    const height = ({ seedling: 0.65, budding: 1.4, evergreen: 2.2 })[node.stage] * (0.65 + random() * 0.7)
    return { ...node, grove: 'writing', x, z, height }
  })
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
  const branches = Math.min(3, node.stage === 'seedling' ? 1 : 2 + Math.round(Math.sqrt(node.linkCount) / 3))
  for (let i = 0; i < branches; i++) {
    const base = trunk(0.35 + random() * 0.55)
    const angle = random() * Math.PI * 2
    const length = node.height * (0.2 + random() * 0.18)
    const tip: [number, number, number] = [base[0] + Math.cos(angle) * length, base[1] + length * (node.stage === 'evergreen' ? 0.55 : 0.3), base[2] + Math.sin(angle) * length]
    segments.push({ a: base, b: tip, detail: true })
    if (node.stage === 'evergreen') {
      // One fine leaf per branch leaves the buds and stems visible.
      const leafAngle = angle - 0.9 + (random() - 0.5) * 0.3
      const leafLength = node.height * (0.1 + random() * 0.08)
      segments.push({ a: tip, b: [tip[0] + Math.cos(leafAngle) * leafLength, tip[1] + leafLength * 0.6, tip[2] + Math.sin(leafAngle) * leafLength], detail: true, leaf: true })
    }
  }
  return segments
}
