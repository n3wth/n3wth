import { useRef, useEffect } from 'react'
import { ArrowUpRight, BookOpen, Layers, Settings, Target } from 'lucide-react'
import { gsap, ANIMATION_CONFIG } from '../../lib/animations'
import { frameworks } from '../../data/content'
import { Badge } from '../ui/Badge'
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card'
import { SectionDivider } from '../ui/SectionDivider'

const categoryIcons = {
  reliability: BookOpen,
  architecture: Layers,
  operations: Settings,
  strategy: Target,
}

export function Frameworks() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
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

      const cards = cardsRef.current?.querySelectorAll('.framework-card')
      cards?.forEach((card, index) => {
        gsap.from(card, {
          y: 40,
          opacity: 0,
          duration: ANIMATION_CONFIG.duration.normal,
          ease: ANIMATION_CONFIG.ease.smooth,
          delay: index * ANIMATION_CONFIG.stagger.tight,
          scrollTrigger: {
            trigger: cardsRef.current,
            start: ANIMATION_CONFIG.scroll.start,
            once: true,
          },
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="frameworks" className="section-padding">
      <div className="container-narrow">
        <div ref={headerRef} className="text-center mb-16">
          <Badge variant="violet" className="mb-4">
            AI PM Canon
          </Badge>
          <h2 className="text-display-sm md:text-display-md font-bold text-white mb-4">
            Field-Tested Frameworks
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Patterns and playbooks developed from building production AI systems
            at billion-user scale.
          </p>
        </div>

        <div ref={cardsRef} className="grid md:grid-cols-2 gap-6">
          {frameworks.map((framework) => {
            const Icon = categoryIcons[framework.category]
            return (
              <Card
                key={framework.id}
                variant="glow"
                className="framework-card group cursor-pointer hover:-translate-y-1"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div
                      className={`p-3 rounded-xl ${
                        framework.color === 'gold'
                          ? 'bg-gold/10 text-gold'
                          : 'bg-violet/10 text-violet-400'
                      }`}
                    >
                      <Icon size={24} />
                    </div>
                    <ArrowUpRight
                      size={20}
                      className="text-white/30 group-hover:text-gold transition-colors"
                    />
                  </div>
                  <CardTitle className="mt-4">{framework.title}</CardTitle>
                  <CardDescription>{framework.tagline}</CardDescription>
                </CardHeader>
                <div className="pt-4">
                  <Badge
                    variant={framework.color === 'gold' ? 'default' : 'violet'}
                  >
                    {framework.category}
                  </Badge>
                </div>
              </Card>
            )
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-white/40 text-sm">
            More frameworks and deep dives coming soon
          </p>
        </div>
      </div>

      <SectionDivider className="mt-20" />
    </section>
  )
}
