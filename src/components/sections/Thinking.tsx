import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { thoughtPieces } from '../../data/thinking'

gsap.registerPlugin(ScrollTrigger)

const categoryColors: Record<string, string> = {
  AI: 'var(--color-grey-300)',
  'Creative Tech': '#A78BFA',
  Design: '#FFD93D',
  Trust: '#5DADE2',
}

export function Thinking() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches
      if (prefersReducedMotion) return

      // Header animation
      gsap.from('[data-th-header]', {
        scrollTrigger: {
          trigger: '[data-th-header]',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      })

      // Stagger in the thought cards
      gsap.from('[data-thought-card]', {
        scrollTrigger: {
          trigger: '[data-thought-cards]',
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
      })
    },
    { scope: sectionRef }
  )

  return (
    <section ref={sectionRef} id="thinking" className="section relative">
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        {/* Section header */}
        <div data-th-header className="mb-10 sm:mb-16 md:mb-24">
          <p className="label mb-3 sm:mb-4">Thinking</p>
          <h2 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-[1.1] mb-4 sm:mb-6 text-glow">
            Where trust meets craft
          </h2>
          <p
            className="text-sm sm:text-base md:text-lg leading-relaxed max-w-xl"
            style={{ color: 'var(--color-grey-400)' }}
          >
            Writing from the intersection of production AI, creative practice, and the hard-won lessons of shipping at scale.
          </p>
        </div>

        {/* Thought pieces grid */}
        <div data-thought-cards className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-10">
          {thoughtPieces.map((piece) => (
            <article
              key={piece.id}
              data-thought-card
              className="group relative pt-6 sm:pt-8"
              style={{ borderTop: '1px solid var(--glass-border)' }}
            >
              {/* Category tag */}
              <span
                className="inline-block text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] mb-3 sm:mb-4"
                style={{ color: categoryColors[piece.category] || 'var(--color-grey-400)' }}
              >
                {piece.category}
              </span>

              {/* Title */}
              <h3 className="font-display text-lg sm:text-xl md:text-2xl font-semibold text-white tracking-tight mb-3 sm:mb-4 leading-tight">
                {piece.title}
              </h3>

              {/* Description */}
              <p
                className="text-xs sm:text-sm md:text-base leading-relaxed mb-4 sm:mb-6"
                style={{ color: 'var(--color-grey-300)' }}
              >
                {piece.description}
              </p>

              {/* Insights */}
              <ul className="space-y-3 sm:space-y-4">
                {piece.insights.map((insight, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-xs sm:text-sm leading-relaxed"
                    style={{ color: 'var(--color-grey-400)' }}
                  >
                    <span
                      className="shrink-0 mt-1.5 w-1 h-1 rounded-full"
                      style={{ background: categoryColors[piece.category] || 'var(--color-grey-500)', opacity: 0.6 }}
                    />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
