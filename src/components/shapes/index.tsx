import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Colors from the palette
const colors = {
  pink: '#FF6B9D',      // LED art, warmth
  yellow: '#FFD93D',    // Energy, ideas
  blue: '#5DADE2',      // Tech, trust
  purple: '#A78BFA',    // AI, innovation
  green: '#2ECC71',     // Growth, success
  orange: '#FF7F50',    // Creativity
  coral: '#FF8A80',     // Passion
  mint: '#64FFDA',      // Fresh, modern
}

/**
 * ExperienceShapes - Geometric accents for the work section
 * Shapes represent the trajectory of career growth
 */
export function ExperienceShapes() {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!ref.current) return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const shapes = ref.current.querySelectorAll('.exp-shape')

    // Shapes appear on scroll
    shapes.forEach((shape, i) => {
      gsap.fromTo(shape,
        { opacity: 0, scale: 0.5, rotation: -45 },
        {
          opacity: 0.5,
          scale: 1,
          rotation: 0,
          duration: 0.8,
          ease: 'back.out(1.5)',
          scrollTrigger: {
            trigger: shape,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
          delay: i * 0.1,
        }
      )

      // Gentle floating
      gsap.to(shape, {
        y: gsap.utils.random(-15, 15),
        rotation: gsap.utils.random(-10, 10),
        duration: gsap.utils.random(4, 6),
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      })
    })
  }, { scope: ref })

  return (
    <div ref={ref} className="pointer-events-none hidden md:block">
      {/* Arc - career trajectory, growth over time */}
      <div className="exp-shape fixed top-[15%] right-[5%] z-0 opacity-0">
        <svg width="100" height="60" viewBox="0 0 100 60">
          <path
            d="M 5 55 Q 50 5 95 55"
            fill="none"
            stroke={colors.purple}
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Stacked rings - iteration, AI training loops */}
      <div className="exp-shape fixed bottom-[20%] right-[8%] z-0 opacity-0">
        <svg width="70" height="70" viewBox="0 0 70 70">
          <circle cx="35" cy="35" r="30" fill="none" stroke={colors.blue} strokeWidth="4" />
          <circle cx="35" cy="35" r="20" fill="none" stroke={colors.mint} strokeWidth="3" />
          <circle cx="35" cy="35" r="10" fill={colors.blue} />
        </svg>
      </div>

      {/* Grid dots - data, scale */}
      <div className="exp-shape fixed top-[40%] right-[3%] z-0 opacity-0">
        <svg width="50" height="50" viewBox="0 0 50 50">
          {[0, 1, 2].map(row =>
            [0, 1, 2].map(col => (
              <circle
                key={`${row}-${col}`}
                cx={10 + col * 15}
                cy={10 + row * 15}
                r="4"
                fill={colors.green}
              />
            ))
          )}
        </svg>
      </div>
    </div>
  )
}

/**
 * CreativeShapes - Art-inspired shapes for the creative section
 * Each shape references Oliver's actual installations
 */
