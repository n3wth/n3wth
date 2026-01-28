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

      panels.forEach((panel, i) => {
        const bg = backgrounds[i]
        if (!bg) return

        // Show background when panel is centered, hide well before text changes
        ScrollTrigger.create({
          trigger: panel,
          start: 'top 80%',
          end: 'bottom 80%',
          onEnter: () => gsap.to(bg, { opacity: 1, duration: 0.3, ease: 'power2.out' }),
          onLeave: () => gsap.to(bg, { opacity: 0, duration: 0.3, ease: 'power2.out' }),
          onEnterBack: () => gsap.to(bg, { opacity: 1, duration: 0.3, ease: 'power2.out' }),
          onLeaveBack: () => gsap.to(bg, { opacity: 0, duration: 0.3, ease: 'power2.out' }),
        })

        // Card content animation - synced with background timing
        const card = panel.querySelector('[data-installation-card]')
        if (card) {
          gsap.fromTo(
            card,
            { y: 40, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.4,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: panel,
                start: 'top 70%',
                end: 'bottom 85%',
                toggleActions: 'play reverse play reverse',
              },
            }
          )
        }
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
        {installations.map((inst) => (
          <div
            key={inst.id}
            data-installation-panel
            className="min-h-screen flex items-end relative"
          >
            <div className="mx-auto max-w-6xl px-6 md:px-12 w-full py-16 md:py-24">
              <article
                data-installation-card
                className="max-w-xl"
              >
                <span
                  className="inline-block text-xs font-mono uppercase tracking-wider mb-4"
                  style={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  {inst.type.replace('-', ' ')}
                </span>

                <h3 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-white mb-3 tracking-tight">
                  {inst.title}
                </h3>

                <p
                  className="text-base sm:text-lg leading-relaxed mb-6"
                  style={{ color: 'rgba(255,255,255,0.85)' }}
                >
                  {inst.tagline}
                </p>

                <div className="flex items-center gap-3 text-sm">
                  <span style={{ color: 'rgba(255,255,255,0.9)' }}>{inst.year}</span>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>/</span>
                  <span style={{ color: 'rgba(255,255,255,0.7)' }}>{inst.location}</span>
                </div>
              </article>
            </div>
          </div>
        ))}

      </div>
    </section>
  )
}
