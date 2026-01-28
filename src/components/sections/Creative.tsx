import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { installations } from '../../data/content'

gsap.registerPlugin(ScrollTrigger)

export function Creative() {
  const sectionRef = useRef<HTMLElement>(null)
  const backgroundsRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches
      if (prefersReducedMotion) return

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
          onLeave: hideAllBackgrounds,
          onLeaveBack: hideAllBackgrounds,
        })
      }

      panels.forEach((panel, i) => {
        const bg = backgrounds[i]
        const card = panel.querySelector('[data-installation-card]')
        if (!bg) return

        // Each panel controls its own background
        ScrollTrigger.create({
          trigger: panel,
          start: 'top 60%',    // panel enters viewport
          end: 'bottom 40%',   // panel leaves viewport
          onEnter: () => {
            hideAllBackgrounds()
            gsap.to(bg, { opacity: 1, duration: 0.6, ease: 'power2.inOut' })
            if (card) gsap.to(card, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
          },
          onLeave: () => {
            gsap.to(bg, { opacity: 0, duration: 0.4, ease: 'power2.out' })
            if (card) gsap.to(card, { opacity: 0, y: -30, duration: 0.4, ease: 'power2.out' })
          },
          onEnterBack: () => {
            hideAllBackgrounds()
            gsap.to(bg, { opacity: 1, duration: 0.6, ease: 'power2.inOut' })
            if (card) gsap.to(card, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
          },
          onLeaveBack: () => {
            gsap.to(bg, { opacity: 0, duration: 0.4, ease: 'power2.out' })
            if (card) gsap.to(card, { opacity: 0, y: 30, duration: 0.4, ease: 'power2.out' })
          },
        })

        // Set initial state for cards
        if (card) gsap.set(card, { opacity: 0, y: 40 })
      })

    },
    { scope: sectionRef }
  )

  return (
    <section ref={sectionRef} id="creative" className="relative">
      {/* Fixed background container */}
      <div
        ref={backgroundsRef}
        className="fixed inset-0 pointer-events-none z-0"
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
              <p className="label mb-4">After hours</p>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-[1.1] mb-6">
                I build things that glow
              </h2>
              <p
                className="text-base md:text-lg leading-relaxed max-w-xl"
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
              <div className="mx-auto max-w-6xl px-6 md:px-12 w-full py-16 md:py-24">
                <article
                  data-installation-card
                  className="max-w-xl"
                >
                  <span
                    className="inline-block text-xs font-mono uppercase tracking-wider mb-4"
                    style={{ color: textColor, opacity: 0.7 }}
                  >
                    {inst.type.replace('-', ' ')}
                  </span>

                  <h3
                    className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold mb-3 tracking-tight"
                    style={{ color: textColor }}
                  >
                    {inst.title}
                  </h3>

                  <p
                    className="text-base sm:text-lg leading-relaxed mb-6"
                    style={{ color: textColor, opacity: 0.85 }}
                  >
                    {inst.tagline}
                  </p>

                  <div className="flex items-center gap-3 text-sm">
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
