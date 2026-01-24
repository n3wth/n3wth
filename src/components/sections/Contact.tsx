import { useRef, useEffect } from 'react'
import { Mail, Github, Linkedin, Twitter } from 'lucide-react'
import { gsap, ANIMATION_CONFIG } from '../../lib/animations'
import { siteConfig } from '../../data/content'
import { Badge } from '../ui/Badge'
import { useMagneticButton } from '../../hooks/useMagneticButton'

const socialLinks = [
  { name: 'Twitter', icon: Twitter, href: siteConfig.social.twitter },
  { name: 'GitHub', icon: Github, href: siteConfig.social.github },
  { name: 'LinkedIn', icon: Linkedin, href: siteConfig.social.linkedin },
]

export function Contact() {
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const emailButtonRef = useMagneticButton<HTMLAnchorElement>(0.2)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(contentRef.current, {
        y: 40,
        opacity: 0,
        duration: ANIMATION_CONFIG.duration.slow,
        ease: ANIMATION_CONFIG.ease.smooth,
        scrollTrigger: {
          trigger: contentRef.current,
          start: ANIMATION_CONFIG.scroll.start,
          once: true,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="contact" className="section-padding">
      <div className="container-narrow">
        <div ref={contentRef} className="text-center max-w-2xl mx-auto">
          <Badge className="mb-4">Get in Touch</Badge>
          <h2 className="text-display-sm md:text-display-md font-bold text-white mb-4">
            Let's Build Something Together
          </h2>
          <p className="text-lg text-white/60 mb-10">
            I'm always interested in discussing AI product strategy,
            ML infrastructure challenges, or creative collaborations.
          </p>

          <a
            ref={emailButtonRef}
            href={`mailto:${siteConfig.email}`}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gold text-obsidian font-semibold rounded-full shadow-glow-gold hover:shadow-glow-gold-lg transition-all duration-300 hover:scale-105"
          >
            <Mail size={20} />
            {siteConfig.email}
          </a>

          <div className="mt-12 flex justify-center gap-4">
            {socialLinks.map((social) => {
              const Icon = social.icon
              return (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-gold hover:border-gold/30 hover:bg-gold/5 transition-all duration-300"
                  aria-label={social.name}
                >
                  <Icon size={20} />
                </a>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
