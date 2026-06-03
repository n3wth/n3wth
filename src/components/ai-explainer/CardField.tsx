import { useEffect, useRef } from 'react'

interface CardFieldProps {
  seed?: number
}

/**
 * Per-card ASCII flow-field background, echoing the hero's AsciiField as
 * blueprint texture behind each alignment challenge. `seed` shifts the phase
 * and frequency so consecutive cards read as a varied sequence. Monochrome,
 * flat, low-contrast. Respects prefers-reduced-motion (single static frame).
 * NOTE: ctx.font uses a literal stack — CSS var() is not valid in canvas.
 */
export function CardField({ seed = 0 }: CardFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const chars = ' .:-=+*#%@'
    const cell = 16
    const fx = 0.16 + (seed % 3) * 0.03
    const fy = 0.2 + (seed % 4) * 0.025
    const phase = seed * 1.7
    let cols = 0
    let rows = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let raf = 0

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      cols = Math.ceil(w / cell)
      rows = Math.ceil(h / cell)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.font = "12px 'Geist Mono', ui-monospace, monospace"
      ctx.textBaseline = 'top'
    }

    const draw = (t: number) => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      ctx.clearRect(0, 0, w, h)
      const time = t * 0.00014 + phase
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const v =
            Math.sin(x * fx + time * 2) * 0.5 +
            Math.cos(y * fy - time * 1.4 + phase) * 0.5 +
            Math.sin((x + y) * 0.1 + time + phase) * 0.5
          const n = (v + 1.5) / 3
          const idx = Math.max(0, Math.min(chars.length - 1, Math.floor(n * chars.length)))
          const ch = chars[idx]
          if (ch === ' ') continue
          const alpha = 0.025 + n * 0.06
          ctx.fillStyle = `rgba(154, 160, 168, ${alpha.toFixed(3)})`
          ctx.fillText(ch, x * cell, y * cell)
        }
      }
    }

    resize()
    window.addEventListener('resize', resize)

    if (reduced) {
      draw(0)
    } else {
      const loop = (t: number) => {
        draw(t)
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)
    }

    return () => {
      window.removeEventListener('resize', resize)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [seed])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  )
}
