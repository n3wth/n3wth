import { memo, useEffect, useRef } from "react"

/**
 * TensionField — a generative monochrome artwork for the alignment essay.
 *
 * Not a chart. Two opposing "forces" (the trade-off at the heart of each
 * dilemma) seed a field of fine drifting particles strung between two poles.
 * Before a choice the field rests in symmetric equilibrium. After a choice the
 * field redistributes — mass and light gather toward the side you optimized
 * for, and the equilibrium seam bows under the imbalance.
 *
 * Meaning is carried by FORM and MOTION, never by labels or numbers. The bias
 * is derived from the chosen metrics but the figures themselves are never shown.
 * White-on-near-black. Respects prefers-reduced-motion (single static frame).
 */

interface TensionFieldProps {
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
  metrics,
  isAnimating,
}: TensionFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const biasRef = useRef(0)
  const targetBiasRef = useRef(0)

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
    const COUNT = 240
    const particles = Array.from({ length: COUNT }, (_, i) => {
      const r = (i * 2.3999632) % 1 // golden-ratio scatter for even fill
      return {
        hx: (i + 0.5) / COUNT, // home x 0..1
        y: r,
        phase: (i * 1.61803) % (Math.PI * 2),
        speed: 0.15 + ((i * 7) % 11) / 30,
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

    const draw = (t: number) => {
      // Ease current bias toward target.
      biasRef.current += (targetBiasRef.current - biasRef.current) * 0.04
      const bias = biasRef.current
      const time = t * 0.0004

      ctx.clearRect(0, 0, W, H)

      const cx = W / 2
      // The equilibrium seam: a vertical line that bows under imbalance.
      const seamShift = bias * W * 0.16

      // --- contour seam (the boundary the two forces negotiate) ---
      ctx.lineWidth = 1
      for (let band = 0; band < 3; band++) {
        ctx.beginPath()
        const amp = 10 + band * 7
        const off = band * 9 * (bias >= 0 ? 1 : -1)
        for (let yy = 0; yy <= H; yy += 6) {
          const ny = yy / H
          const wobble =
            Math.sin(ny * 5 + time * 1.4 + band) * amp +
            Math.sin(ny * 11 - time) * (amp * 0.4)
          const x = cx + seamShift + wobble + off
          if (yy === 0) ctx.moveTo(x, yy)
          else ctx.lineTo(x, yy)
        }
        ctx.strokeStyle = `rgba(255,255,255,${0.06 + (2 - band) * 0.03})`
        ctx.stroke()
      }

      // --- particle field: drawn as fine points, density leans with bias ---
      for (let i = 0; i < COUNT; i++) {
        const p = particles[i]
        // home column, redistributed: the chosen side gathers more mass.
        const pull = bias * (0.5 - Math.abs(p.hx - 0.5)) * 0.9
        let hx = p.hx + pull
        hx = Math.max(0.02, Math.min(0.98, hx))

        // drift
        const dy = reduced ? 0 : Math.sin(time * p.speed * 6 + p.phase) * 0.04
        const dx =
          reduced ? 0 : Math.cos(time * p.speed * 5 + p.phase * 1.3) * 0.02
        const px = (hx + dx) * W
        const py = ((p.y + dy + 1) % 1) * H

        // distance to seam -> brightness (light concentrates along the seam
        // and on the side the choice favors)
        const seamX = cx + seamShift
        const d = Math.abs(px - seamX) / W
        const side = (px - seamX) * Math.sign(bias || 1)
        const favored = side > 0 ? 0.5 : 0
        const a = 0.05 + Math.max(0, 0.32 - d * 0.5) + favored * 0.18
        const size = 0.7 + Math.max(0, 0.28 - d) * 3

        ctx.fillStyle = `rgba(255,255,255,${Math.min(0.55, a).toFixed(3)})`
        ctx.fillRect(px, py, size, size)
      }

      // --- two poles: faint anchor marks at the field edges ---
      const poleA = 0.5 - 0.42
      const poleB = 0.5 + 0.42
      const drawPole = (fx: number, strength: number) => {
        const x = fx * W
        ctx.beginPath()
        ctx.arc(x, H / 2, 3, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${0.18 + strength * 0.5})`
        ctx.fill()
        ctx.beginPath()
        ctx.arc(x, H / 2, 14 + strength * 18, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(255,255,255,${0.05 + strength * 0.12})`
        ctx.lineWidth = 1
        ctx.stroke()
      }
      drawPole(poleA, Math.max(0, -bias))
      drawPole(poleB, Math.max(0, bias))
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
