import { useRef, useState, useCallback } from 'react'
import { ChevronDown } from 'lucide-react'
import { gsap, useGSAP } from '../../lib/gsap'
import { frameworks } from '../../data/content'

const INITIAL_COUNT = 3

export function Frameworks() {
  const sectionRef = useRef<HTMLElement>(null)
  const hiddenRef = useRef<HTMLDivElement>(null)
  const [showAll, setShowAll] = useState(false)

  const visibleFrameworks = frameworks.slice(0, INITIAL_COUNT)
  const hiddenFrameworks = frameworks.slice(INITIAL_COUNT)

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches
      if (prefersReducedMotion) return

      gsap.from('[data-fw-header]', {
        scrollTrigger: {
          trigger: '[data-fw-header]',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      })

      gsap.from('[data-principle]', {
        scrollTrigger: {
          trigger: '[data-principles]',
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

  const handleToggle = useCallback(() => {
    const next = !showAll
    setShowAll(next)

    if (!hiddenRef.current) return

    if (next) {
      gsap.set(hiddenRef.current, { height: 'auto', overflow: 'visible' })
      gsap.from(hiddenRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
      })
      gsap.from(hiddenRef.current.querySelectorAll('[data-hidden-principle]'), {
        y: 30,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.15,
      })
    } else {
      gsap.to(hiddenRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.4,
        ease: 'power3.inOut',
        onComplete: () => {
          if (hiddenRef.current) {
            gsap.set(hiddenRef.current, { overflow: 'hidden' })
          }
        },
      })
    }
  }, [showAll])

  return (
    <section ref={sectionRef} id="frameworks" className="section relative">
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        <div data-fw-header className="mb-10 sm:mb-16 md:mb-24">
          <p className="label mb-3 sm:mb-4">After a decade of building</p>
          <h2 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-[1.1] mb-4 sm:mb-6 text-glow">
            Four things I believe
          </h2>
          <p
            className="text-sm sm:text-base md:text-lg leading-relaxed max-w-xl"
            style={{ color: 'var(--color-grey-400)' }}
          >
            Principles I've developed from shipping AI products at Google, Meta, and Microsoft.
          </p>
        </div>

        <div data-principles className="space-y-6 sm:space-y-8 md:space-y-10">
          {visibleFrameworks.map((fw, index) => (
            <article
              key={fw.id}
              data-principle
              className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 md:gap-8 pt-6 sm:pt-8 md:pt-10"
              style={{ borderTop: '1px solid var(--glass-border)' }}
            >
              <div className="md:col-span-1 flex-shrink-0">
                <span
                  className="font-mono text-xs sm:text-sm"
                  style={{ color: 'var(--color-grey-600)' }}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              <div className="md:col-span-11">
                <h3 className="font-display text-base sm:text-lg md:text-2xl lg:text-3xl font-semibold text-white tracking-tight mb-1 sm:mb-2 md:mb-4">
                  {fw.title}
                </h3>
                <p
                  className="text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed max-w-2xl"
                  style={{ color: 'var(--color-grey-300)' }}
                >
                  {fw.tagline}
                </p>
              </div>
            </article>
          ))}
        </div>

        {hiddenFrameworks.length > 0 && (
          <>
            <div
              ref={hiddenRef}
              className="space-y-6 sm:space-y-8 md:space-y-10"
              style={{ height: showAll ? 'auto' : 0, overflow: 'hidden', opacity: showAll ? 1 : 0 }}
            >
              {hiddenFrameworks.map((fw, index) => (
                <article
                  key={fw.id}
                  data-hidden-principle
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 md:gap-8 pt-6 sm:pt-8 md:pt-10"
                  style={{ borderTop: '1px solid var(--glass-border)' }}
                >
                  <div className="md:col-span-1 flex-shrink-0">
                    <span
                      className="font-mono text-xs sm:text-sm"
                      style={{ color: 'var(--color-grey-600)' }}
                    >
                      {String(INITIAL_COUNT + index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="md:col-span-11">
                    <h3 className="font-display text-base sm:text-lg md:text-2xl lg:text-3xl font-semibold text-white tracking-tight mb-1 sm:mb-2 md:mb-4">
                      {fw.title}
                    </h3>
                    <p
                      className="text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed max-w-2xl"
                      style={{ color: 'var(--color-grey-300)' }}
                    >
                      {fw.tagline}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <button
              onClick={handleToggle}
              className="mt-8 sm:mt-10 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] transition-colors duration-300 cursor-pointer hover:text-white"
              style={{ color: 'var(--color-grey-500)' }}
            >
              <span>{showAll ? 'Show fewer' : `View all frameworks (+${hiddenFrameworks.length})`}</span>
              <ChevronDown
                size={14}
                className="transition-transform duration-300"
                style={{ transform: showAll ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
            </button>
          </>
        )}
      </div>
    </section>
  )
}
