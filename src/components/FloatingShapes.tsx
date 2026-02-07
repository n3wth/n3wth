import { memo, useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'

/**
 * SHAPE MEANINGS - Oliver's Journey:
 * Solid symmetric geometric shapes representing key themes.
 *
 * circle (pink)      = LED glow, warmth, community - Oliver's art creates connection
 * semicircle (yellow) = horizon, growth - career rising from startup to Google to Scale
 * triangle (coral)   = direction, Pink Triangle memorial - art with purpose
 * diamond (blue)     = precision, data - AI work, billions of training examples
 * square (purple)    = foundation, stability - building lasting systems
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
  type: 'circle' | 'semicircle' | 'triangle' | 'diamond' | 'square'
  color: string
  size: number
  x: string
  y: string
  meaning: string
}

// Shapes positioned to create a visual journey on the right side
const shapes: ShapeConfig[] = [
  // Primary - LED glow, community
  { type: 'circle', color: colors.pink, size: 90, x: '85%', y: '15%', meaning: 'warmth' },

  // Horizon - career growth
  { type: 'semicircle', color: colors.yellow, size: 80, x: '75%', y: '45%', meaning: 'growth' },

  // Precision - AI/data work
  { type: 'diamond', color: colors.blue, size: 70, x: '60%', y: '70%', meaning: 'precision' },

  // Foundation - building systems
  { type: 'square', color: colors.purple, size: 50, x: '90%', y: '55%', meaning: 'foundation' },

  // Direction - Pink Triangle memorial
  { type: 'triangle', color: colors.coral, size: 55, x: '55%', y: '35%', meaning: 'direction' },

  // Small accents
  { type: 'circle', color: colors.yellow, size: 30, x: '70%', y: '20%', meaning: 'energy' },
  { type: 'circle', color: colors.blue, size: 20, x: '80%', y: '75%', meaning: 'spark' },
  { type: 'diamond', color: colors.pink, size: 25, x: '65%', y: '60%', meaning: 'detail' },
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
    case 'semicircle':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <path d="M 5 50 A 45 45 0 0 1 95 50 L 5 50" fill={color} />
        </svg>
      )
    case 'triangle':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <polygon points="50,5 95,90 5,90" fill={color} />
        </svg>
      )
    case 'diamond':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <polygon points="50,5 95,50 50,95 5,50" fill={color} />
        </svg>
      )
    case 'square':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <rect x="10" y="10" width="80" height="80" fill={color} />
        </svg>
      )
  }
}

export const FloatingShapes = memo(function FloatingShapes() {
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

      // Diamonds rotate slowly - precision in motion
      if (shape.type === 'diamond') {
        gsap.to(el, {
          rotation: 360,
          duration: gsap.utils.random(40, 60),
          ease: 'none',
          repeat: -1,
        })
      }

      // Semicircles sway gently - welcoming gesture
      if (shape.type === 'semicircle') {
        gsap.to(el, {
          rotation: gsap.utils.random(-8, 8),
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
    // Using yPercent to avoid conflicting with the y-based floating animations
    gsap.to(els, {
      yPercent: (i) => 20 + i * 8,
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        invalidateOnRefresh: true,
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
})
