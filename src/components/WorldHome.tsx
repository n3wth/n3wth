import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * The home page as a night field: every glowing structure is one of
 * Oliver's works standing in for a page. Colored light — the actual
 * medium of the art — is the only color on the site; everything else
 * stays near-black. Pointer sways the camera, hover breathes a
 * structure brighter, click walks in.
 *
 * Canvas 2D with additive blending (same approach as the garden's
 * WorldGarden). Reduced motion: a single static frame, hover and click
 * still work. The portal links also exist as real anchors below the
 * scene, so keyboard and no-canvas visitors lose nothing.
 */

interface P3 {
  x: number
  y: number
  z: number
}

interface Structure {
  id: string
  label: string
  sub: string
  href: string
  external?: boolean
  color: string
  /** anchor for the hover label, world space */
  anchor: P3
  points: P3[]
  edges: [number, number][]
  /** loose points drawn as light dots (no edges) */
  dots: P3[]
  phase: number
}

/* World space: x right, y up, z into the scene. Ground at y=0. */
function buildStructures(): Structure[] {
  const structures: Structure[] = []

  // THEM-like wireframe beast, right of center — After dark
  {
    const v: P3[] = [
      { x: 34, y: 0, z: 210 }, { x: 42, y: 0, z: 214 }, { x: 50, y: 0, z: 208 },
      { x: 38, y: 10, z: 211 }, { x: 46, y: 11, z: 210 },
      { x: 33, y: 16, z: 209 }, { x: 41, y: 19, z: 211 }, { x: 49, y: 15, z: 207 },
      { x: 36, y: 24, z: 210 }, { x: 45, y: 23, z: 209 },
    ]
    structures.push({
      id: 'art',
      label: 'After dark',
      sub: 'Light installations',
      href: '/art',
      color: '#ffe8c4',
      anchor: { x: 41, y: 13, z: 210 },
      points: v,
      edges: [
        [0, 3], [1, 3], [1, 4], [2, 4], [3, 5], [3, 6], [4, 6], [4, 7],
        [5, 8], [6, 8], [6, 9], [7, 9], [8, 9], [5, 6], [6, 7],
      ],
      dots: [],
      phase: 0.7,
    })
  }

  // Grid dissolving into constellation, left — Work
  {
    const pts: P3[] = []
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 4; j++) {
        const scatter = i > 2 ? (i - 2) * 1.6 : 0
        pts.push({
          x: -78 + i * 7 + (scatter ? Math.sin(i * 5 + j * 3) * scatter : 0),
          y: 4 + j * 7 + (scatter ? Math.cos(i * 3 + j * 7) * scatter : 0),
          z: 240 + (scatter ? Math.sin(i * 7 + j) * 6 : 0),
        })
      }
    }
    structures.push({
      id: 'work',
      label: 'Work',
      sub: 'A decade of AI in production',
      href: '/work',
      color: '#a8c8ff',
      anchor: { x: -57, y: 16, z: 240 },
      points: [],
      edges: [],
      dots: pts,
      phase: 2.1,
    })
  }

  // Forking path on the ground, center-front — Thinking
  {
    const v: P3[] = []
    for (let i = 0; i <= 8; i++) v.push({ x: -6 + i * 2.2, y: 0.4, z: 120 + i * 5 })
    for (let i = 1; i <= 6; i++) v.push({ x: 11.6 + i * 3.2, y: 0.4, z: 160 + i * 7 })
    for (let i = 1; i <= 6; i++) v.push({ x: 11.6 + i * 1.1, y: 0.4, z: 160 + i * 9.5 })
    const edges: [number, number][] = []
    for (let i = 0; i < 8; i++) edges.push([i, i + 1])
    edges.push([8, 9])
    for (let i = 9; i < 14; i++) edges.push([i, i + 1])
    edges.push([8, 15])
    for (let i = 15; i < 20; i++) edges.push([i, i + 1])
    structures.push({
      id: 'thinking',
      label: 'Thinking',
      sub: 'Trade-offs, not clean answers',
      href: '/thinking',
      color: '#9be8ff',
      anchor: { x: 14, y: 6, z: 168 },
      points: v,
      edges,
      dots: [],
      phase: 4.4,
    })
  }

  // Warm beacon, far right — Contact
  {
    const dots: P3[] = []
    for (let i = 0; i < 7; i++) {
      dots.push({
        x: 92 + Math.sin(i * 2.4) * 2,
        y: 1 + i * 1.8 + Math.cos(i) * 0.6,
        z: 300,
      })
    }
    structures.push({
      id: 'contact',
      label: "Let's talk",
      sub: 'oliver@newth.ai',
      href: '/contact',
      color: '#ffb877',
      anchor: { x: 92, y: 7, z: 300 },
      points: [],
      edges: [],
      dots,
      phase: 1.3,
    })
  }

  // Patch of small green lights, near left — the garden
  {
    const dots: P3[] = []
    for (let i = 0; i < 26; i++) {
      const a = i * 2.399
      const r = 3 + (i % 9) * 1.7
      dots.push({
        x: -46 + Math.cos(a) * r,
        y: 0.6 + (i % 5) * 1.5,
        z: 150 + Math.sin(a) * r * 0.8,
      })
    }
    structures.push({
      id: 'garden',
      label: 'The garden',
      sub: '250+ notes, growing',
      href: 'https://garden.n3wth.com',
      external: true,
      color: '#9dffc8',
      anchor: { x: -46, y: 5, z: 150 },
      points: [],
      edges: [],
      dots,
      phase: 3.6,
    })
  }

  // Pink triangle on the far ridge — decorative skyline, part of /art
  {
    const v: P3[] = [
      { x: -128, y: 8, z: 520 },
      { x: -114, y: 8, z: 520 },
      { x: -121, y: 20, z: 520 },
    ]
    structures.push({
      id: 'triangle',
      label: 'After dark',
      sub: 'Pink Triangle, Twin Peaks',
      href: '/art',
      color: '#ff6fae',
      anchor: { x: -121, y: 24, z: 520 },
      points: v,
      edges: [
        [0, 1],
        [1, 2],
        [2, 0],
      ],
      dots: [],
      phase: 5.2,
    })
  }

  return structures
}

