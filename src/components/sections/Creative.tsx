import { useRef, useEffect } from 'react'
import { ExternalLink, Sparkles } from 'lucide-react'
import { gsap, ANIMATION_CONFIG } from '../../lib/animations'
import { installations, siteConfig } from '../../data/content'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { SectionDivider } from '../ui/SectionDivider'

const typeLabels = {
  'burning-man': 'Burning Man',
  'public-art': 'Public Art',
  memorial: 'Memorial',
  interactive: 'Interactive',
}

export function Creative() {
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

      const cards = cardsRef.current?.querySelectorAll('.installation-card')
      cards?.forEach((card, index) => {
        gsap.from(card, {
          y: 40,
          opacity: 0,
          duration: ANIMATION_CONFIG.duration.normal,
          ease: ANIMATION_CONFIG.ease.smooth,
          delay: index * ANIMATION_CONFIG.stagger.normal,
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
    <section
      ref={sectionRef}
      id="creative"
      className="section-padding bg-gradient-to-b from-obsidian-50/50 to-obsidian"
    >
      <div className="container-narrow">
        <div ref={headerRef} className="text-center mb-16">
          <Badge className="mb-4">
            <Sparkles size={14} className="mr-1" />
            Creative Work
          </Badge>
          <h2 className="text-display-sm md:text-display-md font-bold text-white mb-4">
            Large-Scale Light Installations
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            When I'm not building AI products, I create immersive light sculptures
            for Burning Man, public memorials, and community spaces.
          </p>
        </div>

        <div ref={cardsRef} className="grid md:grid-cols-3 gap-6">
          {installations.map((installation) => (
            <Card
              key={installation.id}
              variant="gradient"
              className="installation-card group"
            >
              <div className="flex flex-col h-full">
                <Badge variant="outline" className="w-fit mb-4">
                  {typeLabels[installation.type]}
                </Badge>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {installation.title}
                </h3>
                <p className="text-white/50 text-sm mb-4 flex-grow">
                  {installation.tagline}
                </p>
                <div className="flex items-center justify-between text-sm text-white/40">
                  <span>{installation.location}</span>
                  <span>{installation.year}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.open(siteConfig.artSite, '_blank')}
          >
            <ExternalLink size={18} />
            View Full Portfolio at newth.art
          </Button>
        </div>
      </div>

      <SectionDivider className="mt-20" />
    </section>
  )
}
