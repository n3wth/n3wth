import { useRef, useState, useEffect } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { installations } from '../../data/content'
import { CreativeShapes } from '../shapes'

export function Creative() {
  const sectionRef = useRef<HTMLElement>(null)
  const backgroundsRef = useRef<HTMLDivElement>(null)
  const [imagesLoaded, setImagesLoaded] = useState(false)

  // Only mount fixed background images when section is approaching viewport
  // position:fixed elements defeat loading="lazy"
  useEffect(() => {
    if (!sectionRef.current || imagesLoaded) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImagesLoaded(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200% 0px' } // Start loading 2 viewports before visible
    )
    observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [imagesLoaded])

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches
      if (prefersReducedMotion) return

      // Hide ALL decorative shapes when creative section is in view to keep images clean
      const allShapes = '[data-float-shape], .art-shape, .shape, .exp-shape, .contact-shape'
      const hideShapes = () => {
        gsap.to(allShapes, { opacity: 0, duration: 0.4, overwrite: true, pointerEvents: 'none' })
      }
      const restoreShapes = () => {
        gsap.to('[data-float-shape]', { opacity: (i: number) => [0.015, 0.01, 0][i] || 0.015, duration: 0.6 })
        gsap.to('.art-shape', { opacity: (i: number) => [0.35, 0.35, 0.3, 0.3][i] || 0.35, duration: 0.6 })
        gsap.to('.shape', { opacity: 0.75, duration: 0.6 })
        gsap.to('.exp-shape', { opacity: 0.4, duration: 0.6 })
        gsap.to('.contact-shape', { opacity: 0.45, duration: 0.6 })
      }

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top bottom',
        end: 'bottom top',
        invalidateOnRefresh: true,
        onEnter: hideShapes,
        onLeave: restoreShapes,
        onEnterBack: hideShapes,
        onLeaveBack: restoreShapes,
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

      panels.forEach((panel, i) => {
        const bg = backgrounds[i]
        const backdrop = panel.querySelector('[data-inst-backdrop]')
        const label = panel.querySelector('[data-inst-label]')
        const title = panel.querySelector('[data-inst-title]')
        const tagline = panel.querySelector('[data-inst-tagline]')
        const meta = panel.querySelector('[data-inst-meta]')
        if (!bg) return

        // Background crossfade - immediate hide others, fade in active
        gsap.set(bg, { opacity: 0 })

        ScrollTrigger.create({
          trigger: panel,
          start: 'top 70%',
          end: 'bottom 30%',
          onEnter: () => {
            backgrounds.forEach(b => gsap.set(b, { opacity: 0 }))
            gsap.to(bg, { opacity: 1, duration: 0.4 })
          },
          onLeave: () => {
            gsap.to(bg, { opacity: 0, duration: 0.3 })
          },
          onEnterBack: () => {
            backgrounds.forEach(b => gsap.set(b, { opacity: 0 }))
            gsap.to(bg, { opacity: 1, duration: 0.4 })
          },
          onLeaveBack: () => {
            gsap.to(bg, { opacity: 0, duration: 0.3 })
          },
        })

        const textElements = [label, title, tagline, meta].filter(Boolean)

        const enterTl = gsap.timeline({
          scrollTrigger: {
            trigger: panel,
            start: 'top 85%',
            end: 'top 30%',
            scrub: 0.3,
          },
        })

        if (backdrop) {
          enterTl.fromTo(backdrop, { opacity: 0 }, { opacity: 1, ease: 'power2.out' }, 0)
        }
        textElements.forEach((el, index) => {
          enterTl.fromTo(el,
            { opacity: 0, y: 30 + index * 8 },
            { opacity: 1, y: 0, ease: 'power2.out' },
            index * 0.1
          )
        })

        const exitTl = gsap.timeline({
          scrollTrigger: {
            trigger: panel,
            start: 'bottom 70%',
            end: 'bottom 25%',
            scrub: 0.3,
          },
        })

        if (backdrop) {
          exitTl.fromTo(backdrop, { opacity: 1 }, { opacity: 0, ease: 'power2.in' }, 0)
        }
        textElements.forEach((el, index) => {
          exitTl.fromTo(el,
            { opacity: 1, y: 0 },
            { opacity: 0, y: -25 - index * 6, ease: 'power2.in' },
            index * 0.08
          )
        })
      })

    },
    { scope: sectionRef, dependencies: [imagesLoaded], revertOnUpdate: true }
  )

  return (
    <section ref={sectionRef} id="creative" className="relative">
      {/* Art-inspired geometric shapes */}
      <CreativeShapes />

      {/* Fixed background container - z-[1] to sit above BackgroundElements */}
      {/* Only mount when section is approaching viewport (fixed position defeats loading="lazy") */}
      {imagesLoaded && (
        <div
          ref={backgroundsRef}
          className="fixed inset-0 pointer-events-none z-[1]"
          style={{ willChange: 'opacity' }}
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
              />
            </div>
          ))}
        </div>
      )}

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
              <div className="mx-auto max-w-6xl px-6 md:px-12 w-full py-8 sm:py-12 md:py-16 lg:py-24">
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
