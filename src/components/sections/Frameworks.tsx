import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { frameworks } from '../../data/content'

gsap.registerPlugin(ScrollTrigger)

export function Frameworks() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches
      if (prefersReducedMotion) return

      // Header animation
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

      // Stagger in the principles
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

  return (
    <section ref={sectionRef} id="frameworks" className="section relative">
      <div className="mx-auto max-w-5xl px-6 md:px-12">
        {/* Section header with narrative context */}
        <div data-fw-header className="mb-16 md:mb-24">
          <p className="label mb-4">After a decade of building</p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-[1.1] mb-6">
            Four things I believe
          </h2>
          <p
            className="text-base md:text-lg leading-relaxed max-w-xl"
            style={{ color: 'var(--color-grey-400)' }}
          >
            Principles I've developed from shipping AI products at Google, Meta, and Microsoft.
          </p>
        </div>

        {/* Principles - simple, focused on content */}
        <div data-principles className="space-y-12 md:space-y-16">
          {frameworks.map((fw, index) => (
            <article
              key={fw.id}
              data-principle
              className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8"
            >
              {/* Number */}
              <div className="md:col-span-1">
                <span
                  className="font-mono text-sm"
                  style={{ color: 'var(--color-grey-600)' }}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              {/* Content */}
              <div className="md:col-span-11">
                <h3 className="font-display text-xl sm:text-2xl md:text-3xl font-semibold text-white tracking-tight mb-4">
                  {fw.title}
                </h3>
                <p
                  className="text-base md:text-lg leading-relaxed max-w-2xl"
                  style={{ color: 'var(--color-grey-300)' }}
                >
                  {fw.tagline}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
