import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  color: string
}

const ACCENT_COLORS = [
  'rgba(255, 255, 255, 0.6)', // pink
  'rgba(255, 255, 255, 0.6)',  // blue
  'rgba(212, 214, 218, 0.6)',  // yellow
  'rgba(255, 255, 255, 0.6)', // purple
]
const DEFAULT_COLOR = 'rgba(255, 255, 255, 0.1)'
const LINE_COLOR = 'rgba(255, 255, 255, 0.02)'
const CONNECTION_DIST = 120
const CURSOR_RADIUS = 150
const CURSOR_FORCE = 0.8

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    const ctx = canvas.getContext('2d')!
    let w = 0
    let h = 0
    let dpr = 1
    let mouseX = -1000
    let mouseY = -1000
    let rafId = 0

    const isMobile = window.innerWidth < 768
    const count = isMobile ? 30 : 50

    const particles: Particle[] = []

    const resize = () => {
      dpr = window.devicePixelRatio || 1
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const init = () => {
      resize()
      particles.length = 0
      for (let i = 0; i < count; i++) {
        const isAccent = i < 5
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          r: isAccent ? 2.5 + Math.random() * 1.5 : 1.5 + Math.random() * 1,
          color: isAccent ? ACCENT_COLORS[i % ACCENT_COLORS.length] : DEFAULT_COLOR,
        })
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)

      // Update positions
      for (const p of particles) {
        if (!prefersReducedMotion) {
          // Cursor repulsion
          const dx = p.x - mouseX
          const dy = p.y - mouseY
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < CURSOR_RADIUS && dist > 0) {
            const force = (1 - dist / CURSOR_RADIUS) * CURSOR_FORCE
            p.vx += (dx / dist) * force
            p.vy += (dy / dist) * force
          }

          // Apply velocity with damping
          p.vx *= 0.98
          p.vy *= 0.98
          p.x += p.vx
          p.y += p.vy

          // Wrap around edges
          if (p.x < -10) p.x = w + 10
          if (p.x > w + 10) p.x = -10
          if (p.y < -10) p.y = h + 10
          if (p.y > h + 10) p.y = -10
        }

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.fill()
      }

      // Draw connections
      ctx.strokeStyle = LINE_COLOR
      ctx.lineWidth = 0.5
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < CONNECTION_DIST) {
            ctx.globalAlpha = 1 - dist / CONNECTION_DIST
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }
      ctx.globalAlpha = 1

      rafId = requestAnimationFrame(draw)
    }

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    const onTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseX = e.touches[0].clientX
        mouseY = e.touches[0].clientY
      }
    }

    const onTouchEnd = () => {
      mouseX = -1000
      mouseY = -1000
    }

    const onLeave = () => {
      mouseX = -1000
      mouseY = -1000
    }

    init()
    if (!prefersReducedMotion) {
      rafId = requestAnimationFrame(draw)
    } else {
      // Static render for reduced motion
      draw()
    }

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)
    window.addEventListener('touchmove', onTouch, { passive: true })
    window.addEventListener('touchend', onTouchEnd)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('touchmove', onTouch)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      data-particle-field
      className="fixed inset-0 pointer-events-none z-0"
      style={{ willChange: 'transform' }}
      aria-hidden="true"
    />
  )
}
