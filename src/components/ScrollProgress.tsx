import { useRef, useEffect, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface Section {
  id: string
  label: string
}

const sections: Section[] = [
  { id: 'hero', label: 'Top' },
  { id: 'experience', label: 'Work' },
  { id: 'frameworks', label: 'Skills' },
  { id: 'creative', label: 'Creative' },
  { id: 'contact', label: 'Contact' },
]

export function ScrollProgress() {
  const containerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Show after initial scroll
    const handleScroll = () => {
      setIsVisible(window.scrollY > 200)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (prefersReducedMotion) return

    // Overall progress bar
    ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        if (progressRef.current) {
          gsap.set(progressRef.current, { scaleY: self.progress })
        }
      },
    })

    // Track active section
    sections.forEach((section, index) => {
      const element = document.getElementById(section.id) ||
        document.querySelector(`section:nth-of-type(${index + 1})`)

      if (element) {
        ScrollTrigger.create({
          trigger: element,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => setActiveIndex(index),
          onEnterBack: () => setActiveIndex(index),
        })
      }
    })
  }, [])

  const handleClick = (id: string) => {
    const element = document.getElementById(id) ||
      document.querySelector(`section:has([data-section="${id}"])`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div
      ref={containerRef}
      className={`fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col items-center gap-4 transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Progress track */}
      <div className="relative h-32 w-px">
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(255,255,255,0.1)' }}
        />
        <div
          ref={progressRef}
          className="absolute top-0 left-0 w-full origin-top"
          style={{
            background: 'rgba(255,255,255,0.4)',
            height: '100%',
            transform: 'scaleY(0)',
          }}
        />
      </div>

      {/* Section dots */}
      <div className="flex flex-col gap-3">
        {sections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => handleClick(section.id)}
            className={`group relative flex items-center justify-end transition-all duration-300 ${
              activeIndex === index ? 'opacity-100' : 'opacity-40 hover:opacity-70'
            }`}
            aria-label={`Go to ${section.label}`}
          >
            {/* Label on hover */}
            <span
              className="absolute right-5 text-xs font-mono uppercase tracking-wider whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ color: 'var(--color-grey-400)' }}
            >
              {section.label}
            </span>

            {/* Dot */}
            <div
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                activeIndex === index ? 'scale-100' : 'scale-75'
              }`}
              style={{
                background: activeIndex === index
                  ? 'rgba(255,255,255,0.8)'
                  : 'rgba(255,255,255,0.3)',
              }}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
