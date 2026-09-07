export interface WorldNode {
  id: string
  title: string
  stage: string
  tags: string[]
  linkCount: number
  description?: string
  created?: number
  modified?: number
}

export interface WorldEdge {
  source: string
  target: string
}

// Growth = altitude. Seedlings hover near the soil, evergreens grow tall.
const stageHeight: Record<string, number> = {
  seedling: 36,
  budding: 100,
  evergreen: 175,
}

export interface SimNode extends WorldNode {
  x: number
  y: number
  z: number
  // projected screen state, refreshed every frame
  sx: number
  sy: number
  depth: number
  r: number
  phase: number
  // current wind displacement, refreshed every frame
  wx: number
  wz: number
  // deep time: when this note was born (ms), staggered within its commit day
  birth: number
  lastTouched: number
  // current growth 0..1 at the viewed moment, refreshed every frame
  g: number
}

export interface Grove {
  tag: string
  x: number
  z: number
  y: number
  count: number
}

/** One line of a procedural plant, with height fractions for wind sway. */
export interface PlantSeg {
  ax: number; ay: number; az: number
  bx: number; by: number; bz: number
  fa: number; fb: number
  detail: boolean
}

/** Deterministic PRNG so the world is identical on every visit. */
export function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function hashString(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/**
 * Lay the garden out in 3D: springs along wikilinks, pair repulsion,
 * gentle pull toward the dominant-tag grove, and a per-stage altitude
 * anchor. Runs once, synchronously — the world itself is still.
 */
export function layoutWorld(nodes: WorldNode[], edges: WorldEdge[]): {
  sim: SimNode[]
  groves: Grove[]
  plants: PlantSeg[][]
  undergrowth: PlantSeg[]
} {
  const rand = mulberry32(1859)

  // Groves: tags with enough members earn a named region on a spiral
  const tagCounts = new Map<string, number>()
  for (const n of nodes) {
    if (n.tags[0]) tagCounts.set(n.tags[0], (tagCounts.get(n.tags[0]) || 0) + 1)
  }
  const groveTags = [...tagCounts.entries()]
    .filter(([, c]) => c >= 3)
    .sort((a, b) => b[1] - a[1])
    .map(([t]) => t)

  const groveCenter = new Map<string, { x: number; z: number }>()
  const GOLDEN = Math.PI * (3 - Math.sqrt(5))
  groveTags.forEach((tag, i) => {
    const angle = i * GOLDEN
    const radius = 230 + 90 * Math.sqrt(i)
    groveCenter.set(tag, { x: Math.cos(angle) * radius, z: Math.sin(angle) * radius })
  })

  // Deep time: notes imported in the same commit share a timestamp, so
  // births are staggered deterministically across ~36h — honest at day
  // resolution, and a bulk import replays as a cascading bloom.
  const knownCreated = nodes.map((n) => n.created).filter((c): c is number => !!c)
  const genesis = knownCreated.length > 0 ? Math.min(...knownCreated) : Date.now()

  const sim: SimNode[] = nodes.map((n) => {
    const r = mulberry32(hashString(n.id))
    const grove = n.tags[0] ? groveCenter.get(n.tags[0]) : undefined
    const baseX = grove ? grove.x : 0
    const baseZ = grove ? grove.z : 0
    const targetY = stageHeight[n.stage] ?? 100
    const birth = (n.created ?? genesis) + hashString(n.id + '~t') % (36 * 3600 * 1000)
    return {
      ...n,
      x: baseX + (r() - 0.5) * 340,
      z: baseZ + (r() - 0.5) * 340,
      y: targetY + (r() - 0.5) * 50,
      sx: 0,
      sy: 0,
      depth: 0,
      r: 0,
      phase: r() * Math.PI * 2,
      wx: 0,
      wz: 0,
      birth,
      lastTouched: n.modified ?? birth,
      g: 1,
    }
  })

  const index = new Map<string, number>()
  sim.forEach((n, i) => index.set(n.id, i))
  const springPairs: Array<[number, number]> = []
  for (const e of edges) {
    const a = index.get(e.source)
    const b = index.get(e.target)
    if (a !== undefined && b !== undefined) springPairs.push([a, b])
  }

  const vx = new Float64Array(sim.length)
  const vy = new Float64Array(sim.length)
  const vz = new Float64Array(sim.length)

  const TICKS = 220
  for (let t = 0; t < TICKS; t++) {
    // pair repulsion (softened, capped)
    for (let i = 0; i < sim.length; i++) {
      for (let j = i + 1; j < sim.length; j++) {
        const dx = sim[i].x - sim[j].x
        const dy = sim[i].y - sim[j].y
        const dz = sim[i].z - sim[j].z
        const d2 = dx * dx + dy * dy + dz * dz + 40
        if (d2 > 90000) continue
        const f = Math.min(2600 / d2, 4)
        const d = Math.sqrt(d2)
        const fx = (dx / d) * f
        const fy = (dy / d) * f
        const fz = (dz / d) * f
        vx[i] += fx; vy[i] += fy; vz[i] += fz
        vx[j] -= fx; vy[j] -= fy; vz[j] -= fz
      }
    }
    // springs along links
    for (const [a, b] of springPairs) {
      const dx = sim[b].x - sim[a].x
      const dy = sim[b].y - sim[a].y
      const dz = sim[b].z - sim[a].z
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1
      const f = (d - 130) * 0.015
      vx[a] += (dx / d) * f; vy[a] += (dy / d) * f; vz[a] += (dz / d) * f
      vx[b] -= (dx / d) * f; vy[b] -= (dy / d) * f; vz[b] -= (dz / d) * f
    }
    for (let i = 0; i < sim.length; i++) {
      const n = sim[i]
      // grove gravity (x/z only) + centre pull for the untagged
      const grove = n.tags[0] ? groveCenter.get(n.tags[0]) : undefined
      const gx = grove ? grove.x : 0
      const gz = grove ? grove.z : 0
      vx[i] += (gx - n.x) * (grove ? 0.012 : 0.004)
      vz[i] += (gz - n.z) * (grove ? 0.012 : 0.004)
      // altitude anchor: growth stage sets the canopy layer
      vy[i] += ((stageHeight[n.stage] ?? 100) - n.y) * 0.06
      vx[i] *= 0.82; vy[i] *= 0.82; vz[i] *= 0.82
      n.x += vx[i]; n.y += vy[i]; n.z += vz[i]
      if (n.y < 14) n.y = 14
    }
    // small jitter early on to break symmetry
    if (t < 30) {
      for (let i = 0; i < sim.length; i++) {
        sim[i].x += (rand() - 0.5) * 2
        sim[i].z += (rand() - 0.5) * 2
      }
    }
  }

  const groves: Grove[] = groveTags.map((tag) => {
    const members = sim.filter((n) => n.tags[0] === tag)
    const x = members.reduce((s, n) => s + n.x, 0) / members.length
    const z = members.reduce((s, n) => s + n.z, 0) / members.length
    return { tag, x, z, y: 8, count: members.length }
  })

  // ── generative flora ─────────────────────────────────────────────
  // Every note grows a plant whose form IS its data: trunk height from
  // growth stage, branch count from link count, shape seeded by slug —
  // the same note always grows the same plant.
  const plants: PlantSeg[][] = sim.map((n) => {
    const r = mulberry32(hashString(n.id) ^ 0x9e3779b9)
    const segs: PlantSeg[] = []
    const H = n.y

    // trunk: a gently bowed polyline from soil to the note's light
    const bowAz = r() * Math.PI * 2
    const bow = H * (0.03 + r() * 0.05)
    const STEPS = 3
    const trunkPt = (f: number) => {
      const lateral = Math.sin(Math.PI * f) * bow
      return {
        x: n.x + Math.cos(bowAz) * lateral,
        y: H * f,
        z: n.z + Math.sin(bowAz) * lateral,
      }
    }
    for (let i = 0; i < STEPS; i++) {
      const a = trunkPt(i / STEPS)
      const b = trunkPt((i + 1) / STEPS)
      segs.push({ ax: a.x, ay: a.y, az: a.z, bx: b.x, by: b.y, bz: b.z, fa: i / STEPS, fb: (i + 1) / STEPS, detail: false })
    }

    // branches: one per handful of links, reaching outward and up
    const nBranches = Math.min(6, n.stage === 'seedling' ? 1 + Math.round(r()) : 2 + Math.round(Math.sqrt(n.linkCount)))
    for (let bIdx = 0; bIdx < nBranches; bIdx++) {
      const f = 0.35 + r() * 0.55
      const base = trunkPt(f)
      const az = r() * Math.PI * 2
      const len = H * (0.12 + r() * 0.16)
      const lift = n.stage === 'evergreen' ? 0.55 : 0.3
      const tip = {
        x: base.x + Math.cos(az) * len,
        y: base.y + len * lift,
        z: base.z + Math.sin(az) * len,
      }
      segs.push({ ax: base.x, ay: base.y, az: base.z, bx: tip.x, by: tip.y, bz: tip.z, fa: f, fb: f + 0.1, detail: true })
      // evergreens carry a small leaf tick at each branch tip
      if (n.stage === 'evergreen') {
        const la = az + Math.PI / 2 + (r() - 0.5)
        const ll = 4 + r() * 6
        segs.push({
          ax: tip.x, ay: tip.y, az: tip.z,
          bx: tip.x + Math.cos(la) * ll, by: tip.y + ll * 0.5, bz: tip.z + Math.sin(la) * ll,
          fa: f + 0.1, fb: f + 0.12, detail: true,
        })
      }
    }
    return segs
  })

  // sparse undergrowth around each grove, denser where more notes grow
  const undergrowth: PlantSeg[] = []
  const gRand = mulberry32(20260718)
  for (const g of groves) {
    // Denser than it was: this is the forest floor, and in the 3D world
    // it is the difference between trees standing on bare ground and a
    // wood you could walk into.
    const tufts = Math.min(110, g.count * 8)
    for (let i = 0; i < tufts; i++) {
      const az = gRand() * Math.PI * 2
      const rad = 12 + gRand() * (110 + g.count * 8)
      const x = g.x + Math.cos(az) * rad
      const z = g.z + Math.sin(az) * rad
      const lean = gRand() * Math.PI * 2
      const hgt = 3 + gRand() * 11
      undergrowth.push({
        ax: x, ay: 0, az: z,
        bx: x + Math.cos(lean) * hgt * 0.5, by: hgt, bz: z + Math.sin(lean) * hgt * 0.5,
        fa: 0, fb: 1, detail: false,
      })
    }
  }

  return { sim, groves, plants, undergrowth }
}
