import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function BackgroundElements() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches
      if (prefersReducedMotion) return

      // Floating circles animate on scroll
      gsap.utils.toArray<HTMLElement>('[data-float-shape]').forEach((el, i) => {
        gsap.to(el, {
          y: (i % 2 === 0 ? -100 : 100) * (1 + i * 0.3),
          rotation: (i % 2 === 0 ? 15 : -15),
          scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.5 + i * 0.5,
          },
        })
      })

      // Grid lines fade based on scroll position
      gsap.to('[data-grid-line]', {
        opacity: 0.03,
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: '30% top',
          scrub: true,
        },
      })
    },
    { scope: containerRef }
  )

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* Subtle grid pattern */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <div
            key={`v-${i}`}
            data-grid-line
            className="absolute top-0 bottom-0 w-px opacity-[0.06]"
            style={{
              left: `${(i + 1) * 12.5}%`,
              background: 'linear-gradient(to bottom, transparent, var(--color-grey-700), transparent)',
            }}
          />
        ))}
      </div>

      {/* Floating geometric shapes */}
      <div
        data-float-shape
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          top: '10%',
          right: '-10%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.015) 0%, transparent 70%)',
        }}
      />
      <div
        data-float-shape
        className="absolute w-[300px] h-[300px] rounded-full"
        style={{
          top: '60%',
          left: '-5%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.01) 0%, transparent 70%)',
        }}
      />
      <div
        data-float-shape
        className="absolute w-[200px] h-[200px]"
        style={{
          top: '40%',
          right: '10%',
          border: '1px solid rgba(255,255,255,0.03)',
          transform: 'rotate(45deg)',
        }}
      />

      {/* Accent line - diagonal */}
      <div
        className="absolute w-[1px] h-[40vh] origin-top"
        style={{
          top: '20%',
          left: '20%',
          background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.05), transparent)',
          transform: 'rotate(30deg)',
        }}
      />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}
