import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

interface ShapeConfig {
  shape: 'circle' | 'square' | 'triangle' | 'diamond'
  color: string
  size: number
  top: string
  right: string
  animation: 'float' | 'spin' | 'pulse' | 'bounce'
}

const shapes: ShapeConfig[] = [
  { shape: 'circle', color: '#FF6B9D', size: 80, top: '15%', right: '12%', animation: 'pulse' },
  { shape: 'diamond', color: '#FFD93D', size: 50, top: '35%', right: '25%', animation: 'spin' },
  { shape: 'triangle', color: '#5DADE2', size: 45, top: '60%', right: '10%', animation: 'bounce' },
  { shape: 'square', color: '#A78BFA', size: 40, top: '25%', right: '40%', animation: 'float' },
  { shape: 'circle', color: '#2ECC71', size: 30, top: '70%', right: '30%', animation: 'spin' },
  { shape: 'diamond', color: '#FF7F50', size: 35, top: '50%', right: '45%', animation: 'pulse' },
]

function ShapeSVG({ shape, color, size }: { shape: ShapeConfig['shape']; color: string; size: number }) {
  const half = size / 2

  switch (shape) {
    case 'circle':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={half} cy={half} r={half * 0.9} fill={color} />
        </svg>
      )
    case 'square':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <rect x={size * 0.1} y={size * 0.1} width={size * 0.8} height={size * 0.8} fill={color} />
        </svg>
      )
    case 'triangle':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <polygon points={`${half},${size * 0.1} ${size * 0.9},${size * 0.9} ${size * 0.1},${size * 0.9}`} fill={color} />
        </svg>
      )
    case 'diamond':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <polygon points={`${half},${size * 0.1} ${size * 0.9},${half} ${half},${size * 0.9} ${size * 0.1},${half}`} fill={color} />
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

    const elements = containerRef.current.querySelectorAll('.floating-shape')

    // Staggered entrance with elastic bounce
    gsap.fromTo(
      elements,
      { opacity: 0, scale: 0, rotation: -180 },
      {
        opacity: 0.7,
        scale: 1,
        rotation: 0,
        duration: 1,
        ease: 'elastic.out(1, 0.5)',
        stagger: { amount: 0.8, from: 'random' },
      }
    )

    // Individual animations based on type
    elements.forEach((el, i) => {
      const anim = shapes[i]?.animation || 'float'

      switch (anim) {
        case 'spin':
          gsap.to(el, {
            rotation: 360,
            duration: 8 + i * 2,
            ease: 'none',
            repeat: -1,
          })
          gsap.to(el, {
            y: 'random(-20, 20)',
            x: 'random(-15, 15)',
            duration: 4 + i,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
          })
          break

        case 'pulse':
          gsap.to(el, {
            scale: 1.2,
            opacity: 0.9,
            duration: 1.5 + i * 0.3,
            ease: 'power1.inOut',
            yoyo: true,
            repeat: -1,
          })
          gsap.to(el, {
            y: 'random(-30, 30)',
            x: 'random(-20, 20)',
            duration: 6 + i,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
          })
          break

        case 'bounce':
          gsap.to(el, {
            y: -30,
            duration: 0.8 + i * 0.1,
            ease: 'power2.out',
            yoyo: true,
            repeat: -1,
          })
          gsap.to(el, {
            x: 'random(-25, 25)',
            rotation: 'random(-15, 15)',
            duration: 5 + i,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
          })
          break

        case 'float':
        default:
          gsap.to(el, {
            y: 'random(-40, 40)',
            x: 'random(-30, 30)',
            rotation: 'random(-20, 20)',
            duration: 10 + i * 2,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
          })
      }
    })
  }, { scope: containerRef })

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      {shapes.map((s, i) => (
        <div
          key={i}
          className="floating-shape absolute hidden md:block"
          style={{ top: s.top, right: s.right }}
        >
          <ShapeSVG shape={s.shape} color={s.color} size={s.size} />
        </div>
      ))}
    </div>
  )
}
