import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { aiChallenges } from '../../data/ai-challenges'
import { useAIExplainerState } from '../../hooks/useAIExplainerState'
import { ChallengeCard } from '../ai-explainer/ChallengeCard'

gsap.registerPlugin(ScrollTrigger)

export function AIExplainer() {
  const sectionRef = useRef<HTMLElement>(null)
  const { makeChoice, getChallengeState } = useAIExplainerState()

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches
      if (prefersReducedMotion) return

      // Header animation
      gsap.from('[data-ai-header]', {
        scrollTrigger: {
          trigger: '[data-ai-header]',
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
      })

      // Each challenge card animates individually when it enters viewport
      const cards = gsap.utils.toArray<HTMLElement>('[data-challenge-card]')
      cards.forEach((card) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          },
          y: 50,
          opacity: 0,
          duration: 0.7,
          ease: 'power3.out'
        })
      })

      // Hide Creative section backgrounds while in AI Explainer section
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top bottom',
        end: 'bottom top',
        onEnter: () => {
          gsap.to('[data-installation-bg]', { opacity: 0, duration: 0.3 })
        },
        onLeave: () => {
          // Let Creative section handle its own backgrounds
        },
        onEnterBack: () => {
          gsap.to('[data-installation-bg]', { opacity: 0, duration: 0.3 })
        },
        onLeaveBack: () => {
          // Let Creative section handle its own backgrounds
        }
      })
    },
    { scope: sectionRef }
  )

  return (
    <section
      ref={sectionRef}
      id="ai-explainer"
      className="section relative z-[5]"
      style={{ background: '#000' }}
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 md:px-12 relative">
        {/* Header */}
        <div data-ai-header className="mb-10 sm:mb-16 md:mb-20">
          <p className="label mb-3 sm:mb-4">How I think about alignment</p>
          <h2 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-[1.1] mb-4 sm:mb-6 text-glow">
            AI safety has no perfect solutions
          </h2>
          <p
            className="text-sm sm:text-base md:text-lg leading-relaxed max-w-xl"
            style={{ color: 'var(--color-grey-400)' }}
          >
            Only trade-offs. Explore three real alignment challenges and see why every decision involves choosing what matters most.
          </p>
        </div>

        {/* Challenges */}
        <div data-challenges>
          {aiChallenges.map((challenge) => {
            const state = getChallengeState(challenge.id)
            return (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onChoice={(metrics) => makeChoice(challenge.id, metrics)}
                isAnimating={state.isAnimating}
                chosenMetrics={state.chosenMetrics}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