export function CreativeShapes() {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!ref.current) return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const shapes = ref.current.querySelectorAll('.art-shape')

    shapes.forEach((shape, i) => {
      // Pulse like LEDs
      gsap.to(shape, {
        opacity: gsap.utils.random(0.3, 0.7),
        scale: gsap.utils.random(0.95, 1.05),
        duration: gsap.utils.random(1.5, 2.5),
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: i * 0.3,
      })
    })
  }, { scope: ref })

  return (
    <div ref={ref} className="pointer-events-none hidden md:block">
      {/* Triangle - Pink Triangle memorial */}
      <div className="art-shape fixed top-[25%] left-[5%] z-[5] opacity-40">
        <svg width="60" height="52" viewBox="0 0 60 52">
          <polygon points="30,2 58,50 2,50" fill={colors.pink} />
        </svg>
      </div>

      {/* Concentric circles - Circle of Light */}
      <div className="art-shape fixed bottom-[30%] left-[8%] z-[5] opacity-40">
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="35" fill="none" stroke={colors.yellow} strokeWidth="2" />
          <circle cx="40" cy="40" r="25" fill="none" stroke={colors.orange} strokeWidth="2" />
          <circle cx="40" cy="40" r="15" fill="none" stroke={colors.coral} strokeWidth="2" />
          <circle cx="40" cy="40" r="5" fill={colors.yellow} />
        </svg>
      </div>

      {/* Abstract sculpture form - THEM */}
      <div className="art-shape fixed top-[60%] left-[3%] z-[5] opacity-40">
        <svg width="50" height="90" viewBox="0 0 50 90">
          <rect x="20" y="0" width="10" height="90" fill={colors.purple} />
          <rect x="0" y="30" width="50" height="10" fill={colors.purple} />
          <circle cx="25" cy="15" r="12" fill={colors.mint} />
        </svg>
      </div>
    </div>
  )
}

/**
 * ContactShapes - Warm, inviting shapes for the contact section
 * Represent connection and openness
 */
export function ContactShapes() {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!ref.current) return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const shapes = ref.current.querySelectorAll('.contact-shape')

    // Entrance animation
    gsap.fromTo(shapes,
      { opacity: 0, scale: 0 },
      {
        opacity: 0.6,
        scale: 1,
        duration: 1,
        ease: 'elastic.out(1, 0.5)',
        stagger: 0.15,
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 70%',
          toggleActions: 'play none none reverse',
        },
      }
    )

    // Gentle orbit
    shapes.forEach((shape, i) => {
      gsap.to(shape, {
        rotation: i % 2 === 0 ? 360 : -360,
        duration: 30 + i * 5,
        ease: 'none',
        repeat: -1,
        transformOrigin: i % 2 === 0 ? '150% 150%' : '-50% -50%',
      })
    })
  }, { scope: ref })

  return (
    <div ref={ref} className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Open ring - invitation */}
      <div className="contact-shape absolute top-[10%] right-[10%] opacity-0">
        <svg width="80" height="80" viewBox="0 0 80 80">
          <path
            d="M 40 5 A 35 35 0 1 1 5 40"
            fill="none"
            stroke={colors.pink}
            strokeWidth="5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Dots radiating - communication */}
      <div className="contact-shape absolute bottom-[20%] right-[15%] opacity-0">
        <svg width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="8" fill={colors.yellow} />
          <circle cx="10" cy="30" r="5" fill={colors.yellow} opacity="0.6" />
          <circle cx="50" cy="30" r="5" fill={colors.yellow} opacity="0.6" />
          <circle cx="30" cy="10" r="5" fill={colors.yellow} opacity="0.6" />
          <circle cx="30" cy="50" r="5" fill={colors.yellow} opacity="0.6" />
        </svg>
      </div>

      {/* Arc pointing forward - direction */}
      <div className="contact-shape absolute top-[50%] right-[5%] opacity-0">
        <svg width="50" height="100" viewBox="0 0 50 100">
          <path
            d="M 45 10 Q 5 50 45 90"
            fill="none"
            stroke={colors.mint}
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  )
}

/**
 * SectionDivider - Geometric transition between sections
 */
export function SectionDivider({ color = colors.purple }: { color?: string }) {
  return (
    <div className="relative h-32 overflow-hidden pointer-events-none">
      <svg
        className="absolute left-1/2 -translate-x-1/2 opacity-30"
        width="200"
        height="100"
        viewBox="0 0 200 100"
      >
        <line x1="0" y1="50" x2="80" y2="50" stroke={color} strokeWidth="2" />
        <polygon points="100,30 120,50 100,70 80,50" fill={color} />
        <line x1="120" y1="50" x2="200" y2="50" stroke={color} strokeWidth="2" />
      </svg>
    </div>
  )
}
