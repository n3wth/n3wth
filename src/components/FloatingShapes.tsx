import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

const colors = {
  pink: '#FF6B9D',
  yellow: '#FFD93D',
  blue: '#5DADE2',
  purple: '#A78BFA',
  green: '#2ECC71',
  orange: '#FF7F50',
  coral: '#FF8A80',
  mint: '#64FFDA',
}

interface ShapeConfig {
  type: 'circle' | 'ring' | 'half' | 'quarter' | 'triangle' | 'cross' | 'dots' | 'arc'
  color: string
  size: number
  x: string
  y: string
}

const shapes: ShapeConfig[] = [
  // Large accent shapes
  { type: 'ring', color: colors.pink, size: 120, x: '85%', y: '10%' },
  { type: 'half', color: colors.yellow, size: 100, x: '75%', y: '55%' },
  { type: 'arc', color: colors.blue, size: 140, x: '60%', y: '75%' },

  // Medium shapes
  { type: 'quarter', color: colors.purple, size: 70, x: '90%', y: '40%' },
  { type: 'cross', color: colors.green, size: 50, x: '70%', y: '25%' },
  { type: 'dots', color: colors.orange, size: 80, x: '55%', y: '45%' },

  // Small accents
  { type: 'circle', color: colors.coral, size: 25, x: '80%', y: '70%' },
  { type: 'circle', color: colors.mint, size: 20, x: '65%', y: '15%' },
  { type: 'triangle', color: colors.yellow, size: 35, x: '92%', y: '60%' },
  { type: 'circle', color: colors.purple, size: 15, x: '58%', y: '85%' },
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
    case 'half':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <path d="M 50 5 A 45 45 0 0 1 50 95" fill={color} />
        </svg>
      )
    case 'quarter':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <path d="M 50 50 L 50 5 A 45 45 0 0 1 95 50 Z" fill={color} />
        </svg>
      )
    case 'triangle':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <polygon points="50,10 90,90 10,90" fill={color} />
        </svg>
      )
    case 'cross':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <rect x="40" y="10" width="20" height="80" fill={color} />
          <rect x="10" y="40" width="80" height="20" fill={color} />
        </svg>
      )
    case 'dots':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <circle cx="25" cy="25" r="12" fill={color} />
          <circle cx="75" cy="25" r="12" fill={color} />
          <circle cx="25" cy="75" r="12" fill={color} />
          <circle cx="75" cy="75" r="12" fill={color} />
        </svg>
      )
    case 'arc':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <path d="M 10 80 Q 50 10 90 80" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" />
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

    // Dramatic staggered entrance
    gsap.fromTo(
      els,
      {
        opacity: 0,
        scale: 0,
        rotation: () => gsap.utils.random(-180, 180),
      },
      {
        opacity: 0.8,
        scale: 1,
        rotation: 0,
        duration: 1.2,
        ease: 'back.out(1.7)',
        stagger: { amount: 1, from: 'random' },
      }
    )

    // Unique animation per shape
    els.forEach((el, i) => {
      const shape = shapes[i]
      const isLarge = shape.size > 80

      // Floating motion - all shapes drift
      gsap.to(el, {
        x: () => gsap.utils.random(-30, 30),
        y: () => gsap.utils.random(-25, 25),
        duration: gsap.utils.random(8, 14),
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: i * 0.2,
      })

      // Rotation - varies by shape type
      if (['ring', 'cross', 'dots'].includes(shape.type)) {
        gsap.to(el, {
          rotation: 360,
          duration: gsap.utils.random(15, 25),
          ease: 'none',
          repeat: -1,
        })
      } else if (['quarter', 'half'].includes(shape.type)) {
        gsap.to(el, {
          rotation: gsap.utils.random(-30, 30),
          duration: gsap.utils.random(6, 10),
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        })
      }

      // Pulse for large shapes
      if (isLarge) {
        gsap.to(el, {
          scale: gsap.utils.random(0.9, 1.1),
          opacity: gsap.utils.random(0.6, 0.9),
          duration: gsap.utils.random(3, 5),
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: i * 0.3,
        })
      }

      // Small shapes get playful bounce
      if (shape.size < 30) {
        gsap.to(el, {
          y: '-=15',
          duration: gsap.utils.random(0.6, 1),
          ease: 'power1.inOut',
          yoyo: true,
          repeat: -1,
        })
      }
    })

    // Occasional "pop" effect on random shapes
    const pop = () => {
      const randomEl = els[Math.floor(Math.random() * els.length)]
      gsap.to(randomEl, {
        scale: 1.3,
        duration: 0.2,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
      })
    }
    const popInterval = setInterval(pop, 4000)

    return () => clearInterval(popInterval)
  }, { scope: containerRef })

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      {shapes.map((s, i) => (
        <div
          key={i}
          className="shape absolute hidden md:block"
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
