import { memo, useRef } from 'react'
import { gsap, useGSAP } from '../../lib/gsap'

/**
 * SHAPE LANGUAGE - Oliver's Story
 *
 * Solid symmetric shapes create visual continuity across sections.
 * Each shape carries meaning tied to the narrative.
 *
 * EXPERIENCE (Tech/Career):
 *   square = foundation, systems thinking
 *   diamond = precision, data quality
 *
 * CREATIVE (Art/LED):
 *   triangle = Pink Triangle memorial, direction
 *   circle = LED glow, warmth, community
 *
 * CONTACT (Connection):
 *   semicircle = openness, welcoming gesture
 *   circle = connection points
 */

const colors = {
  pink: '#FF6B9D',
  yellow: '#FFD93D',
  blue: '#5DADE2',
  purple: '#A78BFA',
  green: '#2ECC71',
  coral: '#FF8A80',
  mint: '#64FFDA',
}

/**
 * ExperienceShapes - Angular precision for the work section
 * Squares and diamonds represent systems thinking and data quality
 */
export const ExperienceShapes = memo(function ExperienceShapes() {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!ref.current) return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const shapes = ref.current.querySelectorAll('.exp-shape')

    shapes.forEach((shape, i) => {
      gsap.fromTo(shape,
        { opacity: 0, scale: 0.5 },
        {
          opacity: 0.4,
          scale: 1,
          duration: 0.8,
          ease: 'back.out(1.5)',
          scrollTrigger: {
            trigger: shape,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
          delay: i * 0.15,
        }
      )

      // Gentle floating
      gsap.to(shape, {
        y: gsap.utils.random(-12, 12),
        duration: gsap.utils.random(5, 7),
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      })
    })
  }, { scope: ref })

  return (
    <div ref={ref} className="pointer-events-none hidden md:block">
      {/* Square - foundation, building systems */}
      <div className="exp-shape fixed top-[18%] right-[6%] z-0 opacity-0">
        <svg width="50" height="50" viewBox="0 0 50 50">
          <rect x="5" y="5" width="40" height="40" fill={colors.purple} />
        </svg>
      </div>

      {/* Diamond - precision, data quality */}
      <div className="exp-shape fixed bottom-[25%] right-[8%] z-0 opacity-0">
        <svg width="60" height="60" viewBox="0 0 60 60">
          <polygon points="30,5 55,30 30,55 5,30" fill={colors.blue} />
        </svg>
      </div>

      {/* Small circle - success point */}
      <div className="exp-shape fixed top-[45%] right-[4%] z-0 opacity-0">
        <svg width="30" height="30" viewBox="0 0 30 30">
          <circle cx="15" cy="15" r="12" fill={colors.green} />
        </svg>
      </div>

      {/* Small square - micro foundation */}
      <div className="exp-shape fixed bottom-[40%] right-[12%] z-0 opacity-0">
        <svg width="25" height="25" viewBox="0 0 25 25">
          <rect x="3" y="3" width="19" height="19" fill={colors.mint} />
        </svg>
      </div>
    </div>
  )
})

/**
 * CreativeShapes - Warm shapes for the art section
 * Circles and triangles represent LED glow and the Pink Triangle memorial
 */
export const CreativeShapes = memo(function CreativeShapes() {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!ref.current) return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const shapes = ref.current.querySelectorAll('.art-shape')

    shapes.forEach((shape, i) => {
      // LED-like pulse
      gsap.to(shape, {
        opacity: gsap.utils.random(0.25, 0.5),
        scale: gsap.utils.random(0.97, 1.03),
        duration: gsap.utils.random(2, 3),
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: i * 0.4,
      })
    })
  }, { scope: ref })

  return (
    <div ref={ref} className="pointer-events-none hidden md:block">
      {/* Triangle - Pink Triangle memorial */}
      <div className="art-shape fixed top-[20%] left-[5%] z-[5] opacity-35">
        <svg width="55" height="48" viewBox="0 0 55 48">
          <polygon points="27.5,3 52,45 3,45" fill={colors.pink} />
        </svg>
      </div>

      {/* Circle - LED glow, warmth */}
      <div className="art-shape fixed bottom-[35%] left-[7%] z-[5] opacity-35">
        <svg width="45" height="45" viewBox="0 0 45 45">
          <circle cx="22.5" cy="22.5" r="20" fill={colors.yellow} />
        </svg>
      </div>

      {/* Small circle - warmth accent */}
      <div className="art-shape fixed top-[55%] left-[3%] z-[5] opacity-30">
        <svg width="25" height="25" viewBox="0 0 25 25">
          <circle cx="12.5" cy="12.5" r="10" fill={colors.coral} />
        </svg>
      </div>

      {/* Small triangle - direction */}
      <div className="art-shape fixed bottom-[20%] left-[10%] z-[5] opacity-30">
        <svg width="30" height="26" viewBox="0 0 30 26">
          <polygon points="15,2 28,24 2,24" fill={colors.purple} />
        </svg>
      </div>
    </div>
  )
})

/**
 * ContactShapes - Welcoming shapes for the contact section
 * Semicircles and circles represent openness and connection
 */
export const ContactShapes = memo(function ContactShapes() {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!ref.current) return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const shapes = ref.current.querySelectorAll('.contact-shape')

    gsap.fromTo(shapes,
      { opacity: 0, scale: 0 },
      {
        opacity: 0.45,
        scale: 1,
        duration: 1,
        ease: 'elastic.out(1, 0.6)',
        stagger: 0.2,
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
      }
    )

    // Gentle sway
    shapes.forEach((shape, i) => {
      gsap.to(shape, {
        y: gsap.utils.random(-8, 8),
        rotation: gsap.utils.random(-5, 5),
        duration: gsap.utils.random(4, 6),
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: i * 0.2,
      })
    })
  }, { scope: ref })

  return (
    <div ref={ref} className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Semicircle - welcoming gesture */}
      <div className="contact-shape absolute top-[12%] right-[8%] opacity-0">
        <svg width="70" height="35" viewBox="0 0 70 35">
          <path d="M 0 35 A 35 35 0 0 1 70 35 L 0 35" fill={colors.pink} />
        </svg>
      </div>

      {/* Circle - connection point */}
      <div className="contact-shape absolute bottom-[25%] right-[12%] opacity-0">
        <svg width="35" height="35" viewBox="0 0 35 35">
          <circle cx="17.5" cy="17.5" r="15" fill={colors.yellow} />
        </svg>
      </div>

      {/* Small circle - secondary connection */}
      <div className="contact-shape absolute top-[45%] right-[5%] opacity-0">
        <svg width="22" height="22" viewBox="0 0 22 22">
          <circle cx="11" cy="11" r="9" fill={colors.mint} />
        </svg>
      </div>
    </div>
  )
})

/**
 * SectionDivider - Geometric transition between sections
 * Diamond shape pointing forward suggests progression
 */
export function SectionDivider({ color = colors.purple }: { color?: string }) {
  return (
    <div className="relative h-24 overflow-hidden pointer-events-none">
      <svg
        className="absolute left-1/2 -translate-x-1/2 opacity-25"
        width="60"
        height="60"
        viewBox="0 0 60 60"
      >
        <polygon points="30,5 55,30 30,55 5,30" fill={color} />
      </svg>
    </div>
  )
}
