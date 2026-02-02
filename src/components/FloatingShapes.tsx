import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { Shape, CompositeShape, type CompositePreset, type ShapeType, type PatternType } from '@n3wth/ui'

interface FloatingElement {
  type: 'shape' | 'composite'
  shapeType?: ShapeType
  color?: string
  pattern?: PatternType
  patternColors?: string[]
  preset?: CompositePreset
  size: number
  top: string
  right: string
  rotation?: number
}

// Shapes representing Oliver's work: AI, tech, art, light
const floatingElements: FloatingElement[] = [
  // Composite shapes
  { type: 'composite', preset: 'rainbow-arc', size: 120, top: '12%', right: '10%' },
  { type: 'composite', preset: 'orbit', size: 70, top: '35%', right: '35%' },
  { type: 'composite', preset: 'cluster', size: 80, top: '65%', right: '8%' },

  // Patterned shapes - tech/grid feel
  { type: 'shape', shapeType: 'circle', color: '#A78BFA', pattern: 'checkered', patternColors: ['#A78BFA', '#7C3AED'], size: 80, top: '50%', right: '20%' },
  { type: 'shape', shapeType: 'square', color: '#2ECC71', pattern: 'striped', patternColors: ['#2ECC71', '#059669'], size: 55, top: '75%', right: '30%', rotation: 15 },

  // Solid accent shapes - LED art inspired
  { type: 'shape', shapeType: 'arc', color: '#FF6B9D', size: 90, top: '25%', right: '25%', rotation: -30 },
  { type: 'shape', shapeType: 'diamond', color: '#FFD93D', size: 40, top: '55%', right: '38%' },
  { type: 'shape', shapeType: 'triangle', color: '#5DADE2', size: 35, top: '18%', right: '40%', rotation: 10 },
  { type: 'shape', shapeType: 'circle', color: '#FF7F50', size: 25, top: '80%', right: '15%' },
  { type: 'shape', shapeType: 'star', color: '#F39C12', size: 30, top: '40%', right: '45%' },
]

export function FloatingShapes() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!containerRef.current) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const shapes = containerRef.current.querySelectorAll('.floating-shape')
    const ctx = gsap.context(() => {
      // Stagger entrance
      gsap.fromTo(
        shapes,
        { opacity: 0, scale: 0.8 },
        {
          opacity: 0.6,
          scale: 1,
          duration: 1.2,
          delay: (i: number) => 0.4 + i * 0.08,
          ease: 'power2.out',
          stagger: 0.05,
        }
      )

      // Floating animation
      shapes.forEach((shape, i) => {
        const timeline = gsap.timeline({ repeat: -1, yoyo: true })

        timeline.to(shape, {
          x: `random(-40, 40)`,
          duration: 12 + i * 1.2,
          ease: 'sine.inOut',
        }, 0)

        timeline.to(shape, {
          y: `random(-30, 30)`,
          duration: 14 + i * 1.5,
          ease: 'sine.inOut',
        }, 0)

        timeline.to(shape, {
          rotation: `random(-12, 12)`,
          duration: 16 + i * 1.8,
          ease: 'sine.inOut',
        }, 0)
      })
    }, containerRef)

    return () => ctx.revert()
  }, { scope: containerRef })

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      {floatingElements.map((element, i) => (
        <div
          key={i}
          className="floating-shape absolute hidden md:block"
          style={{
            top: element.top,
            right: element.right,
            transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
          }}
        >
          {element.type === 'composite' && element.preset ? (
            <CompositeShape preset={element.preset} scale={element.size / 100} />
          ) : (
            <Shape
              type={element.shapeType || 'circle'}
              size={element.size}
              color={element.color}
              pattern={element.pattern}
              patternColors={element.patternColors}
            />
          )}
        </div>
      ))}
    </div>
  )
}
