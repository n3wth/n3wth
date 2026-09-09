import { PageHeader, SiteContainer, SiteSection, SiteHeading } from '@n3wth/ui/site'
import type { Metadata } from 'next'
import { siteUrls } from '@n3wth/site-config'
import { pageMetadata, pageJsonLd } from '@n3wth/site-config/metadata'
import Link from 'next/link'

const url = `${siteUrls.kit}/docs`
const socialTitle = 'Documentation — n3wth/kit'
const description = 'Documentation for n3wth/kit. Guides for getting started with Antigravity CLI integration.'

export const metadata: Metadata = pageMetadata({
  title: 'Documentation',
  description,
  url,
  socialTitle,
  socialDescription: 'Guides for getting started with Antigravity CLI integration.',
})

const webPageJsonLd = pageJsonLd({
  url,
  title: socialTitle,
  description: 'Guides for getting started with Antigravity CLI integration.',
  siteUrl: siteUrls.kit,
  type: 'CollectionPage',
  image: `${url}/opengraph-image`,
})

const guides = [
  {
    title: 'Getting Started',
    href: '/docs/getting-started',
    description: 'Install components and set up AI context packs in your project.',
  },
  {
    title: 'AI Context Pack',
    href: '/docs/agents',
    description: 'Set up AGENTS.md and MCP server for AI coding tools.',
  },
]

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <SiteContainer as="main" className="n3wth-site-main">
        <PageHeader title="Documentation" description="Guides for installing components and integrating with AI coding tools." />

        <SiteSection className="space-y-4">
          {guides.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="group block rounded-lg border border-rail p-5 transition-colors hover:border-rail-strong"
            >
              <SiteHeading variant="item" level={2}>
                {guide.title}
              </SiteHeading>
              <p className="mt-1.5 text-sm text-ink-dim">
                {guide.description}
              </p>
            </Link>
          ))}
        </SiteSection>
      </SiteContainer>
    </div>
  )
}
