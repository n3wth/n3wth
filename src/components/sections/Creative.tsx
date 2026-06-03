import { useRef, useState, useEffect } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { useReveal } from '../../hooks/useReveal'
import { SectionHeader } from '../Frame'
import { BeamsMark } from '../marks'
import { installations } from '../../data/content'

export function Creative() {
  const sectionRef = useRef<HTMLElement>(null)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  useReveal(sectionRef)

  // Mount fixed background images only as section approaches (position:fixed
  // defeats loading="lazy").
  useEffect(() => {
    if (!sectionRef.current || imagesLoaded) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImagesLoaded(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200% 0px' }
    )
    observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [imagesLoaded])

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduced) return

      const panels = gsap.utils.toArray<HTMLElement>('[data-installation-panel]')
      const backgrounds = gsap.utils.toArray<HTMLElement>('[data-installation-bg]')

      // Hide all backgrounds when section leaves viewport.
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top bottom',
        end: 'bottom top',
        invalidateOnRefresh: true,
        onLeave: () => backgrounds.forEach((b) => gsap.set(b, { opacity: 0 })),
        onLeaveBack: () => backgrounds.forEach((b) => gsap.set(b, { opacity: 0 })),
      })

      panels.forEach((panel, i) => {
        const bg = backgrounds[i]
        if (!bg) return
        gsap.set(bg, { opacity: 0 })
        ScrollTrigger.create({
          trigger: panel,
          start: 'top 65%',
          end: 'bottom 35%',
          invalidateOnRefresh: true,
          fastScrollEnd: true,
          onEnter: () => {
            backgrounds.forEach((b) => gsap.set(b, { opacity: 0 }))
            gsap.to(bg, { opacity: 1, duration: 0.4, overwrite: true })
          },
          onEnterBack: () => {
            backgrounds.forEach((b) => gsap.set(b, { opacity: 0 }))
            gsap.to(bg, { opacity: 1, duration: 0.4, overwrite: true })
          },
          onLeave: () => gsap.to(bg, { opacity: 0, duration: 0.3, overwrite: true }),
          onLeaveBack: () => gsap.to(bg, { opacity: 0, duration: 0.3, overwrite: true }),
        })
      })
    },
    { scope: sectionRef, dependencies: [imagesLoaded], revertOnUpdate: true }
  )

  return (
    <section ref={sectionRef} id="creative" aria-label="Creative" className="relative">
      {imagesLoaded && (
        <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
          {installations.map((inst) => (
            <div key={`bg-${inst.id}`} data-installation-bg className="absolute inset-0 opacity-0">
              <img src={inst.image} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: 'rgba(8,9,11,0.55)' }} />
            </div>
          ))}
        </div>
      )}

      <div className="relative z-10">
        <SectionHeader
          index="06"
          eyebrow="After hours"
          title="I build things that glow"
          lede="Large-scale LED installations for Burning Man and public memorials. I spoke at Robot Heart about how art and technology intersect."
          mark={<BeamsMark size={56} />}
        />

        {installations.map((inst, i) => (
          <div
            key={inst.id}
            data-installation-panel
            className="min-h-screen flex items-center relative"
          >
            <div className="section-pad w-full">
              <article data-reveal className="reveal max-w-xl relative">
                <div className="flex items-center gap-4 mb-5">
                  <span className="index">{String(i + 1).padStart(2, '0')}</span>
                  <span className="eyebrow">{inst.type.replace('-', ' ')}</span>
                </div>
                <h3 className="display text-[clamp(2rem,7vw,4.5rem)] mb-4" style={{ color: 'var(--ink)' }}>
                  {inst.title}
                </h3>
                <p className="text-base md:text-lg leading-relaxed mb-6" style={{ color: 'var(--ink)' }}>
                  {inst.tagline}
                </p>
                <div className="flex items-center gap-3 meta">
                  <span style={{ color: 'var(--ink)' }}>{inst.year}</span>
                  <span style={{ color: 'var(--rail-strong)' }}>/</span>
                  <span>{inst.location}</span>
                </div>
              </article>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
