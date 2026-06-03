import { useEffect, useRef } from 'react'

/**
 * Signature visual: a subtle animated ASCII flow-field rendered to canvas.
 * Monochrome, flat, low-contrast — sits behind the hero as blueprint texture.
 * Respects prefers-reduced-motion (renders a single static frame, no loop).
 * NOTE: ctx.font uses a literal stack — CSS var() is not valid in canvas.
 */
export function AsciiField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const chars = ' .:-=+*#%@'
    const cell = 14
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
      const time = t * 0.00018
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          // flow field: layered sines -> value 0..1
          const v =
            Math.sin(x * 0.18 + time * 2.2) * 0.5 +
            Math.cos(y * 0.22 - time * 1.6) * 0.5 +
            Math.sin((x + y) * 0.12 + time) * 0.5
          const n = (v + 1.5) / 3 // normalize ~0..1
          const idx = Math.max(0, Math.min(chars.length - 1, Math.floor(n * chars.length)))
          const ch = chars[idx]
          if (ch === ' ') continue
          const alpha = 0.04 + n * 0.10
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
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  )
}
