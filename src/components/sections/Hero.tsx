import { useEffect, useRef } from 'react'
import { ArrowDown } from 'lucide-react'
import { gsap, createEntranceTimeline, ANIMATION_CONFIG } from '../../lib/animations'
import { Button } from '../ui/Button'
import { siteConfig } from '../../data/content'

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = createEntranceTimeline({ delay: 0.3 })
      if (!tl) return

      // Set initial states
      gsap.set([titleRef.current, subtitleRef.current, ctaRef.current, scrollRef.current], {
        opacity: 0,
        y: 40,
      })

      // Animate in sequence
      tl.to(titleRef.current, {
        opacity: 1,
        y: 0,
        duration: ANIMATION_CONFIG.duration.slow,
        ease: ANIMATION_CONFIG.ease.smooth,
      })
        .to(
          subtitleRef.current,
          {
            opacity: 1,
            y: 0,
            duration: ANIMATION_CONFIG.duration.normal,
            ease: ANIMATION_CONFIG.ease.smooth,
          },
          '-=0.4'
        )
        .to(
          ctaRef.current,
          {
            opacity: 1,
            y: 0,
            duration: ANIMATION_CONFIG.duration.normal,
            ease: ANIMATION_CONFIG.ease.smooth,
          },
          '-=0.3'
        )
        .to(
          scrollRef.current,
          {
            opacity: 1,
            y: 0,
            duration: ANIMATION_CONFIG.duration.normal,
            ease: ANIMATION_CONFIG.ease.smooth,
          },
          '-=0.2'
        )
    }, containerRef)

    return () => ctx.revert()
  }, [])

  const handleScrollDown = () => {
    document.querySelector('#work')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-obsidian to-obsidian-50" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet/5 rounded-full blur-[120px]" />

      <div className="relative container-narrow text-center py-20">
        <h1
          ref={titleRef}
          className="text-display-lg md:text-display-xl lg:text-display-2xl font-bold text-white mb-6"
        >
          Product strategy for{' '}
          <span className="text-gradient-gold">AI</span>
          <br />
          at billion-user scale
        </h1>

        <p
          ref={subtitleRef}
          className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 text-balance"
        >
          I define vision and align executives for AI platforms serving billions.
          Previously Director of Product at Covariant (Amazon acquisition),
          Lead PM at Meta, Senior PM at Microsoft.
        </p>

        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => document.querySelector('#work')?.scrollIntoView({ behavior: 'smooth' })}
          >
            View My Work
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.open(siteConfig.artSite, '_blank')}
          >
            Creative Work
          </Button>
        </div>

        <div
          ref={scrollRef}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <button
            onClick={handleScrollDown}
            className="flex flex-col items-center gap-2 text-white/40 hover:text-gold transition-colors group"
            aria-label="Scroll down"
          >
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <ArrowDown
              size={20}
              className="animate-bounce group-hover:text-gold"
            />
          </button>
        </div>
      </div>
    </section>
  )
}
