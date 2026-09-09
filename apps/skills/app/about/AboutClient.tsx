'use client'
import { PageHeader, SiteSection, SiteHeading } from '@n3wth/ui/site'

import Link from 'next/link'
import { IslandNav } from '../../src/components/IslandNav'
import { Footer } from '../../src/components/Footer'
import { FloatingShapes } from '../../src/components/FloatingShapes'

export default function AboutClient() {
  return (
    <div className="min-h-screen relative content-loaded">
      <div className="mesh-gradient" />
      <div className="noise-overlay" />
      <FloatingShapes />
      <IslandNav />

      <main className="n3wth-site-container n3wth-site-main">
        <div className="max-w-3xl">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 mb-8 text-sm hover:opacity-70 transition-opacity"
              style={{ color: 'var(--color-grey-400)' }}
            >
              <span>&larr;</span> Back to skills
            </Link>

            <PageHeader title={<>What are Skills?</>} description={<>Markdown files that tell your AI how to do one thing well.</>} />
          </div>

          <div>
            <SiteSection>
              <SiteHeading variant="section">
                How they work
              </SiteHeading>
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
            </SiteSection>

            <SiteSection>
              <SiteHeading variant="section">
                Skills vs. MCP servers
              </SiteHeading>
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
              <div className="glass-card p-6 md:p-8 mt-6">
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
            </SiteSection>

            <SiteSection>
              <SiteHeading variant="section">
                When to use each
              </SiteHeading>
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
            </SiteSection>

            <SiteSection>
              <SiteHeading variant="section">
                Installation
              </SiteHeading>
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
            </SiteSection>

            <SiteSection>
              <SiteHeading variant="section">
                Why skills?
              </SiteHeading>
              <div className="grid md:grid-cols-3 gap-6 mt-6">
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
            </SiteSection>

            <SiteSection className="border-t" style={{ borderColor: 'var(--glass-border)' }}>
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
            </SiteSection>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
