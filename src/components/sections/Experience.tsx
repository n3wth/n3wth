import { useRef, useState, useCallback, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { experiences } from '../../data/content'
import { ExperienceShapes } from '../shapes'

const INITIAL_COUNT = 3
const MD_BREAKPOINT = 768

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= MD_BREAKPOINT
  )
  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${MD_BREAKPOINT}px)`)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])
  return isDesktop
}

export function Experience() {
  const sectionRef = useRef<HTMLElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [showAll, setShowAll] = useState(false)
  const isDesktop = useIsDesktop()

  const visibleExperiences = showAll ? experiences : experiences.slice(0, INITIAL_COUNT)
  const hiddenCount = experiences.length - INITIAL_COUNT

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches
      if (prefersReducedMotion) return

      gsap.from('[data-exp-header]', {
        scrollTrigger: {
          trigger: '[data-exp-header]',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      })

      if (isDesktop && containerRef.current && trackRef.current) {
        // Desktop: horizontal scroll
        const track = trackRef.current
        const getScrollDistance = () => track.scrollWidth - window.innerWidth + 100

        const horizontalScroll = gsap.to(track, {
          x: () => -getScrollDistance(),
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: () => `+=${getScrollDistance()}`,
            pin: true,
            scrub: 0.5,
            anticipatePin: 1,
            fastScrollEnd: true,
            invalidateOnRefresh: true,
          },
        })

        const panels = gsap.utils.toArray<HTMLElement>('[data-role-card]')
        panels.forEach((panel) => {
          gsap.fromTo(
            panel.querySelector('[data-company]'),
            { x: 100, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: panel,
                start: 'left 90%',
                end: 'left 50%',
                scrub: 0.3,
                containerAnimation: horizontalScroll,
              },
            }
          )

          gsap.fromTo(
            panel.querySelectorAll('[data-detail]'),
            { y: 30, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              stagger: 0.05,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: panel,
                start: 'left 80%',
                end: 'left 40%',
                scrub: 0.3,
                containerAnimation: horizontalScroll,
              },
            }
          )
        })
      } else {
        // Mobile: vertical scroll-triggered reveals
        const cards = gsap.utils.toArray<HTMLElement>('[data-role-card]')
        cards.forEach((card) => {
          gsap.from(card, {
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
            y: 40,
            opacity: 0,
            duration: 0.6,
            ease: 'power3.out',
          })
        })
      }
    },
    { scope: sectionRef, dependencies: [showAll, isDesktop], revertOnUpdate: true }
  )

  const handleToggle = useCallback(() => {
    setShowAll((prev) => !prev)
    requestAnimationFrame(() => {
      ScrollTrigger.refresh()
    })
  }, [])

  return (
    <section ref={sectionRef} id="work" className="relative">
      <ExperienceShapes />

      <div className="section pb-0">
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <div data-exp-header className="mb-10 sm:mb-16 md:mb-20">
            <p className="label mb-3 sm:mb-4">Experience</p>
            <h2 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-[1.1] text-glow">
              Building AI products
              <br />
              at billion-user scale
            </h2>
            {hiddenCount > 0 && (
              <button
                onClick={handleToggle}
                aria-expanded={showAll}
                className="mt-4 sm:mt-6 flex items-center gap-2 font-mono text-xs sm:text-sm uppercase tracking-[0.12em] transition-colors duration-300 cursor-pointer hover:text-white"
                style={{ color: 'var(--color-grey-500)' }}
              >
                <span>{showAll ? 'Show recent' : `Show all experience (+${hiddenCount})`}</span>
                <ChevronDown
                  size={14}
                  className="transition-transform duration-300"
                  style={{ transform: showAll ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: vertical stacked cards */}
      <div className="md:hidden px-6">
        <div className="space-y-10">
          {visibleExperiences.map((exp) => (
            <article
              key={exp.id}
              data-role-card
              className="relative pl-5"
              style={{ borderLeft: '3px solid var(--color-white)' }}
            >
              <div className="mb-3">
                <span className="font-mono text-sm tracking-[0.2em] uppercase" style={{ color: 'var(--color-grey-400)' }}>
                  {exp.period}
                </span>
              </div>

              <h3 className="font-display text-3xl font-semibold text-white tracking-tighter leading-[0.9] mb-2 text-glow">
                {exp.company}
              </h3>

              <p
                className="font-display text-lg font-medium mb-3"
                style={{ color: 'var(--color-grey-100)' }}
              >
                {exp.role}
              </p>

              {exp.metric && (
                <div className="mb-4 mt-1">
                  <span className="font-display text-2xl font-semibold text-white">{exp.metric.value}</span>
                  <span className="ml-2 text-sm" style={{ color: 'var(--color-grey-400)' }}>{exp.metric.label}</span>
                </div>
              )}

              <p
                className="text-base leading-relaxed mb-4"
                style={{ color: 'var(--color-grey-300)' }}
              >
                {exp.description}
              </p>

              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {exp.tech.map((t, i) => (
                  <span
                    key={t}
                    className="text-sm font-mono uppercase tracking-wider"
                    style={{ color: 'var(--color-grey-500)' }}
                  >
                    {t}{i < exp.tech.length - 1 && <span className="ml-3">/</span>}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Desktop: horizontal scroll */}
      <div ref={containerRef} className="relative h-screen overflow-hidden hidden md:block">
        <div
          ref={trackRef}
          className="flex items-center h-full"
          style={{ width: 'max-content' }}
        >
          <div className="w-[8vw] shrink-0" />

          {visibleExperiences.map((exp) => (
            <article
              key={exp.id}
              data-role-card
              className="relative w-[70vw] lg:w-[55vw] shrink-0 h-full flex items-center"
            >
              <div
                className="absolute left-0 top-1/4 bottom-1/4 w-[3px]"
                style={{ background: 'var(--color-white)' }}
              />

              <div className="pl-8 lg:pl-12 pr-16 lg:pr-24">
                <div data-detail className="mb-6">
                  <span className="font-mono text-sm tracking-[0.2em] uppercase" style={{ color: 'var(--color-grey-400)' }}>
                    {exp.period}
                  </span>
                </div>

                <h3
                  data-company
                  className="font-display text-[clamp(2rem,8vw,9rem)] font-semibold text-white tracking-tighter leading-[0.9] mb-4 md:mb-6 text-glow"
                >
                  {exp.company}
                </h3>

                <p
                  data-detail
                  className="font-display text-2xl lg:text-3xl font-medium mb-4 sm:mb-6"
                  style={{ color: 'var(--color-grey-100)' }}
                >
                  {exp.role}
                </p>

                {exp.metric && (
                  <div data-detail className="mb-4 sm:mb-6">
                    <span className="font-display text-3xl lg:text-4xl font-semibold text-white">{exp.metric.value}</span>
                    <span className="ml-3 text-base lg:text-lg" style={{ color: 'var(--color-grey-400)' }}>{exp.metric.label}</span>
                  </div>
                )}

                <p
                  data-detail
                  className="text-lg md:text-xl leading-relaxed max-w-lg mb-6 sm:mb-8"
                  style={{ color: 'var(--color-grey-300)' }}
                >
                  {exp.description}
                </p>

                <div data-detail className="flex flex-wrap gap-x-4 gap-y-2">
                  {exp.tech.map((t, i) => (
                    <span
                      key={t}
                      className="text-sm font-mono uppercase tracking-wider"
                      style={{ color: 'var(--color-grey-500)' }}
                    >
                      {t}{i < exp.tech.length - 1 && <span className="ml-4">/</span>}
                    </span>
                  ))}
                </div>
              </div>

            </article>
          ))}

          <div className="w-[15vw] shrink-0" />
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3" style={{ color: 'var(--color-grey-500)' }}>
          <span className="text-sm font-mono uppercase tracking-[0.2em]">Scroll</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </section>
  )
}
