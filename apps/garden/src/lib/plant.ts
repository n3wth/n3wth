// Every note's plant, in 2D: the same generative grammar the 3D world
// uses (form seeded by slug, height from growth stage, branches from
// link count) rendered as SVG paths. The glyph is the note's identity
// mark across the site — index rows, note headers, anywhere a note is
// spoken of.

export interface PlantGlyph {
  /** SVG path `d` strings, trunk first, then branches and leaf ticks. */
  paths: string[]
  /** The light at the top of the trunk. */
  tip: { x: number; y: number; r: number }
  color: string
}

export const stageColor: Record<string, string> = {
  seedling: '#62666d',
  budding: '#9aa0a8',
  evergreen: '#f2f3f5',
}

const stageHeight: Record<string, number> = {
  seedling: 10,
  budding: 19,
  evergreen: 27,
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

function hashString(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** ViewBox is 0 0 24 32, ground at y=31. */
export function plantGlyph(slug: string, stage: string, linkCount: number): PlantGlyph {
  const rand = mulberry32(hashString(slug) ^ 0x9e3779b9)
  const H = stageHeight[stage] ?? 16
  const baseX = 12
  const baseY = 31
  const bow = (rand() - 0.5) * 4
  const topX = baseX + bow * 0.6
  const topY = baseY - H

  const f2 = (n: number) => Math.round(n * 100) / 100
  const paths: string[] = []

  // trunk: a gently bowed quadratic from soil to light
  paths.push(`M ${baseX} ${baseY} Q ${f2(baseX + bow)} ${f2(baseY - H * 0.55)} ${f2(topX)} ${f2(topY)}`)

  const trunkAt = (f: number) => {
    // point on the quadratic at parameter f
    const t = f
    const mx = baseX + bow
    const my = baseY - H * 0.55
    const x = (1 - t) * (1 - t) * baseX + 2 * (1 - t) * t * mx + t * t * topX
    const y = (1 - t) * (1 - t) * baseY + 2 * (1 - t) * t * my + t * t * topY
    return { x, y }
  }

  const nBranches = Math.min(5, stage === 'seedling' ? 1 + Math.round(rand()) : 1 + Math.round(Math.sqrt(Math.max(0, linkCount))))
  for (let i = 0; i < nBranches; i++) {
    const f = 0.35 + rand() * 0.5
    const p = trunkAt(f)
    const dir = i % 2 === 0 ? 1 : -1
    const len = H * (0.22 + rand() * 0.2)
    const lift = stage === 'evergreen' ? 0.7 : 0.4
    const ex = p.x + dir * len
    const ey = p.y - len * lift
    paths.push(`M ${f2(p.x)} ${f2(p.y)} L ${f2(ex)} ${f2(ey)}`)
    if (stage === 'evergreen') {
      paths.push(`M ${f2(ex)} ${f2(ey)} L ${f2(ex + dir * 1.6)} ${f2(ey - 2)}`)
    }
  }

  const r = Math.min(3, 1.4 + Math.sqrt(Math.max(0, linkCount)) * 0.35)
  return { paths, tip: { x: f2(topX), y: f2(topY), r: f2(r) }, color: stageColor[stage] ?? '#9aa0a8' }
}
