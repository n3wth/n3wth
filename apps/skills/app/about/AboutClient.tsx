'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { IslandNav } from '../../src/components/IslandNav'
import { Footer } from '../../src/components/Footer'
import { FloatingShapes } from '../../src/components/FloatingShapes'

gsap.registerPlugin(ScrollTrigger)

export default function AboutClient() {
  const heroRef = useRef<HTMLDivElement>(null)
  const sectionsRef = useRef<HTMLDivElement>(null)
  const comparisonRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      // Hero title animation
      if (heroRef.current) {
        gsap.fromTo(
          heroRef.current.querySelectorAll('.animate-in'),
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out' }
        )
      }

      // Section animations on scroll
      if (sectionsRef.current) {
        const sections = sectionsRef.current.querySelectorAll('section')
        sections.forEach((section) => {
          gsap.fromTo(
            section,
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: section,
                start: 'top 85%',
                once: true,
              },
            }
          )
        })
      }

      // Comparison card animation
      if (comparisonRef.current) {
        const columns = comparisonRef.current.querySelectorAll('[data-col]')
        gsap.fromTo(
          columns,
          { opacity: 0, x: (i) => (i === 0 ? -30 : 30) },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            stagger: 0.2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: comparisonRef.current,
              start: 'top 80%',
              once: true,
            },
          }
        )

        // Animate list items
        const listItems = comparisonRef.current.querySelectorAll('li')
        gsap.fromTo(
          listItems,
          { opacity: 0, x: -10 },
          {
            opacity: 1,
            x: 0,
            duration: 0.4,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: comparisonRef.current,
              start: 'top 75%',
              once: true,
            },
          }
        )
      }

      // Feature cards stagger
      if (cardsRef.current) {
        const cards = cardsRef.current.querySelectorAll('.glass-card')
        gsap.fromTo(
          cards,
          { opacity: 0, y: 20, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            stagger: 0.12,
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 85%',
              once: true,
            },
          }
        )
      }
    })

    return () => ctx.revert()
  }, [])

  return (
    <div className="min-h-screen relative content-loaded">
      <div className="mesh-gradient" />
      <div className="noise-overlay" />
      <FloatingShapes />
      <IslandNav />

      <main className="max-w-6xl mx-auto px-6 md:px-12 pt-28 md:pt-32 pb-24">
        <div className="max-w-3xl">
          <div ref={heroRef}>
            <Link
              href="/"
              className="inline-flex items-center gap-2 mb-8 text-sm hover:opacity-70 transition-opacity animate-in"
              style={{ color: 'var(--color-grey-400)' }}
            >
              <span>&larr;</span> Back to skills
            </Link>

            <h1 className="text-4xl md:text-5xl font-semibold text-white mb-4 tracking-tight animate-in">
              What are Skills?
            </h1>
            <p className="text-lg mb-12 animate-in" style={{ color: 'var(--color-grey-300)' }}>
              Markdown files that tell your AI how to do one thing well.
            </p>
          </div>

          <div ref={sectionsRef} className="space-y-12">
            <section>
              <h2 className="text-2xl md:text-3xl font-medium text-white mb-4">
                How they work
              </h2>
              <p
                className="text-lg leading-relaxed mb-4"
                style={{ color: 'var(--color-grey-200)' }}
              >
                A skill is a markdown file with instructions for a specific domain. Install one, and your AI gets context for that area: patterns, conventions, and common mistakes.
              </p>
              <p
                className="text-lg leading-relaxed"
                style={{ color: 'var(--color-grey-200)' }}
              >
                Want scroll animations? Install the GSAP skill. Need PDFs? There's a skill for that.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-medium text-white mb-4">
                Skills vs. MCP servers
              </h2>
              <p
                className="text-lg leading-relaxed mb-4"
                style={{ color: 'var(--color-grey-200)' }}
              >
                MCP servers connect your AI to live systems: databases, APIs, real-time data. Skills are different. They're static files. No server process, no infrastructure.
              </p>
              <p
                className="text-lg leading-relaxed mb-4"
                style={{ color: 'var(--color-grey-200)' }}
              >
                A skill is just a markdown file in your config directory. Copy it anywhere.
              </p>
              <div ref={comparisonRef} className="glass-card p-6 md:p-8 mt-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div data-col>
                    <h3
                      className="text-lg font-medium mb-3"
                      style={{ color: 'var(--color-mint)' }}
                    >
                      Skills
                    </h3>
                    <ul
                      className="space-y-2 text-base"
                      style={{ color: 'var(--color-grey-200)' }}
                    >
                      <li>Markdown files with instructions</li>
                      <li>No server required</li>
                      <li>Instant installation</li>
                      <li>Works offline</li>
                      <li>Zero maintenance</li>
                      <li>Portable across machines</li>
                    </ul>
                  </div>
                  <div data-col>
                    <h3
                      className="text-lg font-medium mb-3"
                      style={{ color: 'var(--color-coral)' }}
                    >
                      MCP Servers
                    </h3>
                    <ul
                      className="space-y-2 text-base"
                      style={{ color: 'var(--color-grey-200)' }}
                    >
                      <li>Running server processes</li>
                      <li>Can access external APIs</li>
                      <li>Real-time data integration</li>
                      <li>Requires server infrastructure</li>
                      <li>Needs ongoing maintenance</li>
                      <li>More complex setup</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-medium text-white mb-4">
                When to use each
              </h2>
              <p
                className="text-lg leading-relaxed mb-4"
                style={{ color: 'var(--color-grey-200)' }}
              >
                <strong style={{ color: 'var(--color-white)' }}>Skills</strong> teach your AI how to do something: framework patterns, coding conventions, domain concepts.
              </p>
              <p
                className="text-lg leading-relaxed"
                style={{ color: 'var(--color-grey-200)' }}
              >
                <strong style={{ color: 'var(--color-white)' }}>MCP servers</strong> connect to external systems: databases, APIs, anything that needs live data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-medium text-white mb-4">
                Installation
              </h2>
              <p
                className="text-lg leading-relaxed mb-4"
                style={{ color: 'var(--color-grey-200)' }}
              >
                Skills go in your AI assistant's config directory. When you ask for help, your assistant reads the file.
              </p>
              <div className="command-box p-4 mt-6">
                <code
                  className="text-sm font-mono"
                  style={{ color: 'var(--color-grey-200)' }}
                >
                  curl -fsSL https://skills.n3wth.com/install.sh | bash
                </code>
              </div>
              <p
                className="text-sm mt-3"
                style={{ color: 'var(--color-grey-400)' }}
              >
                Installs to your assistant's config directory.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-medium text-white mb-4">
                Why skills?
              </h2>
              <div ref={cardsRef} className="grid md:grid-cols-3 gap-6 mt-6">
                <div className="glass-card p-6">
                  <h3
                    className="text-lg font-medium mb-2"
                    style={{ color: 'var(--color-sage)' }}
                  >
                    Plain files
                  </h3>
                  <p
                    className="text-base"
                    style={{ color: 'var(--color-grey-300)' }}
                  >
                    Copy them anywhere, share with your team, or version-control them alongside your project.
                  </p>
                </div>
                <div className="glass-card p-6">
                  <h3
                    className="text-lg font-medium mb-2"
                    style={{ color: 'var(--color-mint)' }}
                  >
                    Zero infrastructure
                  </h3>
                  <p
                    className="text-base"
                    style={{ color: 'var(--color-grey-300)' }}
                  >
                    No processes, no ports, and no servers. Skills run entirely within your AI assistant.
                  </p>
                </div>
                <div className="glass-card p-6">
                  <h3
                    className="text-lg font-medium mb-2"
                    style={{ color: 'var(--color-gold)' }}
                  >
                    Works offline
                  </h3>
                  <p
                    className="text-base"
                    style={{ color: 'var(--color-grey-300)' }}
                  >
                    No network dependency. Your AI reads skills from your local filesystem.
                  </p>
                </div>
              </div>
            </section>

            <section className="pt-8 border-t" style={{ borderColor: 'var(--glass-border)' }}>
              <p
                className="text-lg leading-relaxed"
                style={{ color: 'var(--color-grey-200)' }}
              >
                <Link
                  href="/"
                  className="link-hover"
                  style={{ color: 'var(--color-white)' }}
                >
                  Browse the catalog
                </Link>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
