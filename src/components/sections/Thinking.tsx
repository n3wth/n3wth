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

  const featured = thoughtPieces[0]
  const supporting = thoughtPieces.slice(1)

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

      // Featured piece enters first
      gsap.from('[data-thought-featured]', {
        scrollTrigger: {
          trigger: '[data-thought-cards]',
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
        y: 60,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
      })

      // Pull quote slides in after featured
      gsap.from('[data-thought-quote]', {
        scrollTrigger: {
          trigger: '[data-thought-cards]',
          start: 'top 70%',
          toggleActions: 'play none none reverse',
        },
        x: -30,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
      })

      // Supporting cards stagger in
      gsap.from('[data-thought-card]', {
        scrollTrigger: {
          trigger: '[data-thought-supporting]',
          start: 'top 80%',
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

        <div data-thought-cards>
          {/* Featured piece - full width, editorial treatment */}
          <article
            data-thought-featured
            className="relative mb-12 md:mb-16 lg:mb-20 pt-6 sm:pt-8"
            style={{ borderTop: '1px solid var(--glass-border)' }}
          >
            <span
              className="inline-block text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] mb-4 sm:mb-5"
              style={{ color: categoryColors[featured.category] || 'var(--color-grey-400)' }}
            >
              {featured.category}
            </span>

            <h3 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-white tracking-tight mb-4 sm:mb-6 md:mb-8 leading-[1.1]">
              {featured.title}
            </h3>

            <p
              className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed mb-8 sm:mb-10 md:mb-12 max-w-3xl"
              style={{ color: 'var(--color-grey-300)' }}
            >
              {featured.description}
            </p>

            {/* Pull quote - first insight elevated */}
            <blockquote
              data-thought-quote
              className="pl-5 sm:pl-6 md:pl-8 mb-8 sm:mb-10 max-w-3xl"
              style={{ borderLeft: `2px solid ${categoryColors[featured.category] || 'var(--color-grey-400)'}` }}
            >
              <p
                className="text-sm sm:text-base md:text-lg leading-relaxed"
                style={{ color: 'var(--color-grey-200)' }}
              >
                {featured.insights[0]}
              </p>
            </blockquote>

            {/* Remaining insights */}
            <ul className="space-y-3 sm:space-y-4">
              {featured.insights.slice(1).map((insight, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-xs sm:text-sm leading-relaxed"
                  style={{ color: 'var(--color-grey-400)' }}
                >
                  <span
                    className="shrink-0 mt-1.5 w-1 h-1 rounded-full"
                    style={{ background: categoryColors[featured.category] || 'var(--color-grey-500)', opacity: 0.6 }}
                  />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </article>

          {/* Supporting pieces - 3 column on desktop */}
          <div
            data-thought-supporting
            className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10"
          >
            {supporting.map((piece) => (
              <article
                key={piece.id}
                data-thought-card
                className="group relative pt-6 sm:pt-8"
                style={{ borderTop: '1px solid var(--glass-border)' }}
              >
                <span
                  className="inline-block text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] mb-3 sm:mb-4"
                  style={{ color: categoryColors[piece.category] || 'var(--color-grey-400)' }}
                >
                  {piece.category}
                </span>

                <h3 className="font-display text-lg sm:text-xl font-semibold text-white tracking-tight mb-3 sm:mb-4 leading-tight">
                  {piece.title}
                </h3>

                <p
                  className="text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6"
                  style={{ color: 'var(--color-grey-300)' }}
                >
                  {piece.description}
                </p>

                <ul className="space-y-3">
                  {piece.insights.map((insight, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-xs leading-relaxed"
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
      </div>
    </section>
  )
}
