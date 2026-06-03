import { memo, useEffect, useRef } from "react"

/**
 * TensionField — a generative monochrome artwork for the alignment essay.
 *
 * Not a chart. Each dilemma gets its OWN abstract geometric story, so the three
 * fields read as three different shapes of trade-off rather than one repeated
 * motif:
 *   sweep   — a moderation threshold sweeping a field; the line catches mass on
 *             one side and lets innocents leak through (False Positive Gamble).
 *   vortex  — a current spiralling inward toward a pull, or releasing outward
 *             (Engagement Trap).
 *   opacity — an opaque mass on one side, a legible grid on the other; the
 *             choice shifts the boundary between them (Black Box Dilemma).
 * Before a choice each rests in equilibrium. After a choice it redistributes
 * toward the side you optimized for.
 *
 * Meaning is carried by FORM and MOTION, never by labels or numbers. The bias
 * is derived from the chosen metrics but the figures themselves are never shown.
 * White-on-near-black. Respects prefers-reduced-motion (single static frame).
 */

type Variant = 'sweep' | 'vortex' | 'opacity'

function variantFor(challengeId: string): Variant {
  if (challengeId === 'challenge-2') return 'vortex'
  if (challengeId === 'challenge-3') return 'opacity'
  return 'sweep'
}

interface TensionFieldProps {
  challengeId: string
  metrics: Record<string, number> | null
  isAnimating: boolean
}

function biasFromMetrics(metrics: Record<string, number> | null): number {
  // Returns -1..1: which pole the choice leans toward. 0 = balanced.
  if (!metrics) return 0
  const vals = Object.values(metrics)
  if (vals.length < 2) return 0
  // First metric vs the mean of the rest — a relative lean, never a displayed value.
  const a = vals[0]
  const rest = vals.slice(1).reduce((s, v) => s + v, 0) / (vals.length - 1)
  const lean = (a - rest) / 100
  return Math.max(-1, Math.min(1, lean * 2.2))
}

