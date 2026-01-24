import { useRef, useEffect } from 'react'
import { gsap, ANIMATION_CONFIG } from '../../lib/animations'
import { experiences } from '../../data/content'
import { Badge } from '../ui/Badge'
import { SectionDivider } from '../ui/SectionDivider'

export function Experience() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.from(headerRef.current, {
        y: 40,
        opacity: 0,
        duration: ANIMATION_CONFIG.duration.slow,
        ease: ANIMATION_CONFIG.ease.smooth,
        scrollTrigger: {
          trigger: headerRef.current,
          start: ANIMATION_CONFIG.scroll.start,
          once: true,
        },
      })

      // Timeline items animation
      const items = itemsRef.current?.querySelectorAll('.timeline-item')
      items?.forEach((item, index) => {
        gsap.from(item, {
          y: 40,
          opacity: 0,
          duration: ANIMATION_CONFIG.duration.normal,
          ease: ANIMATION_CONFIG.ease.smooth,
          delay: index * ANIMATION_CONFIG.stagger.normal,
          scrollTrigger: {
            trigger: item,
            start: ANIMATION_CONFIG.scroll.start,
            once: true,
          },
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="work"
      className="section-padding bg-obsidian-50/50"
    >
      <div className="container-narrow">
        <div ref={headerRef} className="text-center mb-16">
          <Badge className="mb-4">Experience</Badge>
          <h2 className="text-display-sm md:text-display-md font-bold text-white mb-4">
            Building AI at Scale
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Over a decade of product leadership at the world's largest technology companies,
            shipping AI products to billions of users.
          </p>
        </div>

        <div ref={itemsRef} className="relative">
          {/* Timeline line */}
          <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gold/50 via-gold/20 to-transparent md:-translate-x-1/2" />

          {experiences.map((exp, index) => (
            <div
              key={exp.id}
              className={`timeline-item relative pl-8 md:pl-0 pb-12 last:pb-0 ${
                index % 2 === 0 ? 'md:pr-[50%] md:text-right' : 'md:pl-[50%] md:text-left'
              }`}
            >
              {/* Timeline dot */}
              <div
                className={`absolute left-0 md:left-1/2 w-3 h-3 rounded-full bg-gold shadow-glow-gold md:-translate-x-1/2 ${
                  index === 0 ? 'ring-4 ring-gold/20' : ''
                }`}
              />

              <div
                className={`${
                  index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'
                }`}
              >
                <span className="text-sm text-gold font-medium">{exp.period}</span>
                <h3 className="text-xl font-semibold text-white mt-1">{exp.role}</h3>
                <p className="text-white/60 font-medium">{exp.company}</p>
                <p className="text-white/50 mt-3 text-sm">{exp.description}</p>

                <ul className={`mt-4 space-y-2 ${index % 2 === 0 ? 'md:text-right' : ''}`}>
                  {exp.achievements.map((achievement, i) => (
                    <li key={i} className="text-sm text-white/40 flex items-start gap-2">
                      <span className={`text-gold mt-1.5 ${index % 2 === 0 ? 'md:order-last' : ''}`}>
                        &bull;
                      </span>
                      <span>{achievement}</span>
                    </li>
                  ))}
                </ul>

                <div className={`flex flex-wrap gap-2 mt-4 ${index % 2 === 0 ? 'md:justify-end' : ''}`}>
                  {exp.tech.map((tech) => (
                    <Badge key={tech} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <SectionDivider className="mt-20" />
    </section>
  )
}
