import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * SHAPE MEANINGS - Oliver's Journey:
 *
 * circle (pink)    = LED glow, warmth, community - Oliver's art creates connection
 * arc (yellow)     = trajectory, growth upward - career arc from startup to Google to Scale
 * ring (blue)      = iteration, AI training loops - the work at Scale AI
 * semicircle (purple) = potential, half-complete - always building toward something
 * triangle (coral) = direction, Pink Triangle memorial - art with purpose
 * dots (mint)      = data points, billions of users - scale of impact
 */

const colors = {
  pink: '#FF6B9D',      // LED art, warmth
  yellow: '#FFD93D',    // Energy, growth
  blue: '#5DADE2',      // Tech, AI
  purple: '#A78BFA',    // Innovation
  coral: '#FF8A80',     // Passion, art
  mint: '#64FFDA',      // Fresh, data
}

interface ShapeConfig {
  type: 'circle' | 'ring' | 'arc' | 'semicircle' | 'triangle' | 'dots'
  color: string
  size: number
  x: string
  y: string
  meaning: string
}

// Shapes positioned to create a visual journey on the right side
const shapes: ShapeConfig[] = [
  // Primary accent - LED glow
  { type: 'ring', color: colors.pink, size: 120, x: '85%', y: '12%', meaning: 'iteration' },

  // Career arc
  { type: 'arc', color: colors.yellow, size: 100, x: '75%', y: '45%', meaning: 'growth' },

  // AI/tech ring
  { type: 'ring', color: colors.blue, size: 80, x: '60%', y: '70%', meaning: 'ai-loops' },

  // Innovation quarter
  { type: 'semicircle', color: colors.purple, size: 70, x: '90%', y: '35%', meaning: 'potential' },

  // Data points - scale
  { type: 'dots', color: colors.mint, size: 60, x: '70%', y: '20%', meaning: 'scale' },

  // Art direction
  { type: 'triangle', color: colors.coral, size: 45, x: '55%', y: '55%', meaning: 'direction' },

  // Small accents - warmth
  { type: 'circle', color: colors.pink, size: 25, x: '80%', y: '65%', meaning: 'warmth' },
  { type: 'circle', color: colors.yellow, size: 18, x: '65%', y: '15%', meaning: 'energy' },
  { type: 'circle', color: colors.purple, size: 15, x: '58%', y: '80%', meaning: 'spark' },
]

function ShapeSVG({ type, color, size }: { type: ShapeConfig['type']; color: string; size: number }) {
  const s = size

  switch (type) {
    case 'circle':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill={color} />
        </svg>
      )
    case 'ring':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="8" />
        </svg>
      )
    case 'arc':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <path
            d="M 10 80 Q 50 10 90 80"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
          />
        </svg>
      )
    case 'semicircle':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <path d="M 50 5 A 45 45 0 0 1 50 95" fill={color} />
        </svg>
      )
    case 'triangle':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <polygon points="50,10 90,90 10,90" fill={color} />
        </svg>
      )
    case 'dots':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <circle cx="20" cy="50" r="12" fill={color} />
          <circle cx="50" cy="50" r="12" fill={color} />
          <circle cx="80" cy="50" r="12" fill={color} />
        </svg>
      )
  }
}

export function FloatingShapes() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!containerRef.current) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const els = containerRef.current.querySelectorAll('.shape')

    // Staggered entrance - shapes appear as part of the hero reveal
    gsap.fromTo(
      els,
      {
        opacity: 0,
        scale: 0,
        rotation: () => gsap.utils.random(-90, 90),
      },
      {
        opacity: 0.75,
        scale: 1,
        rotation: 0,
        duration: 1,
        ease: 'back.out(1.5)',
        stagger: { amount: 0.8, from: 'random' },
        delay: 0.3,
      }
    )

    // Each shape has gentle floating based on its meaning
    els.forEach((el, i) => {
      const shape = shapes[i]

      // All shapes float gently
      gsap.to(el, {
        x: () => gsap.utils.random(-20, 20),
        y: () => gsap.utils.random(-15, 15),
        duration: gsap.utils.random(10, 16),
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: i * 0.2,
      })

      // Rings rotate slowly - continuous iteration
      if (shape.type === 'ring') {
        gsap.to(el, {
          rotation: 360,
          duration: gsap.utils.random(20, 30),
          ease: 'none',
          repeat: -1,
        })
      }

      // Semicircles and arcs sway - growth movement
      if (shape.type === 'semicircle' || shape.type === 'arc') {
        gsap.to(el, {
          rotation: gsap.utils.random(-15, 15),
          duration: gsap.utils.random(6, 10),
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        })
      }

      // Large shapes pulse subtly
      if (shape.size > 60) {
        gsap.to(el, {
          scale: gsap.utils.random(0.92, 1.08),
          opacity: gsap.utils.random(0.6, 0.85),
          duration: gsap.utils.random(4, 6),
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: i * 0.3,
        })
      }
    })

    // Shapes respond to scroll - move as you journey through the page
    // Each shape moves at different rate creating parallax depth
    gsap.to(els, {
      y: (i) => 50 + i * 15,
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 2,
      },
    })

  }, { scope: containerRef })

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {shapes.map((s, i) => (
        <div
          key={i}
          className="shape absolute hidden md:block"
          data-meaning={s.meaning}
          style={{
            left: s.x,
            top: s.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <ShapeSVG type={s.type} color={s.color} size={s.size} />
        </div>
      ))}
    </div>
  )
}