export const TensionField = memo(function TensionField({
  challengeId,
  metrics,
  isAnimating,
}: TensionFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const biasRef = useRef(0)
  const targetBiasRef = useRef(0)
  const variant = variantFor(challengeId)

  // Update the target whenever a choice is made.
  targetBiasRef.current = biasFromMetrics(metrics)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let raf = 0
    let W = 0
    let H = 0

    // Particles strung across the field. Each has a home column and a phase.
    const COUNT = 320
    const particles = Array.from({ length: COUNT }, (_, i) => {
      const r = (i * 2.3999632) % 1 // golden-ratio scatter for even fill
      return {
        hx: (i + 0.5) / COUNT, // home x 0..1
        y: r,
        phase: (i * 1.61803) % (Math.PI * 2),
        speed: 0.15 + ((i * 7) % 11) / 30,
        // independent flow speed so the field reads as a living current
        flow: 0.012 + ((i * 13) % 17) / 900,
      }
    })

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = canvas.clientWidth
      H = canvas.clientHeight
      canvas.width = Math.floor(W * dpr)
      canvas.height = Math.floor(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    // --- sweep: a moderation threshold sweeping a field of voices. The line
    // catches mass on one side; innocents leak through to the other. Bias slides
    // the threshold, trapping more or sparing more. ---
    const drawSweep = (time: number, bias: number) => {
      const cx = W / 2
      const seamShift = bias * W * 0.16
      const seamX = cx + seamShift

      // Three clean threshold lines reading as one moderation seam — the lead
      // line crisp, two trailing guides faint. No glow pulse: weight alone
      // carries the hierarchy (flat).
      for (let band = 0; band < 3; band++) {
        ctx.beginPath()
        const amp = 9 + band * 6
        const off = band * 11 * (bias >= 0 ? 1 : -1)
        for (let yy = 0; yy <= H; yy += 4) {
          const ny = yy / H
          const wobble =
            Math.sin(ny * 5 + time * 1.4 + band) * amp +
            Math.sin(ny * 11 - time) * (amp * 0.35)
          const x = seamX + wobble + off
          if (yy === 0) ctx.moveTo(x, yy)
          else ctx.lineTo(x, yy)
        }
        ctx.lineWidth = band === 0 ? 1.4 : 1
        ctx.strokeStyle = `rgba(255,255,255,${0.07 + (2 - band) * 0.03})`
        ctx.stroke()
      }

      for (let i = 0; i < COUNT; i++) {
        const p = particles[i]
        const pull = bias * (0.5 - Math.abs(p.hx - 0.5)) * 0.9
        let hx = p.hx + pull
        hx = Math.max(0.02, Math.min(0.98, hx))
        if (!reduced) p.y = (p.y - p.flow + 1) % 1
        const dy = reduced ? 0 : Math.sin(time * p.speed * 6 + p.phase) * 0.04
        const dx = reduced ? 0 : Math.cos(time * p.speed * 5 + p.phase * 1.3) * 0.02
        const pull2 = reduced ? 0 : Math.sin(time * 1.2 + p.phase) * 0.012
        const px = (hx + dx + pull2) * W
        const py = ((p.y + dy + 1) % 1) * H
        const d = Math.abs(px - seamX) / W
        const side = (px - seamX) * Math.sign(bias || 1)
        const favored = side > 0 ? 0.5 : 0
        const twinkle = reduced ? 1 : 0.7 + Math.sin(time * 3 + p.phase * 2) * 0.3
        const a = (0.05 + Math.max(0, 0.34 - d * 0.5) + favored * 0.18) * twinkle
        const size = 0.7 + Math.max(0, 0.3 - d) * 3.4
        ctx.fillStyle = `rgba(255,255,255,${Math.min(0.6, a).toFixed(3)})`
        ctx.fillRect(px, py, size, size)
      }

      // Two poles: a solid dot and one fixed structural ring. The favored side
      // reads through dot brightness and ring weight, not a pulsing halo (flat).
      const drawPole = (fx: number, strength: number) => {
        const x = fx * W
        ctx.beginPath()
        ctx.arc(x, H / 2, 3, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${0.16 + strength * 0.5})`
        ctx.fill()
        ctx.beginPath()
        ctx.arc(x, H / 2, 16 + strength * 14, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(255,255,255,${0.06 + strength * 0.14})`
        ctx.lineWidth = 1
        ctx.stroke()
      }
      drawPole(0.5 - 0.42, Math.max(0, -bias))
      drawPole(0.5 + 0.42, Math.max(0, bias))
    }

    // --- vortex: a current spiralling toward a central pull. Positive bias
    // tightens the spiral inward (engagement captures); negative bias loosens
    // it and lets the field breathe back out (wellbeing released). ---
    const drawVortex = (time: number, bias: number) => {
      const cx = W / 2
      const cy = H / 2
      const maxR = Math.min(W, H) * 0.46
      // tightness: >0 pulls inward, <0 releases outward
      const tight = bias
      const spin = reduced ? 0 : time * 0.6

      for (let arm = 0; arm < 3; arm++) {
        ctx.beginPath()
        const armPhase = (arm / 3) * Math.PI * 2
        for (let s = 0; s <= 80; s++) {
          const f = s / 80
          const ang = armPhase + f * Math.PI * 3.2 + spin
          // inward pull compresses radius near the core; release expands it
          const r = maxR * Math.pow(f, 0.6 - tight * 0.3)
          const x = cx + Math.cos(ang) * r
          const y = cy + Math.sin(ang) * r * 0.62
          if (s === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.lineWidth = 1
        ctx.strokeStyle = `rgba(255,255,255,${0.06 + (2 - arm) * 0.03})`
        ctx.stroke()
      }

      for (let i = 0; i < COUNT; i++) {
        const p = particles[i]
        if (!reduced) p.y = (p.y - p.flow * (1 + tight) + 1) % 1
        // map home position onto an angle + radius, then spiral it
        const ang = p.hx * Math.PI * 2 + p.y * Math.PI * 4 + spin
        const baseR = (0.15 + p.y * 0.85) * maxR
        const r = baseR * (1 - tight * (1 - p.y) * 0.6)
        const wob = reduced ? 0 : Math.sin(time * p.speed * 4 + p.phase) * 3
        const px = cx + Math.cos(ang) * (r + wob)
        const py = cy + Math.sin(ang) * (r + wob) * 0.62
        const dCore = Math.hypot(px - cx, py - cy) / maxR
        const twinkle = reduced ? 1 : 0.7 + Math.sin(time * 3 + p.phase * 2) * 0.3
        // light gathers at the core when pulled inward
        const a = (0.05 + Math.max(0, 0.34 - dCore * 0.4) + Math.max(0, tight) * (1 - dCore) * 0.2) * twinkle
        const size = 0.7 + Math.max(0, 0.4 - dCore) * 3
        ctx.fillStyle = `rgba(255,255,255,${Math.min(0.6, a).toFixed(3)})`
        ctx.fillRect(px, py, size, size)
      }

      // The pull at the center: a solid core whose size and a single ring track
      // how hard the current is being drawn inward. Flat — no breathing halo.
      const coreR = 3 + Math.max(0, tight) * 4
      ctx.beginPath()
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,255,255,${0.2 + Math.max(0, tight) * 0.4})`
      ctx.fill()
      ctx.beginPath()
      ctx.arc(cx, cy, 18 + Math.abs(tight) * 16, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(255,255,255,${0.06 + Math.abs(tight) * 0.12})`
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // --- opacity: an inscrutable mass on one side, a legible grid on the other.
    // Bias shifts the boundary — one choice grows the explainable structure, the
    // other lets the black box swallow more of the field. ---
    const drawOpacity = (time: number, bias: number) => {
      // boundary x: positive bias (capability/black-box leaning) pushes the
      // opaque mass rightward, eating the grid; negative grows the grid.
      const bx = (0.5 + bias * 0.28) * W

      // legible grid on the left
      const cell = 22
      for (let gx = 0; gx <= bx; gx += cell) {
        const fade = 1 - gx / Math.max(bx, 1)
        ctx.beginPath()
        ctx.moveTo(gx, 0)
        ctx.lineTo(gx, H)
        ctx.strokeStyle = `rgba(255,255,255,${0.04 + fade * 0.08})`
        ctx.lineWidth = 1
        ctx.stroke()
      }
      for (let gy = 0; gy <= H; gy += cell) {
        ctx.beginPath()
        ctx.moveTo(0, gy)
        ctx.lineTo(bx, gy)
        ctx.strokeStyle = `rgba(255,255,255,0.05)`
        ctx.lineWidth = 1
        ctx.stroke()
      }
      // node dots at grid crossings — the explainable reasoning
      for (let gx = cell; gx < bx; gx += cell) {
        for (let gy = cell; gy < H; gy += cell) {
          const tw = reduced ? 1 : 0.6 + Math.sin(time * 2 + gx + gy) * 0.4
          ctx.fillStyle = `rgba(255,255,255,${(0.12 * tw).toFixed(3)})`
          ctx.fillRect(gx - 0.7, gy - 0.7, 1.4, 1.4)
        }
      }

      // the opaque mass on the right — dense, unreadable churn
      for (let i = 0; i < COUNT; i++) {
        const p = particles[i]
        if (!reduced) p.y = (p.y - p.flow + 1) % 1
        // confine particles to the opaque region right of the boundary
        const region = 1 - bx / W
        const hx = bx / W + p.hx * region
        const churn = reduced ? 0 : Math.sin(time * p.speed * 7 + p.phase) * 0.03
        const px = (hx + churn) * W
        const py = ((p.y + (reduced ? 0 : Math.cos(time * p.speed * 5 + p.phase) * 0.04) + 1) % 1) * H
        // denser, brighter the further into the mass — illegible concentration
        const depth = (px - bx) / Math.max(W - bx, 1)
        const a = 0.06 + depth * 0.22
        const size = 1 + depth * 1.6
        ctx.fillStyle = `rgba(255,255,255,${Math.min(0.5, a).toFixed(3)})`
        ctx.fillRect(px, py, size, size)
      }

      // the boundary seam between known and unknowable
      ctx.beginPath()
      for (let yy = 0; yy <= H; yy += 4) {
        const wobble = Math.sin(yy / H * 9 + time * 1.2) * 4
        const x = bx + wobble
        if (yy === 0) ctx.moveTo(x, yy)
        else ctx.lineTo(x, yy)
      }
      ctx.lineWidth = 1.4
      ctx.strokeStyle = `rgba(255,255,255,0.18)`
      ctx.stroke()
    }

    const draw = (t: number) => {
      // Ease current bias toward target.
      biasRef.current += (targetBiasRef.current - biasRef.current) * 0.04
      const bias = biasRef.current
      const time = t * 0.0004

      // Trailing smear: paint a translucent backdrop instead of a hard clear so
      // the drifting field leaves soft motion trails. Reduced motion stays crisp.
      if (reduced) {
        ctx.clearRect(0, 0, W, H)
      } else {
        // Shorter trail (higher alpha clears faster) keeps the field crisp
        // rather than smearing into a muddy fog.
        ctx.fillStyle = "rgba(10,10,12,0.34)"
        ctx.fillRect(0, 0, W, H)
      }

      if (variant === 'vortex') drawVortex(time, bias)
      else if (variant === 'opacity') drawOpacity(time, bias)
      else drawSweep(time, bias)
    }

    resize()
    window.addEventListener("resize", resize)

    if (reduced) {
      // settle bias instantly for a representative static frame
      biasRef.current = targetBiasRef.current
      draw(0)
    } else {
      const loop = (tt: number) => {
        draw(tt)
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)
    }

    return () => {
      window.removeEventListener("resize", resize)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-consequence-viz
      className="block w-full"
      style={{
        height: 200,
        opacity: isAnimating ? 1 : 0.92,
        transition: "opacity 0.5s var(--ease)",
      }}
    />
  )
})