interface Hover {
  id: string
  label: string
  sub: string
  x: number
  y: number
}

export function WorldHome() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const [hover, setHover] = useState<Hover | null>(null)
  const hoverRef = useRef<string | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const structures = buildStructures()
    let w = 0
    let h = 0
    let dpr = 1
    const pointer = { x: 0.5, y: 0.5 }
    const cam = { yaw: 0, pitch: 0 }
    let raf = 0
    let running = true
    const screenAnchors = new Map<string, { x: number; y: number; r: number }>()

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = wrap.clientWidth
      h = wrap.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
    }
    resize()

    const project = (p: P3) => {
      // camera at origin, slight yaw/pitch from pointer
      const cy = Math.cos(cam.yaw)
      const sy = Math.sin(cam.yaw)
      const x1 = p.x * cy - p.z * sy
      const z1 = p.x * sy + p.z * cy
      const cx = Math.cos(cam.pitch)
      const sx = Math.sin(cam.pitch)
      const camHeight = 10
      const y0 = p.y - camHeight
      const y1 = y0 * cx - z1 * sx
      const z2 = y0 * sx + z1 * cx
      if (z2 < 8) return null
      const f = (h * 1.15) / z2
      return { x: w / 2 + x1 * f, y: h * 0.56 - y1 * f, s: f }
    }

    const draw = (t: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = '#08090b'
      ctx.fillRect(0, 0, w, h)

      // horizon: a thin pale band, the playa look
      const horizon = project({ x: 0, y: 0, z: 4000 })
      const hy = horizon ? horizon.y : h * 0.52
      const grad = ctx.createLinearGradient(0, hy - h * 0.16, 0, hy + 2)
      grad.addColorStop(0, 'rgba(8,9,11,0)')
      grad.addColorStop(0.85, 'rgba(210,218,228,0.14)')
      grad.addColorStop(1, 'rgba(230,236,244,0.22)')
      ctx.fillStyle = grad
      ctx.fillRect(0, hy - h * 0.16, w, h * 0.16 + 2)
      ctx.fillStyle = 'rgba(8,9,11,1)'
      ctx.fillRect(0, hy + 1, w, h - hy)

      // sparse ground specks
      ctx.fillStyle = 'rgba(255,255,255,0.05)'
      for (let i = 0; i < 70; i++) {
        const gx = ((i * 97) % 283) / 283
        const gz = 40 + ((i * 61) % 199)
        const p = project({ x: (gx - 0.5) * 300, y: 0, z: gz })
        if (p) ctx.fillRect(p.x, p.y, 1, 1)
      }

      // structures, additive
      ctx.globalCompositeOperation = 'lighter'
      for (const s of structures) {
        const hovered = hoverRef.current === s.id
        const breathe = reduceMotion ? 1 : 0.85 + Math.sin(t * 1.4 + s.phase) * 0.15
        const boost = hovered ? 1.7 : 1
        const alpha = Math.min(1, 0.62 * breathe * boost)

        ctx.strokeStyle = s.color
        ctx.fillStyle = s.color
        ctx.shadowColor = s.color
        ctx.lineWidth = hovered ? 1.6 : 1.1

        if (s.edges.length) {
          ctx.globalAlpha = alpha
          ctx.shadowBlur = hovered ? 18 : 10
          ctx.beginPath()
          for (const [a, b] of s.edges) {
            const p1 = project(s.points[a])
            const p2 = project(s.points[b])
            if (!p1 || !p2) continue
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
          }
          ctx.stroke()
        }

        for (let i = 0; i < s.dots.length; i++) {
          const d = s.dots[i]
          const p = project(d)
          if (!p) continue
          const tw = reduceMotion ? 1 : 0.7 + Math.sin(t * 2.2 + s.phase + i * 1.7) * 0.3
          ctx.globalAlpha = Math.min(1, alpha * tw)
          ctx.shadowBlur = hovered ? 14 : 8
          const r = Math.max(0.8, p.s * 0.55) * (hovered ? 1.3 : 1)
          ctx.beginPath()
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
          ctx.fill()
        }

        const a = project(s.anchor)
        if (a) screenAnchors.set(s.id, { x: a.x, y: a.y, r: Math.max(48, a.s * 14) })
      }
      ctx.globalAlpha = 1
      ctx.shadowBlur = 0
      ctx.globalCompositeOperation = 'source-over'
    }

    const frame = (now: number) => {
      if (!running) return
      const t = now / 1000
      // lerp camera toward pointer, plus a slow idle drift
      const targetYaw = (pointer.x - 0.5) * 0.14 + (reduceMotion ? 0 : Math.sin(t * 0.1) * 0.02)
      const targetPitch = (pointer.y - 0.5) * 0.05
      cam.yaw += (targetYaw - cam.yaw) * 0.06
      cam.pitch += (targetPitch - cam.pitch) * 0.06
      draw(t)
      raf = requestAnimationFrame(frame)
    }

    if (reduceMotion) {
      draw(0)
    } else {
      raf = requestAnimationFrame(frame)
    }

    const pick = (cx: number, cy: number): Structure | null => {
      let best: Structure | null = null
      let bestScore = Infinity
      for (const s of structures) {
        const a = screenAnchors.get(s.id)
        if (!a) continue
        const d = Math.hypot(cx - a.x, cy - a.y)
        const score = d / a.r
        if (score < 1.4 && score < bestScore) {
          bestScore = score
          best = s
        }
      }
      return best
    }

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const cx = e.clientX - rect.left
      const cy = e.clientY - rect.top
      pointer.x = cx / rect.width
      pointer.y = cy / rect.height
      const s = pick(cx, cy)
      const id = s?.id ?? null
      if (id !== hoverRef.current) {
        hoverRef.current = id
        if (s) {
          const a = screenAnchors.get(s.id)!
          setHover({ id: s.id, label: s.label, sub: s.sub, x: a.x, y: a.y })
        } else {
          setHover(null)
        }
        if (reduceMotion) draw(0)
      } else if (s) {
        const a = screenAnchors.get(s.id)!
        setHover((prev) => (prev ? { ...prev, x: a.x, y: a.y } : prev))
      }
      canvas.style.cursor = s ? 'pointer' : 'default'
    }

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const s = pick(e.clientX - rect.left, e.clientY - rect.top)
      if (!s) return
      if (s.external) {
        window.location.href = s.href
      } else {
        navigate(s.href, { viewTransition: true })
      }
    }

    const onLeave = () => {
      hoverRef.current = null
      setHover(null)
      if (reduceMotion) draw(0)
    }

    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('click', onClick)
    canvas.addEventListener('pointerleave', onLeave)
    window.addEventListener('resize', resize)
    return () => {
      running = false
      cancelAnimationFrame(raf)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('click', onClick)
      canvas.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('resize', resize)
    }
  }, [navigate])

  return (
    <div ref={wrapRef} className="relative h-full w-full overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" aria-hidden="true" />

      {hover && (
        <div
          className="world-label"
          style={{ left: hover.x, top: hover.y }}
          aria-hidden="true"
        >
          <span className="world-label-title">{hover.label}</span>
          <span className="world-label-sub">{hover.sub}</span>
        </div>
      )}
    </div>
  )
}
