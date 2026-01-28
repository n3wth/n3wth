import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { siteConfig } from '../../data/content'

gsap.registerPlugin(ScrollTrigger, SplitText)

export function Contact() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const splitRef = useRef<SplitText | null>(null)

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches
      if (prefersReducedMotion) return

      if (!titleRef.current) return

      // Split the title text for character animation
      splitRef.current = new SplitText(titleRef.current, {
        type: 'chars,words',
        charsClass: 'contact-char',
        wordsClass: 'contact-word',
      })

      const chars = splitRef.current.chars

      // Create dramatic reveal timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 60%',
          end: 'top 20%',
          scrub: 1,
        },
      })

      // Label slides up
      tl.fromTo(
        '[data-contact-label]',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4 },
        0.1
      )

      // Character by character reveal with wave effect
      tl.fromTo(
        chars,
        {
          y: 100,
          opacity: 0,
          rotateX: -90,
        },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 0.8,
          stagger: {
            amount: 0.8,
            from: 'start',
          },
          ease: 'back.out(1.2)',
        },
        0.2
      )

      // Description fades in
      tl.fromTo(
        '[data-contact-desc]',
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        0.6
      )

      // CTA button
      tl.fromTo(
        '[data-contact-cta]',
        {
          opacity: 0,
          y: 30,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
        },
        0.8
      )

      // Social links stagger in
      tl.fromTo(
        '[data-social-link]',
        {
          y: 20,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.1,
          ease: 'power2.out',
        },
        0.9
      )

      // Cleanup
      return () => {
        if (splitRef.current) {
          splitRef.current.revert()
          splitRef.current = null
        }
      }
    },
    { scope: sectionRef }
  )

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="section relative min-h-screen flex items-center"
    >
      <div className="mx-auto max-w-6xl px-6 md:px-12 w-full">
        <div className="text-center max-w-3xl mx-auto">
          <p
            data-contact-label
            className="label mb-8 tracking-[0.2em]"
          >
            Get in touch
          </p>

          <h2
            ref={titleRef}
            data-contact-title
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-semibold text-white tracking-tight leading-[1.05] mb-8"
            style={{ perspective: '1000px' }}
          >
            Let's talk
          </h2>

          <p
            data-contact-desc
            className="text-lg md:text-xl leading-relaxed mb-12 max-w-xl mx-auto"
            style={{ color: 'var(--color-grey-200)' }}
          >
            Whether it's AI safety at scale, building something that lights up, or just grabbing coffee in SF.
          </p>

          {/* Main CTA */}
          <a
            data-contact-cta
            href={`mailto:${siteConfig.email}`}
            className="inline-flex items-center gap-3 text-lg md:text-xl text-white px-10 py-5 rounded-full focus-ring group"
            style={{
              background: '#111111',
              border: '1px solid #2a2a2a',
            }}
          >
            <span className="font-medium">{siteConfig.email}</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
            >
              <path d="M7 17L17 7M7 7h10v10" />
            </svg>
          </a>

          {/* Social links */}
          <div className="flex items-center justify-center gap-8 mt-16">
            <a
              data-social-link
              href={siteConfig.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:opacity-70 transition-opacity focus-ring rounded p-2"
              aria-label="GitHub"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            <a
              data-social-link
              href={siteConfig.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:opacity-70 transition-opacity focus-ring rounded p-2"
              aria-label="LinkedIn"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
