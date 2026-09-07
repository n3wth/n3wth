'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getVisited } from '@/lib/visited'
import { FocusedNotePanel } from '@/components/FocusedNotePanel'
import { stageColor } from '@/lib/plant'
import {
  type WorldNode,
  type WorldEdge,
  type SimNode,
  type Grove,
  type PlantSeg,
  mulberry32,
  hashString,
  layoutWorld,
} from '@/lib/worldLayout'

interface WorldGardenProps {
  nodes: WorldNode[]
  edges: WorldEdge[]
  /** Fly the camera in from high above on first render. */
  intro?: boolean
}

const BG = '#08090b'

export function WorldGarden({ nodes, edges, intro = true }: WorldGardenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoverId, setHoverId] = useState<string | null>(null)
  const selectedRef = useRef<string | null>(null)
  const hoverRef = useRef<string | null>(null)
  selectedRef.current = selectedId
  hoverRef.current = hoverId

  // Deep time: T in [0,1] maps genesis → today. 1 = the living present.
  const timeRef = useRef({ T: 1, playing: false })
  const [timeUi, setTimeUi] = useState({ T: 1, playing: false, label: 'Today' })

  // The explored trail: notes this reader has already opened
  const visitedRef = useRef<Set<string>>(new Set())
  const [exploredCount, setExploredCount] = useState<number | null>(null)

  // Screen rects of DOM overlays that canvas labels must not draw through
  const exclusionsRef = useRef<Array<{ x1: number; y1: number; x2: number; y2: number }> | null>(null)

  const world = useMemo(() => layoutWorld(nodes, edges), [nodes, edges])

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

  const nodeById = useMemo(() => {
    const m = new Map<string, WorldNode>()
    for (const n of nodes) m.set(n.id, n)
    return m
  }, [nodes])

  // Camera state lives in refs — mutated by the render loop, never re-renders React
  const cam = useRef({
    yaw: 0.6,
    pitch: 0.42,
    dist: 950,
    tx: 0, ty: 90, tz: 0,
    // targets for smooth damping
    tYaw: 0.6, tPitch: 0.42, tDist: 950,
    ttx: 0, tty: 90, ttz: 0,
    drifting: true,
  })

  const flyTo = useCallback((id: string) => {
    const n = world.sim.find((s) => s.id === id)
    if (!n) return
    const c = cam.current
    c.ttx = n.x; c.tty = n.y; c.ttz = n.z
    c.tDist = 300
    c.tPitch = 0.22
    c.drifting = false
    setSelectedId(id)
  }, [world])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) cam.current.drifting = false

    // Explored trail: mark visited notes and count progress
    const visited = getVisited()
    visitedRef.current = new Set(Object.keys(visited))
    setExploredCount(world.sim.filter((n) => visitedRef.current.has(n.id)).length)

    // Deep links: /?note=<slug> arrives standing at that note, and
    // /?grove=<tag> arrives standing in that tag's grove — this is how
    // note and grove pages hand the reader back to the garden.
    const urlParams = new URLSearchParams(window.location.search)
    const focusParam = urlParams.get('note')
    const groveParam = urlParams.get('grove')
    const focusNode = focusParam !== null ? world.sim.find((n) => n.id === focusParam) : undefined
    const focusGrove = !focusNode && groveParam !== null
      ? world.groves.find((g) => g.tag === groveParam)
      : undefined
    if (focusGrove) {
      const c = cam.current
      c.ttx = focusGrove.x; c.tty = 80; c.ttz = focusGrove.z
      c.tx = focusGrove.x; c.ty = 80; c.tz = focusGrove.z
      c.tDist = 700
      c.tPitch = 0.38
      c.pitch = 0.38
      c.dist = reduceMotion ? 700 : 1200
      c.drifting = false
    } else if (focusNode) {
      const c = cam.current
      c.ttx = focusNode.x; c.tty = focusNode.y; c.ttz = focusNode.z
      c.tx = focusNode.x; c.ty = focusNode.y; c.tz = focusNode.z
      c.tDist = 300
      c.tPitch = 0.22
      c.pitch = 0.22
      c.dist = reduceMotion ? 300 : 620 // short glide in, not the full fly-in
      c.drifting = false
      setSelectedId(focusNode.id)
    } else if (intro && !reduceMotion) {
      // Cinematic fly-in: start high above the canopy and descend to the
      // default view. Targets already hold the resting camera.
      const c = cam.current
      c.dist = 2600
      c.pitch = 1.15
      c.yaw = c.tYaw - 0.7
      c.ty = 320
    }

    let w = 0
    let h = 0
    let dpr = 1
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = container.clientWidth
      h = container.clientHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)

    const { sim, groves, plants, undergrowth } = world

    // Distant star dome: fixed directions, rotation-only projection
    const starRand = mulberry32(431)
    const stars = Array.from({ length: 150 }, () => {
      const az = starRand() * Math.PI * 2
      const el = 0.05 + starRand() * 1.3
      return {
        dx: Math.cos(el) * Math.cos(az),
        dy: Math.sin(el),
        dz: Math.cos(el) * Math.sin(az),
        mag: 0.25 + starRand() * 0.55,
        phase: starRand() * Math.PI * 2,
      }
    })

    // Wind: young ideas bend, mature ones hold steady
    const windAmp: Record<string, number> = { seedling: 3.4, budding: 2.2, evergreen: 1.1 }

    // ── deep time constants ────────────────────────────────────────
    const NOW = Date.now()
    const GENESIS = Math.min(...sim.map((n) => n.birth))
    const SPAN = Math.max(1, NOW - GENESIS)
    const GROW_MS = 21 * 24 * 3600 * 1000 // a note takes ~3 weeks to reach full height
    const FRESH_MS = 45 * 24 * 3600 * 1000
    const DORMANT_MS = 200 * 24 * 3600 * 1000
    const REPLAY_SECONDS = 28
    const idx = new Map<string, SimNode>()
    for (const n of sim) idx.set(n.id, n)
    const edgeBorn = edges.map((e) => {
      const a = idx.get(e.source)
      const b = idx.get(e.target)
      return a && b ? Math.max(a.birth, b.birth) : Infinity
    })
    const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' })
    const groveBirths = groves.map((g) =>
      sim.filter((n) => n.tags[0] === g.tag).map((n) => n.birth).sort((a, b) => a - b)
    )

    // Weather grows from writing activity: a tended garden gets shooting
    // stars, a resting one gets ground mist.
    const touchedRecently = sim.filter((n) => NOW - n.lastTouched < 21 * 24 * 3600 * 1000).length
    const activeSky = touchedRecently >= 8
    let nextShot = 6 + Math.random() * 8
    let shot: { x: number; y: number; dx: number; dy: number; born: number } | null = null
    let lastUiSync = 0

    const NEAR = 40
    const FOG_FAR = 2400

    // view transform state, rebuilt each frame
    let cosY = 1, sinY = 0, cosP = 1, sinP = 0
    let focal = 1

    const view = (x: number, y: number, z: number) => {
      const c = cam.current
      const px = x - c.tx
      const py = y - c.ty
      const pz = z - c.tz
      const x1 = px * cosY - pz * sinY
      const z1 = px * sinY + pz * cosY
      const y2 = py * cosP - z1 * sinP
      const z2 = py * sinP + z1 * cosP
      return { x: x1, y: y2, depth: c.dist - z2 }
    }

    const toScreen = (v: { x: number; y: number; depth: number }) => ({
      x: w / 2 + (focal * v.x) / v.depth,
      y: h / 2 - (focal * v.y) / v.depth,
    })

    const fog = (depth: number) => Math.max(0, Math.min(1, 1 - depth / FOG_FAR))

    /** Draw a world-space segment with near-plane clipping and depth fade. */
    const segment = (
      ax: number, ay: number, az: number,
      bx: number, by: number, bz: number,
      color: string, alpha: number, width: number
    ) => {
      let va = view(ax, ay, az)
      let vb = view(bx, by, bz)
      if (va.depth < NEAR && vb.depth < NEAR) return
      if (va.depth < NEAR || vb.depth < NEAR) {
        const t = (NEAR - va.depth) / (vb.depth - va.depth)
        const clip = {
          x: va.x + (vb.x - va.x) * t,
          y: va.y + (vb.y - va.y) * t,
          depth: NEAR + 0.01,
        }
        if (va.depth < NEAR) va = clip
        else vb = clip
      }
      const a = toScreen(va)
      const b = toScreen(vb)
      const fade = fog((va.depth + vb.depth) / 2)
      if (fade <= 0.01 || alpha * fade <= 0.005) return
      ctx.strokeStyle = color
      ctx.globalAlpha = alpha * fade
      ctx.lineWidth = width
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      ctx.stroke()
    }

    let raf = 0
    let start = performance.now()
    let running = true
    let lastFocusId: string | null = null
    let focusStart = -10

    let frameCount = 0
    const frame = (now: number) => {
      if (!running) return
      frameCount++
      const t = (now - start) / 1000
      const c = cam.current

      // ── deep time: advance replay, resolve the viewed moment ─────
      const tr = timeRef.current
      if (tr.playing) {
        tr.T = Math.min(1, tr.T + 1 / 60 / REPLAY_SECONDS)
        if (tr.T >= 1) tr.playing = false
      }
      const Tms = GENESIS + tr.T * SPAN
      const atPresent = tr.T >= 0.999
      if (t - lastUiSync > 0.2) {
        lastUiSync = t
        const label = atPresent ? 'Today' : dateFmt.format(Tms)
        setTimeUi((u) => (u.T === tr.T && u.playing === tr.playing && u.label === label ? u : { T: tr.T, playing: tr.playing, label }))
      }

      if (c.drifting) c.tYaw += 0.0006

      // critically-damped-ish easing toward targets
      const ease = reduceMotion ? 1 : 0.07
      c.yaw += (c.tYaw - c.yaw) * ease
      c.pitch += (c.tPitch - c.pitch) * ease
      c.dist += (c.tDist - c.dist) * ease
      c.tx += (c.ttx - c.tx) * ease
      c.ty += (c.tty - c.ty) * ease
      c.tz += (c.ttz - c.tz) * ease

      cosY = Math.cos(c.yaw); sinY = Math.sin(c.yaw)
      cosP = Math.cos(c.pitch); sinP = Math.sin(c.pitch)
      focal = h * 1.05

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = BG
      ctx.fillRect(0, 0, w, h)

      // ── star dome (rotation only, pinned to the horizon) ─────────
      ctx.fillStyle = '#f2f3f5'
      for (const s of stars) {
        const x1 = s.dx * cosY - s.dz * sinY
        const z1 = s.dx * sinY + s.dz * cosY
        const y2 = s.dy * cosP - z1 * sinP
        const z2 = s.dy * sinP + z1 * cosP
        if (z2 > -0.05) continue // behind or too close to the camera plane
        const depth = -z2
        const px = w / 2 + (focal * x1) / depth
        const py = h / 2 - (focal * y2) / depth
        if (px < 0 || px > w || py < 0 || py > h) continue
        const twinkle = reduceMotion ? 0.8 : 0.65 + 0.35 * Math.sin(t * 0.6 + s.phase)
        ctx.globalAlpha = s.mag * 0.35 * twinkle
        ctx.beginPath()
        ctx.arc(px, py, s.mag, 0, Math.PI * 2)
        ctx.fill()
      }

      // ── ground grid ──────────────────────────────────────────────
      const STEP = 120
      const EXTENT = 1560
      for (let k = -EXTENT; k <= EXTENT; k += STEP) {
        // chunk long lines so fog reads smoothly along them
        for (let s = -EXTENT; s < EXTENT; s += EXTENT / 2) {
          const e = s + EXTENT / 2
          segment(k, 0, s, k, 0, e, '#f2f3f5', 0.05, 1)
          segment(s, 0, k, e, 0, k, '#f2f3f5', 0.05, 1)
        }
      }

      // ── grove labels on the soil (named once three notes grow) ───
      ctx.textAlign = 'center'
      for (let gi = 0; gi < groves.length; gi++) {
        const g = groves[gi]
        let bornCount = 0
        for (const bt of groveBirths[gi]) { if (bt <= Tms) bornCount++; else break }
        if (bornCount < 3) continue
        const v = view(g.x, 4, g.z)
        if (v.depth < NEAR) continue
        const p = toScreen(v)
        const a = fog(v.depth) * 0.55 * Math.min(1, (bornCount - 2) / 3)
        if (a < 0.03) continue
        ctx.globalAlpha = a
        ctx.fillStyle = '#9aa0a8'
        const size = Math.max(9, Math.min(13, (focal * 14) / v.depth))
        ctx.font = `500 ${size}px var(--font-family-mono, ui-monospace, monospace)`
        try { (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '3px' } catch { /* older browsers */ }
        ctx.fillText(g.tag, p.x, p.y)
        try { (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px' } catch { /* older browsers */ }
      }

      // ── project nodes: each light rides the top of its swaying stem
      const sway = reduceMotion ? 0 : 1
      for (const n of sim) {
        // growth at the viewed moment: unborn → 0, sprouting → partial.
        // Notes written days ago really are still small today.
        const age = Tms - n.birth
        n.g = age <= 0 ? 0 : Math.min(1, 0.12 + (age / GROW_MS) * 0.88)
        if (n.g <= 0) { n.r = 0; continue }
        const dormant = Tms - n.lastTouched > DORMANT_MS
        const amp = (windAmp[n.stage] ?? 2) * sway * (dormant ? 0.5 : 1)
        n.wx = Math.sin(t * 0.5 + n.phase) * amp
        n.wz = Math.cos(t * 0.38 + n.phase * 1.7) * amp * 0.6
        const v = view(n.x + n.wx, n.y * n.g, n.z + n.wz)
        n.depth = v.depth
        if (v.depth < NEAR) { n.r = 0; continue }
        const p = toScreen(v)
        n.sx = p.x
        n.sy = p.y
        const base = 2.2 + Math.sqrt(n.linkCount) * 1.6
        n.r = Math.min(13, Math.max(1, (focal * base * (0.4 + 0.6 * n.g)) / v.depth))
      }

      // note ids can be '' (the home note), so compare against null explicitly
      const sel = selectedRef.current
      const hov = hoverRef.current
      const focusId = hov !== null ? hov : sel
      const focusSet = focusId !== null ? neighbors.get(focusId) : undefined

      // focus-change clock drives the connection draw-out animation
      if (focusId !== lastFocusId) {
        lastFocusId = focusId
        focusStart = t
      }

      // ── generative flora: every note's plant, grown from its data ─
      for (const g of undergrowth) {
        segment(g.ax, g.ay, g.az, g.bx, g.by, g.bz, '#9aa0a8', 0.08, 1)
      }
      for (let i = 0; i < sim.length; i++) {
        const n = sim[i]
        if (n.g <= 0 || n.depth < NEAR || n.depth > FOG_FAR) continue
        const isFocusNode = n.id === focusId
        const isNeighbor = focusSet ? focusSet.has(n.id) : false
        const dim = focusId !== null && !isFocusNode && !isNeighbor
        const alpha = isFocusNode ? 0.35 : dim ? 0.02 : 0.11
        const far = n.depth > 1300 // LOD: distant plants keep only their trunk
        const g = n.g
        for (const s of plants[i]) {
          if (far && s.detail) continue
          if (s.detail && g < 0.5) continue // branches emerge after the trunk
          segment(
            n.x + (s.ax - n.x) * g + n.wx * s.fa, s.ay * g, n.z + (s.az - n.z) * g + n.wz * s.fa,
            n.x + (s.bx - n.x) * g + n.wx * s.fb, s.by * g, n.z + (s.bz - n.z) * g + n.wz * s.fb,
            '#f2f3f5', s.detail ? alpha * 0.8 : alpha, 1
          )
        }
      }

      // ── edges: on focus, connections draw outward from the note ──
      const drawK = reduceMotion ? 1 : Math.min(1, (t - focusStart) / 0.55)
      const drawEase = drawK * drawK * (3 - 2 * drawK) // smoothstep
      for (let ei = 0; ei < edges.length; ei++) {
        const e = edges[ei]
        const a = idx.get(e.source)
        const b = idx.get(e.target)
        if (!a || !b) continue
        // a link exists only once both notes do; it fades in over its first week
        const linkAge = Tms - edgeBorn[ei]
        if (linkAge <= 0 || a.g <= 0 || b.g <= 0) continue
        const linkK = Math.min(1, linkAge / (7 * 24 * 3600 * 1000))
        const isFocus = focusId !== null && (e.source === focusId || e.target === focusId)
        const ay = a.y * a.g
        const by = b.y * b.g
        if (isFocus && drawEase < 1) {
          // grow the line from the focused note toward its neighbor
          const from = e.source === focusId ? a : b
          const to = e.source === focusId ? b : a
          const fy = from.y * from.g
          const ty = to.y * to.g
          segment(
            from.x + from.wx, fy, from.z + from.wz,
            from.x + from.wx + (to.x + to.wx - from.x - from.wx) * drawEase,
            fy + (ty - fy) * drawEase,
            from.z + from.wz + (to.z + to.wz - from.z - from.wz) * drawEase,
            '#f2f3f5', 0.5 * linkK, 1.2
          )
          continue
        }
        segment(
          a.x + a.wx, ay, a.z + a.wz, b.x + b.wx, by, b.z + b.wz,
          isFocus ? '#f2f3f5' : '#9aa0a8',
          (isFocus ? 0.5 : focusId !== null ? 0.03 : 0.07) * linkK,
          isFocus ? 1.2 : 1
        )
      }

      // ── nodes, far to near ───────────────────────────────────────
      const drawOrder = [...sim].sort((a, b) => b.depth - a.depth)
      for (const n of drawOrder) {
        if (n.r === 0) continue
        const isSel = n.id === sel
        const isHov = n.id === hov
        const isNeighbor = focusSet ? focusSet.has(n.id) : false
        const dimmed = focusId && !isSel && !isHov && !isNeighbor
        const f = fog(n.depth)
        if (f < 0.02) continue

        // glow halo for the focused note
        if (isSel || isHov) {
          const glow = ctx.createRadialGradient(n.sx, n.sy, 0, n.sx, n.sy, n.r * 5)
          glow.addColorStop(0, 'rgba(242,243,245,0.28)')
          glow.addColorStop(1, 'rgba(242,243,245,0)')
          ctx.globalAlpha = 1
          ctx.fillStyle = glow
          ctx.beginPath()
          ctx.arc(n.sx, n.sy, n.r * 5, 0, Math.PI * 2)
          ctx.fill()
        }

        // untended notes dim toward dormancy; the light stays, quieter
        const dormant = Tms - n.lastTouched > DORMANT_MS
        ctx.globalAlpha = f * (dimmed ? 0.18 : dormant ? 0.55 : 0.95)
        ctx.fillStyle = isSel || isHov ? '#ffffff' : stageColor[n.stage] || '#9aa0a8'
        ctx.beginPath()
        ctx.arc(n.sx, n.sy, n.r, 0, Math.PI * 2)
        ctx.fill()

        // dew glint on recently tended notes (only in the present)
        if (atPresent && !dimmed) {
          const fresh = 1 - (NOW - n.lastTouched) / FRESH_MS
          if (fresh > 0) {
            const tw = 0.6 + 0.4 * Math.sin(t * 1.4 + n.phase * 5)
            const len = n.r * 2.2
            ctx.globalAlpha = f * fresh * 0.7 * tw
            ctx.strokeStyle = '#ffffff'
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(n.sx - len, n.sy); ctx.lineTo(n.sx + len, n.sy)
            ctx.moveTo(n.sx, n.sy - len); ctx.lineTo(n.sx, n.sy + len)
            ctx.stroke()
          }
        }

        // a quiet ring marks notes the reader has already walked to
        if (!isSel && visitedRef.current.has(n.id)) {
          ctx.globalAlpha = f * (dimmed ? 0.08 : 0.28)
          ctx.strokeStyle = '#9aa0a8'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(n.sx, n.sy, n.r + 2.5, 0, Math.PI * 2)
          ctx.stroke()
        }

        if (isSel) {
          ctx.globalAlpha = 0.5
          ctx.strokeStyle = '#f2f3f5'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(n.sx, n.sy, n.r + 5 + Math.sin(t * 2) * 1.2 * sway, 0, Math.PI * 2)
          ctx.stroke()
        }
      }

      // ── labels: prioritized, with greedy collision avoidance ─────
      ctx.textAlign = 'center'
      ctx.font = `400 11px var(--font-family-body, sans-serif)`
      const small = w < 640
      const hubMin = small ? 9 : 5
      const candidates: Array<{ n: SimNode; a: number; priority: number }> = []
      for (const n of sim) {
        if (n.r === 0) continue
        const isFocusNode = n.id === sel || n.id === hov
        const isNeighbor = focusSet ? focusSet.has(n.id) : false
        const nearCam = !small && n.depth < 460
        const hub = n.linkCount >= hubMin
        if (!isFocusNode && !isNeighbor && !hub && !nearCam) continue
        const f = fog(n.depth)
        let a = 0
        let priority = 0
        if (isFocusNode) { a = 0.95; priority = 3000 }
        else if (isNeighbor) { a = 0.75 * f; priority = 2000 - n.depth / 10 }
        else if (hub) { a = 0.55 * f; priority = 1000 + n.linkCount - n.depth / 50 }
        else { a = Math.max(0, 1 - n.depth / 460) * 0.5; priority = 500 - n.depth / 10 }
        if (focusId !== null && !isFocusNode && !isNeighbor) a *= 0.25
        if (a < 0.03) continue
        candidates.push({ n, a, priority })
      }
      candidates.sort((p, q) => q.priority - p.priority)
      // DOM overlays (hero copy, stats panel, hints) are exclusion zones —
      // canvas labels drawing through the hero paragraph is text-on-text.
      if (frameCount % 30 === 1 || exclusionsRef.current === null) {
        const canvasRect = canvas.getBoundingClientRect()
        exclusionsRef.current = Array.from(
          document.querySelectorAll('[data-world-exclude]')
        ).map((el) => {
          const r = el.getBoundingClientRect()
          return {
            x1: r.left - canvasRect.left - 8,
            y1: r.top - canvasRect.top - 8,
            x2: r.right - canvasRect.left + 8,
            y2: r.bottom - canvasRect.top + 8,
          }
        })
      }
      const exclusions = exclusionsRef.current ?? []
      const placed: Array<{ x: number; y: number; hw: number }> = []
      for (const { n, a } of candidates) {
        const title = n.title.length > 30 ? n.title.slice(0, 30) + '…' : n.title
        const hw = ctx.measureText(title).width / 2 + 6
        const ly = n.sy - n.r - 7
        let collides = false
        for (const p of placed) {
          if (Math.abs(ly - p.y) < 14 && Math.abs(n.sx - p.x) < hw + p.hw) { collides = true; break }
        }
        if (!collides) {
          for (const z of exclusions) {
            if (n.sx + hw > z.x1 && n.sx - hw < z.x2 && ly + 3 > z.y1 && ly - 11 < z.y2) {
              collides = true
              break
            }
          }
        }
        if (collides) continue
        placed.push({ x: n.sx, y: ly, hw })
        ctx.globalAlpha = a
        ctx.fillStyle = '#f2f3f5'
        ctx.fillText(title, n.sx, ly)
      }

      // ── weather from writing activity (present only) ─────────────
      if (atPresent) {
        if (activeSky && !reduceMotion) {
          // a tended garden earns shooting stars
          if (!shot && t > nextShot) {
            shot = {
              x: w * (0.15 + Math.random() * 0.7),
              y: h * (0.06 + Math.random() * 0.2),
              dx: (Math.random() < 0.5 ? -1 : 1) * (260 + Math.random() * 160),
              dy: 60 + Math.random() * 50,
              born: t,
            }
          }
          if (shot) {
            const life = (t - shot.born) / 0.8
            if (life >= 1) {
              shot = null
              nextShot = t + 7 + Math.random() * 12
            } else {
              const hx = shot.x + shot.dx * life
              const hy = shot.y + shot.dy * life
              const tail = 0.22
              const grad = ctx.createLinearGradient(hx - shot.dx * tail, hy - shot.dy * tail, hx, hy)
              grad.addColorStop(0, 'rgba(242,243,245,0)')
              grad.addColorStop(1, 'rgba(242,243,245,0.7)')
              ctx.globalAlpha = Math.sin(life * Math.PI)
              ctx.strokeStyle = grad
              ctx.lineWidth = 1.2
              ctx.beginPath()
              ctx.moveTo(hx - shot.dx * tail, hy - shot.dy * tail)
              ctx.lineTo(hx, hy)
              ctx.stroke()
            }
          }
        } else if (!activeSky) {
          // a resting garden gathers mist at the horizon
          const c2 = cam.current
          const hv = view(c2.tx - Math.sin(c2.yaw) * 2600, 0, c2.tz - Math.cos(c2.yaw) * 2600)
          if (hv.depth > NEAR) {
            const hp = toScreen(hv)
            const breathe = reduceMotion ? 0 : Math.sin(t * 0.08) * 0.012
            for (const [off, hgt, base] of [[-14, 70, 0.045], [26, 110, 0.03]] as const) {
              const yTop = hp.y + off - hgt / 2
              const mist = ctx.createLinearGradient(0, yTop, 0, yTop + hgt)
              mist.addColorStop(0, 'rgba(154,160,168,0)')
              mist.addColorStop(0.5, `rgba(154,160,168,${base + breathe})`)
              mist.addColorStop(1, 'rgba(154,160,168,0)')
              ctx.globalAlpha = 1
              ctx.fillStyle = mist
              ctx.fillRect(0, yTop, w, hgt)
            }
          }
        }
      }

      // ── vignette: draw the eye toward the centre ─────────────────
      ctx.globalAlpha = 1
      const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.45, w / 2, h / 2, Math.max(w, h) * 0.75)
      vig.addColorStop(0, 'rgba(8,9,11,0)')
      vig.addColorStop(1, 'rgba(8,9,11,0.55)')
      ctx.fillStyle = vig
      ctx.fillRect(0, 0, w, h)

      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    // ── input ──────────────────────────────────────────────────────
    const pick = (px: number, py: number): SimNode | null => {
      let best: SimNode | null = null
      let bestScore = Infinity
      for (const n of sim) {
        if (n.r === 0 || n.depth < NEAR) continue
        const dx = n.sx - px
        const dy = n.sy - py
        const hit = Math.max(10, n.r + 6)
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d < hit && n.depth < bestScore) {
          best = n
          bestScore = n.depth
        }
      }
      return best
    }

    let dragging = false
    let moved = false
    let lastX = 0
    let lastY = 0
    let pinchDist = 0

    const onPointerDown = (e: PointerEvent) => {
      dragging = true
      moved = false
      lastX = e.clientX
      lastY = e.clientY
      cam.current.drifting = false
      canvas.setPointerCapture(e.pointerId)
    }
    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      if (dragging) {
        const dx = e.clientX - lastX
        const dy = e.clientY - lastY
        if (Math.abs(dx) + Math.abs(dy) > 3) moved = true
        lastX = e.clientX
        lastY = e.clientY
        const c = cam.current
        c.tYaw -= dx * 0.005
        c.tPitch = Math.max(0.02, Math.min(1.25, c.tPitch + dy * 0.004))
      } else {
        const hit = pick(e.clientX - rect.left, e.clientY - rect.top)
        const id = hit ? hit.id : null
        if (id !== hoverRef.current) setHoverId(id)
        canvas.style.cursor = hit ? 'pointer' : 'grab'
      }
    }
    const onPointerUp = (e: PointerEvent) => {
      dragging = false
      if (!moved) {
        const rect = canvas.getBoundingClientRect()
        const hit = pick(e.clientX - rect.left, e.clientY - rect.top)
        if (hit) {
          flyTo(hit.id)
        } else {
          setSelectedId(null)
        }
      }
    }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const c = cam.current
      c.drifting = false
      c.tDist = Math.max(140, Math.min(2000, c.tDist * (1 + e.deltaY * 0.0012)))
    }
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        const d = Math.sqrt(dx * dx + dy * dy)
        if (pinchDist > 0) {
          const c = cam.current
          c.tDist = Math.max(140, Math.min(2000, c.tDist * (pinchDist / d)))
        }
        pinchDist = d
      }
    }
    const onTouchEnd = () => { pinchDist = 0 }

    const onKeyDown = (e: KeyboardEvent) => {
      // never hijack keys while the user is typing (e.g. the search palette)
      const el = document.activeElement
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) return
      const c = cam.current
      if (e.key === 'Escape') setSelectedId(null)
      if (e.key === 'ArrowLeft') { c.tYaw += 0.15; c.drifting = false }
      if (e.key === 'ArrowRight') { c.tYaw -= 0.15; c.drifting = false }
      if (e.key === 'ArrowUp') { c.tDist = Math.max(140, c.tDist * 0.85); c.drifting = false }
      if (e.key === 'ArrowDown') { c.tDist = Math.min(2000, c.tDist * 1.18); c.drifting = false }

      // WASD wanders the focus point across the ground, relative to view
      const key = e.key.toLowerCase()
      if (key === 'w' || key === 'a' || key === 's' || key === 'd') {
        const step = Math.max(30, c.tDist * 0.09)
        const fx = -Math.sin(c.yaw)
        const fz = -Math.cos(c.yaw)
        let mx = 0
        let mz = 0
        if (key === 'w') { mx = fx; mz = fz }
        if (key === 's') { mx = -fx; mz = -fz }
        if (key === 'a') { mx = fz; mz = -fx }
        if (key === 'd') { mx = -fz; mz = fx }
        c.ttx = Math.max(-1100, Math.min(1100, c.ttx + mx * step))
        c.ttz = Math.max(-1100, Math.min(1100, c.ttz + mz * step))
        c.drifting = false
      }
    }

    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('wheel', onWheel, { passive: false })
    canvas.addEventListener('touchmove', onTouchMove, { passive: false })
    canvas.addEventListener('touchend', onTouchEnd)
    window.addEventListener('keydown', onKeyDown)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      ro.disconnect()
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('wheel', onWheel)
      canvas.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [world, edges, neighbors, flyTo, intro])

  const handleReplayToggle = useCallback(() => {
    const tr = timeRef.current
    if (tr.playing) {
      tr.playing = false
    } else {
      if (tr.T >= 0.999) tr.T = 0
      tr.playing = true
    }
    setTimeUi((u) => ({ ...u, T: tr.T, playing: tr.playing }))
  }, [])

  const handleScrub = useCallback((value: number) => {
    const tr = timeRef.current
    tr.T = value
    tr.playing = false
    setTimeUi((u) => ({ ...u, T: value, playing: false }))
  }, [])

  const selected = selectedId !== null ? nodeById.get(selectedId) ?? null : null
  const selectedNeighbors = selectedId !== null
    ? [...(neighbors.get(selectedId) || [])]
        .map((id) => nodeById.get(id))
        .filter((n): n is WorldNode => !!n)
        .sort((a, b) => b.linkCount - a.linkCount)
    : []

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        aria-label="3D map of the garden. Each point of light is a note; links between notes are drawn as lines. A list of all notes follows this canvas."
        role="img"
        style={{ display: 'block', cursor: 'grab', touchAction: 'none' }}
      />

      {/* Deep time: replay the garden growing from its first commit */}
      <div className="glass-panel absolute bottom-6 right-6 z-10 hidden md:flex items-center gap-3 px-4 py-2.5">
        <button
          type="button"
          onClick={handleReplayToggle}
          aria-label={timeUi.playing ? 'Pause the replay' : 'Watch the garden grow'}
          title={timeUi.playing ? 'Pause' : 'Watch the garden grow'}
          className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-[rgba(255,255,255,0.08)]"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {timeUi.playing ? (
            <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor" aria-hidden>
              <rect x="0" y="0" width="3.4" height="12" rx="1" />
              <rect x="6.6" y="0" width="3.4" height="12" rx="1" />
            </svg>
          ) : (
            <svg width="11" height="12" viewBox="0 0 11 12" fill="currentColor" aria-hidden>
              <path d="M0 1.2c0-.9 1-1.5 1.8-1L10.4 5c.8.4.8 1.6 0 2L1.8 11.8c-.8.5-1.8-.1-1.8-1V1.2z" />
            </svg>
          )}
        </button>
        <input
          type="range"
          min={0}
          max={1000}
          value={Math.round(timeUi.T * 1000)}
          onChange={(e) => handleScrub(Number(e.target.value) / 1000)}
          aria-label="Garden timeline"
          className="w-36 accent-[var(--color-text-primary)]"
        />
        <span
          className="w-16 text-right text-xs tabular-nums"
          style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-family-mono)' }}
        >
          {timeUi.label}
        </span>
        {exploredCount !== null && exploredCount > 0 && (
          <>
            <span aria-hidden className="h-4 w-px" style={{ background: 'var(--color-border)' }} />
            <span
              className="text-xs tabular-nums"
              style={{ color: 'var(--color-text-disabled)' }}
              title="Notes you have read, marked with a ring in the garden"
            >
              {exploredCount}/{nodes.length} explored
            </span>
          </>
        )}
      </div>

      {/* Focused-note panel */}
      {selected && (
        <FocusedNotePanel
          note={selected}
          neighbors={selectedNeighbors}
          visited={visitedRef.current}
          onSelectNeighbor={flyTo}
        />
      )}
    </div>
  )
}
