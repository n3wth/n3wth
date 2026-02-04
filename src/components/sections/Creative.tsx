import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { installations } from '../../data/content'
import { CreativeShapes } from '../shapes'

export function Creative() {
  const sectionRef = useRef<HTMLElement>(null)
  const backgroundsRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches
      if (prefersReducedMotion) return

      // Hide all shapes (both floating and art shapes) when in creative section to keep images clean
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top bottom',
        end: 'bottom top',
        invalidateOnRefresh: true,
        onEnter: () => {
          gsap.to('[data-float-shape], .art-shape', { opacity: 0, duration: 0.4, pointerEvents: 'none' })
        },
        onLeave: () => {
          gsap.to('[data-float-shape]', { opacity: (i) => [0.015, 0.01, 0][i] || 0.015, duration: 0.6 })
          gsap.to('.art-shape', { opacity: (i) => [0.35, 0.35, 0.3, 0.3][i] || 0.35, duration: 0.6 })
        },
        onEnterBack: () => {
          gsap.to('[data-float-shape], .art-shape', { opacity: 0, duration: 0.4 })
        },
        onLeaveBack: () => {
          gsap.to('[data-float-shape]', { opacity: (i) => [0.015, 0.01, 0][i] || 0.015, duration: 0.6 })
          gsap.to('.art-shape', { opacity: (i) => [0.35, 0.35, 0.3, 0.3][i] || 0.35, duration: 0.6 })
        },
      })

      // Header animation
      gsap.from('[data-cr-header]', {
        scrollTrigger: {
          trigger: '[data-cr-header]',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'expo.out',
      })

      // Each installation panel triggers its background
      const panels = gsap.utils.toArray<HTMLElement>('[data-installation-panel]')
      const backgrounds = gsap.utils.toArray<HTMLElement>('[data-installation-bg]')
      const backgroundsContainer = backgroundsRef.current

      // Helper to hide all backgrounds
      const hideAllBackgrounds = () => {
        backgrounds.forEach(bg => {
          gsap.to(bg, { opacity: 0, duration: 0.4, ease: 'power2.out' })
        })
      }

      // Master trigger: hide all backgrounds when section is not in view
      // This prevents backgrounds from showing in Contact/Footer sections
      if (backgroundsContainer) {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          invalidateOnRefresh: true,
          onLeave: hideAllBackgrounds,
          onLeaveBack: hideAllBackgrounds,
        })
      }

      panels.forEach((panel, i) => {
        const bg = backgrounds[i]
        const backdrop = panel.querySelector('[data-inst-backdrop]')
        const label = panel.querySelector('[data-inst-label]')
        const title = panel.querySelector('[data-inst-title]')
        const tagline = panel.querySelector('[data-inst-tagline]')
        const meta = panel.querySelector('[data-inst-meta]')
        if (!bg) return

        // Background crossfade
        ScrollTrigger.create({
          trigger: panel,
          start: 'top 60%',
          end: 'bottom 40%',
          invalidateOnRefresh: true,
          onEnter: () => {
            hideAllBackgrounds()
            gsap.to(bg, { opacity: 1, duration: 0.6, ease: 'power2.inOut' })
          },
          onLeave: () => {
            gsap.to(bg, { opacity: 0, duration: 0.4, ease: 'power2.out' })
          },
          onEnterBack: () => {
            hideAllBackgrounds()
            gsap.to(bg, { opacity: 1, duration: 0.6, ease: 'power2.inOut' })
          },
          onLeaveBack: () => {
            gsap.to(bg, { opacity: 0, duration: 0.4, ease: 'power2.out' })
          },
        })

        // Text elements for staggered animation
        const textElements = [label, title, tagline, meta].filter(Boolean)

        // Backdrop blur fade IN
        if (backdrop) {
          gsap.fromTo(backdrop,
            { opacity: 0 },
            {
              opacity: 1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: panel,
                start: 'top 85%',
                end: 'top 40%',
                scrub: 0.5,
              },
            }
          )
        }

        // Text fade IN - staggered entrance as panel scrolls into view
        textElements.forEach((el, index) => {
          gsap.fromTo(el,
            { opacity: 0, y: 30 + index * 8 },
            {
              opacity: 1,
              y: 0,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: panel,
                start: `top ${80 - index * 5}%`,
                end: `top ${35 - index * 3}%`,
                scrub: 0.5,
              },
            }
          )
        })

        // Backdrop blur fade OUT
        if (backdrop) {
          gsap.fromTo(backdrop,
            { opacity: 1 },
            {
              opacity: 0,
              ease: 'power2.in',
              scrollTrigger: {
                trigger: panel,
                start: 'bottom 65%',
                end: 'bottom 25%',
                scrub: 0.5,
              },
            }
          )
        }

        // Text fade OUT - staggered exit as panel scrolls away
        textElements.forEach((el, index) => {
          gsap.fromTo(el,
            { opacity: 1, y: 0 },
            {
              opacity: 0,
              y: -25 - index * 6,
              ease: 'power2.in',
              scrollTrigger: {
                trigger: panel,
                start: `bottom ${70 - index * 3}%`,
                end: `bottom ${30 - index * 2}%`,
                scrub: 0.5,
              },
            }
          )
        })
      })

    },
    { scope: sectionRef }
  )

  return (
    <section ref={sectionRef} id="creative" className="relative">
      {/* Art-inspired geometric shapes */}
      <CreativeShapes />

      {/* Fixed background container - z-[1] to sit above BackgroundElements */}
      <div
        ref={backgroundsRef}
        className="fixed inset-0 pointer-events-none z-[1]"
        aria-hidden="true"
      >
        {installations.map((inst) => (
          <div
            key={`bg-${inst.id}`}
            data-installation-bg
            className="absolute inset-0 opacity-0"
          >
            <img
              src={inst.image}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header - narrative transition */}
        <div className="section">
          <div className="mx-auto max-w-6xl px-6 md:px-12">
            <div data-cr-header>
              <p className="label mb-3 sm:mb-4">After hours</p>
              <h2 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-[1.1] mb-4 sm:mb-6 text-glow">
                I build things that glow
              </h2>
              <p
                className="text-sm sm:text-base md:text-lg leading-relaxed max-w-xl"
                style={{ color: 'var(--color-grey-400)' }}
              >
                Large-scale LED installations for Burning Man and public memorials. I spoke at Robot Heart about how art and technology intersect.
              </p>
            </div>
          </div>
        </div>

        {/* Installation panels - each one is fullscreen height */}
        {installations.map((inst) => {
          const textColor = inst.lightBg ? 'black' : 'white'
          return (
            <div
              key={inst.id}
              data-installation-panel
              data-light-bg={inst.lightBg ? 'true' : undefined}
              className="min-h-screen flex items-center relative"
            >
              <div className="mx-auto max-w-6xl px-3 sm:px-4 md:px-6 lg:px-12 w-full py-8 sm:py-12 md:py-16 lg:py-24">
                <article
                  data-installation-card
                  className="max-w-full sm:max-w-xl relative"
                >
                  {/* Gaussian blur backdrop for readability */}
                  <div
                    data-inst-backdrop
                    className="absolute -inset-4 sm:-inset-6 md:-inset-8 lg:-inset-12 -z-10 rounded-2xl sm:rounded-3xl"
                    style={{
                      background: inst.lightBg
                        ? 'radial-gradient(ellipse 120% 100% at 20% 50%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.3) 50%, transparent 80%)'
                        : 'radial-gradient(ellipse 120% 100% at 20% 50%, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 50%, transparent 80%)',
                      backdropFilter: 'blur(40px)',
                      WebkitBackdropFilter: 'blur(40px)',
                    }}
                  />
                  <span
                    data-inst-label
                    className="inline-block text-xs font-mono uppercase tracking-wider mb-4"
                    style={{ color: textColor, opacity: 0.7 }}
                  >
                    {inst.type.replace('-', ' ')}
                  </span>

                  <h3
                    data-inst-title
                    className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold mb-2 sm:mb-3 tracking-tight"
                    style={{ color: textColor }}
                  >
                    {inst.title}
                  </h3>

                  <p
                    data-inst-tagline
                    className="text-sm sm:text-lg leading-relaxed mb-4 sm:mb-6"
                    style={{ color: textColor, opacity: 0.85 }}
                  >
                    {inst.tagline}
                  </p>

                  <div
                    data-inst-meta
                    className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm"
                  >
                    <span style={{ color: textColor, opacity: 0.9 }}>{inst.year}</span>
                    <span style={{ color: textColor, opacity: 0.4 }}>/</span>
                    <span style={{ color: textColor, opacity: 0.7 }}>{inst.location}</span>
                  </div>
                </article>
              </div>
            </div>
          )
        })}

      </div>
    </section>
  )
}
