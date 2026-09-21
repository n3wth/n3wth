'use client'
import { PageHeader, SiteSection, SiteHeading } from '@n3wth/ui/site'

import Link from 'next/link'
import { IslandNav } from '../../src/components/IslandNav'
import { Footer } from '../../src/components/Footer'
import { FloatingShapes } from '../../src/components/FloatingShapes'

export default function PrivacyClient() {
  return (
    <div className="min-h-screen relative content-loaded">
      <FloatingShapes />
      <IslandNav />

      <main id="main-content" tabIndex={-1} className="n3wth-site-container n3wth-site-main">
        <div className="max-w-2xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-8 text-sm hover:opacity-70 transition-opacity"
            style={{ color: 'var(--color-grey-400)' }}
          >
            <span>&larr;</span> Back to skills
          </Link>

          <PageHeader title={<>Privacy Policy</>} description={<>Last updated: September 2026</>} />

          <div className="skills-content-sections">
            <SiteSection >
              <SiteHeading variant="section">
                Overview
              </SiteHeading>
              <p
                className="text-base leading-relaxed"
                style={{ color: 'var(--color-grey-200)' }}
              >
                skills.n3wth.com is a directory of markdown-based skills for AI coding assistants. We commit to protecting your privacy and being transparent about our data practices.
              </p>
            </SiteSection>

            <SiteSection >
              <SiteHeading variant="section">
                Data we collect
              </SiteHeading>
              <p
                className="text-base leading-relaxed mb-4"
                style={{ color: 'var(--color-grey-200)' }}
              >
                We collect minimal data to improve the site experience:
              </p>
              <ul
                className="list-disc list-inside space-y-2 text-base"
                style={{ color: 'var(--color-grey-200)' }}
              >
                <li>Anonymous usage analytics (page views, skill downloads)</li>
                <li>Error logs for debugging purposes</li>
                <li>Information you voluntarily provide (skill requests, contributions)</li>
                <li>Email address if you subscribe to the newsletter</li>
              </ul>
            </SiteSection>

            <SiteSection >
              <SiteHeading variant="section">
                Skills installation
              </SiteHeading>
              <p
                className="text-base leading-relaxed"
                style={{ color: 'var(--color-grey-200)' }}
              >
                When you install a skill, the file downloads directly to your local machine. Skills are markdown files that run entirely within your AI assistant. We don't have access to your conversations, code, or any data your AI assistant processes.
              </p>
            </SiteSection>

            <SiteSection >
              <SiteHeading variant="section">
                Newsletter
              </SiteHeading>
              <p
                className="text-base leading-relaxed"
                style={{ color: 'var(--color-grey-200)' }}
              >
                The footer form collects an email address for notes and new work across design, technology, AI, and the things I’m exploring. Resend stores the address, segment membership, and selected topic subscription. Signup is immediate; no confirmation click is needed. New subscribers receive a welcome email. A subscription is recorded only after Resend confirms the contact, segment, and topic. You can unsubscribe from the link on any note or by emailing <a href="mailto:hey@n3wth.com" className="text-white hover:opacity-70 transition-opacity">hey@n3wth.com</a>. Resend keeps unsubscribe and suppression status. PostHog may record a newsletter_subscribed event with the source site only. The address is not sent to analytics.
              </p>
            </SiteSection>

            <SiteSection >
              <SiteHeading variant="section">
                Third-party services
              </SiteHeading>
              <p
                className="text-base leading-relaxed mb-4"
                style={{ color: 'var(--color-grey-200)' }}
              >
                We use the following third-party services:
              </p>
              <ul
                className="list-disc list-inside space-y-2 text-base"
                style={{ color: 'var(--color-grey-200)' }}
              >
                <li>Vercel for hosting and analytics</li>
                <li>GitHub for skill file hosting and issue tracking</li>
                <li>Resend for newsletter contacts and unsubscribe handling</li>
                <li>PostHog for traffic analytics (no subscriber email)</li>
              </ul>
            </SiteSection>

            <SiteSection >
              <SiteHeading variant="section">
                Cookies
              </SiteHeading>
              <p
                className="text-base leading-relaxed"
                style={{ color: 'var(--color-grey-200)' }}
              >
                We use localStorage to remember your theme preference (light or dark mode). We don't use tracking cookies for advertising purposes.
              </p>
            </SiteSection>

            <SiteSection >
              <SiteHeading variant="section">
                Data retention
              </SiteHeading>
              <p
                className="text-base leading-relaxed"
                style={{ color: 'var(--color-grey-200)' }}
              >
                We retain anonymous analytics data for up to 12 months. Error logs are automatically purged after 30 days.
              </p>
            </SiteSection>

            <SiteSection >
              <SiteHeading variant="section">
                Your rights
              </SiteHeading>
              <p
                className="text-base leading-relaxed"
                style={{ color: 'var(--color-grey-200)' }}
              >
                You can request deletion of any data associated with you by contacting us through GitHub or hey@n3wth.com. Newsletter addresses live in Resend until you unsubscribe or ask us to delete them.
              </p>
            </SiteSection>

            <SiteSection >
              <SiteHeading variant="section">
                Changes to this policy
              </SiteHeading>
              <p
                className="text-base leading-relaxed"
                style={{ color: 'var(--color-grey-200)' }}
              >
                We may update this privacy policy from time to time. Changes will be posted on this page with an updated revision date.
              </p>
            </SiteSection>

            <SiteSection >
              <SiteHeading variant="section">
                Contact
              </SiteHeading>
              <p
                className="text-base leading-relaxed"
                style={{ color: 'var(--color-grey-200)' }}
              >
                For privacy-related questions, please open an issue on our{' '}
                <a
                  href="https://github.com/n3wth/n3wth/tree/main/apps/skills"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:opacity-70 transition-opacity"
                >
                  GitHub repository
                </a>{' '}
                or visit our{' '}
                <Link
                  href="/contact"
                  className="text-white hover:opacity-70 transition-opacity"
                >
                  contact page
                </Link>
                .
              </p>
            </SiteSection>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
