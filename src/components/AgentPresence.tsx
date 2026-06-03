import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/gsap'

/**
 * Subtle agent activity indicators across the site.
 * Shows "thinking" dots near sections as the user approaches them,
 * as if agents are preparing content before you arrive.
 *
 * This is a visual flourish that reinforces the ambient AI thesis.
 */

interface AgentDot {
  id: string
  section: string
  x: string
  y: string
  delay: number
}

const AGENT_DOTS: AgentDot[] = [
  { id: 'work-agent', section: '#work', x: '95%', y: '8%', delay: 0 },
  { id: 'building-agent', section: '#building', x: '93%', y: '12%', delay: 0.3 },
  { id: 'thinking-agent', section: '#thinking', x: '96%', y: '6%', delay: 0.1 },
  { id: 'frameworks-agent', section: '#frameworks', x: '94%', y: '10%', delay: 0.2 },
  { id: 'creative-agent', section: '#creative', x: '92%', y: '5%', delay: 0.4 },
]

function AgentIndicator({ dot }: { dot: AgentDot }) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const section = document.querySelector(dot.section)
    if (!section) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Activate when section is approaching (large rootMargin)
        setActive(entry.isIntersecting)
      },
      { rootMargin: '200px 0px 200px 0px', threshold: 0 }
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [dot.section])

  useEffect(() => {
    if (!ref.current) return

    if (active) {
      // Appear with a subtle scale + fade
      gsap.to(ref.current, {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        delay: dot.delay,
        ease: 'power2.out',
      })
      // Start a subtle "thinking" pulse
      gsap.to(ref.current.querySelector('.agent-ring'), {
        scale: 1.8,
        opacity: 0,
        duration: 1.5,
        repeat: -1,
        ease: 'power1.out',
        delay: dot.delay + 0.4,
      })
    } else {
      gsap.to(ref.current, {
        opacity: 0,
        scale: 0.5,
        duration: 0.3,
        ease: 'power2.in',
      })
    }
  }, [active, dot.delay])

  return (
    <div
      ref={ref}
      className="fixed z-[9985] pointer-events-none opacity-0"
      style={{
        left: dot.x,
        top: dot.y,
        transform: 'scale(0.5)',
        willChange: 'transform, opacity',
      }}
      aria-hidden="true"
    >
      {/* Pulsing ring */}
      <div
        className="agent-ring absolute inset-0 rounded-full"
        style={{
          width: 6,
          height: 6,
          border: '1px solid rgba(255, 255, 255, 0.3)',
        }}
      />
      {/* Core dot */}
      <div
        className="rounded-full"
        style={{
          width: 4,
          height: 4,
          margin: 1,
          background: 'rgba(255, 255, 255, 0.5)',
        }}
      />
    </div>
  )
}

export function AgentPresence() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Delay mount so it doesn't compete with hero entrance
    const timer = setTimeout(() => setMounted(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  if (!mounted) return null

  return (
    <>
      {AGENT_DOTS.map((dot) => (
        <AgentIndicator key={dot.id} dot={dot} />
      ))}
    </>
  )
}
