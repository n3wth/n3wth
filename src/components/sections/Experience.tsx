import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { experiences } from '../../data/content'
import { ExperienceShapes } from '../shapes'

gsap.registerPlugin(ScrollTrigger)

export function Experience() {
  const sectionRef = useRef<HTMLElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches
      if (prefersReducedMotion) return

      if (!containerRef.current || !trackRef.current) return

      // Header animation
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

      // Calculate scroll distance for horizontal scroll
      const track = trackRef.current
      const scrollDistance = track.scrollWidth - window.innerWidth + 100

      // Horizontal scroll animation with smooth easing
      const horizontalScroll = gsap.to(track, {
        x: -scrollDistance,
        ease: 'power1.inOut',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: () => `+=${scrollDistance * 1.2}`,
          pin: true,
          scrub: 1.5,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      // Animate each role panel using the horizontal scroll as container
      const panels = gsap.utils.toArray<HTMLElement>('[data-role-card]')
      panels.forEach((panel) => {
        // Company name reveal
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

        // Details stagger in
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
    },
    { scope: sectionRef }
  )

  return (
    <section ref={sectionRef} id="work" className="relative">
      {/* Geometric shapes - career trajectory */}
      <ExperienceShapes />

      {/* Header */}
      <div className="section pb-0">
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <div data-exp-header className="mb-16 md:mb-20">
            <p className="label mb-4">Experience</p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-[1.1] text-glow">
              Building AI products
              <br />
              at billion-user scale
            </h2>
          </div>
        </div>
      </div>

      {/* Horizontal scroll container */}
      <div ref={containerRef} className="relative h-screen overflow-hidden">
        {/* Horizontal track */}
        <div
          ref={trackRef}
          className="flex items-center h-full"
          style={{ width: 'max-content' }}
        >
          {/* Initial spacer */}
          <div className="w-[8vw] shrink-0" />

          {experiences.map((exp) => (
            <article
              key={exp.id}
              data-role-card
              className="relative w-[85vw] md:w-[70vw] lg:w-[55vw] shrink-0 h-full flex items-center"
            >
              {/* Vertical accent line */}
              <div
                className="absolute left-0 top-1/4 bottom-1/4 w-[3px]"
                style={{ background: 'var(--color-white)' }}
              />

              {/* Content */}
              <div className="pl-8 md:pl-12 pr-16 md:pr-24">
                {/* Period - large monospace */}
                <div data-detail className="mb-6">
                  <span className="font-mono text-xs tracking-[0.3em] uppercase" style={{ color: 'var(--color-grey-400)' }}>
                    {exp.period}
                  </span>
                </div>

                {/* Company - massive */}
                <h3
                  data-company
                  className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-[9rem] font-semibold text-white tracking-tighter leading-[0.9] mb-6 text-glow"
                >
                  {exp.company}
                </h3>

                {/* Role */}
                <p
                  data-detail
                  className="font-display text-xl md:text-2xl lg:text-3xl font-medium mb-6"
                  style={{ color: 'var(--color-grey-100)' }}
                >
                  {exp.role}
                </p>

                {/* Description */}
                <p
                  data-detail
                  className="text-base md:text-lg leading-relaxed max-w-lg mb-8"
                  style={{ color: 'var(--color-grey-300)' }}
                >
                  {exp.description}
                </p>

                {/* Tech - simple inline list */}
                <div data-detail className="flex flex-wrap gap-x-4 gap-y-2">
                  {exp.tech.map((t, i) => (
                    <span
                      key={t}
                      className="text-xs font-mono uppercase tracking-wider"
                      style={{ color: 'var(--color-grey-500)' }}
                    >
                      {t}{i < exp.tech.length - 1 && <span className="ml-4">/</span>}
                    </span>
                  ))}
                </div>
              </div>

            </article>
          ))}

          {/* End spacer */}
          <div className="w-[15vw] shrink-0" />
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3" style={{ color: 'var(--color-grey-500)' }}>
          <span className="text-xs font-mono uppercase tracking-[0.2em]">Scroll</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </section>
  )
}
