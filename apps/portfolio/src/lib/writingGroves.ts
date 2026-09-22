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

// Clearings follow the existing landscape, with open ground between them.
// The remaining topics share a rear woodland; their individual tags stay intact.
const WRITING_GROVES = [
  { topic: 'articles', angle: 0.11, z: -32, compactZ: -23, side: 1 },
  { topic: 'books', angle: 0.10, z: -92, compactZ: -90, side: 1 },
  { topic: 'health', angle: -0.66, z: -68, compactZ: -35, side: -1 },
  { topic: 'career', angle: -0.66, z: -28, compactZ: -55, side: -1 },
  { topic: 'learning', angle: -0.66, z: -118, compactZ: -112, side: 1 },
  { topic: 'product', angle: 0.67, z: -40, compactZ: -50, side: 1 },
  { topic: 'gardening', angle: 0.67, z: -100, compactZ: -45, side: -1 },
  { topic: '', angle: 0.08, z: -115, compactZ: -115, side: 1 },
] as const

export function layoutWritingGroves(nodes: WritingNode[], compact: boolean, spread = 1): GroveTree[] {
  const landmarks = compact
    ? [[-4.2 * spread, -13, 6, 5], [3.2 * spread, -35, 11, 8], [-14 * spread, -85, 14, 14]]
    : [[-6, -16, 5, 5], [27, -46, 11, 8], [-52, -100, 14, 14]]
  const groups = WRITING_GROVES.map(() => [] as WritingNode[])
  for (const node of nodes) {
    const index = WRITING_GROVES.findIndex((grove) => node.tags.includes(grove.topic))
    groups[index < 0 ? groups.length - 1 : index].push(node)
  }
  return groups.flatMap((members, groupIndex) => {
    const grove = WRITING_GROVES[groupIndex]
    return members.sort((a, b) => a.id.localeCompare(b.id)).map((node, index) => {
      const random = mulberry32(hashString(node.id))
      // A golden-angle spiral gives each tree room without visible planting rows.
      // A small central clearing makes a grove read as a place, not a thicket.
      const centerZ = compact ? grove.compactZ : grove.z
      const depth = Math.min(4 + Math.sqrt(members.length) * 2.2, 138 + centerZ, -8 - centerZ)
      const radius = depth * Math.sqrt((index + 1) / members.length)
      const angle = index * 2.3999632297 + groupIndex
      const z = centerZ + Math.sin(angle) * radius
      // Keep the compact forest at the landscape edges, on the visible side
      // of the horizon. Central desktop groves have room for distinct crowns.
      const lane = compact ? grove.side * 0.24 * spread : grove.angle
      const width = compact ? 0.085 * spread : Math.abs(grove.angle) < 0.2 ? 0.13 : 0.09
      // Leave a winding aisle through each grove. The two loose banks read
      // as a landscape at a distance while keeping individual crowns apart.
      const bank = Math.cos(angle)
      const offset = Math.sign(bank) * (0.25 + Math.abs(bank) * 0.75)
      let x = ((compact ? 26 : 22) - z) * (lane + offset * width * Math.sqrt((index + 1) / members.length))
      const height = ({ seedling: 0.65, budding: 1.5, evergreen: 2.7 })[node.stage] * (0.8 + random() * 0.4)
      for (const [lx, lz, halfWidth, halfDepth] of landmarks) {
        if (Math.abs(z - lz) < halfDepth + 2 && Math.abs(x - lx) < halfWidth + height * 0.4) {
          x = lx + Math.sign(x - lx || 1) * (halfWidth + height * 0.4 + 1)
        }
      }
      return {
        ...node,
        grove: grove.topic,
        x,
        z,
        height,
      }
    })
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
      segments.push({ a: tip, b: [tip[0] + Math.cos(leafAngle) * leafLength, tip[1] + leafLength * 0.5, tip[2] + Math.sin(leafAngle) * leafLength], detail: true, leaf: true })
    }
  }
  return segments
}
