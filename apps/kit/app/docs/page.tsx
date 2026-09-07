import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Documentation',
  description: 'Documentation for n3wth/kit. Guides for getting started with Cursor, v0, Windsurf, Lovable, and Cline integration.',
  alternates: {
    canonical: 'https://kit.n3wth.com/docs',
  },
  openGraph: {
    title: 'Documentation — n3wth/kit',
    description: 'Guides for getting started with Cursor, v0, Windsurf, Lovable, and Cline integration.',
    url: 'https://kit.n3wth.com/docs',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Documentation — n3wth/kit',
    description: 'Guides for getting started with Cursor, v0, Windsurf, Lovable, and Cline integration.',
  },
}

const webPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': 'https://kit.n3wth.com/docs#webpage',
  url: 'https://kit.n3wth.com/docs',
  name: 'Documentation — n3wth/kit',
  description: 'Guides for getting started with Cursor, v0, Windsurf, Lovable, and Cline integration.',
  isPartOf: { '@id': 'https://kit.n3wth.com/#website' },
  primaryImageOfPage: {
    '@type': 'ImageObject',
    url: 'https://kit.n3wth.com/docs/opengraph-image',
  },
}

const guides = [
  {
    title: 'Getting Started',
    href: '/docs/getting-started',
    description: 'Install components and set up AI context packs in your project.',
  },
  {
    title: 'Cursor Integration',
    href: '/docs/cursor',
    description: 'Configure .cursorrules and MCP server for Cursor AI.',
  },
  {
    title: 'AI Context Pack',
    href: '/docs/agents',
    description: 'Set up AGENTS.md and MCP server for AI coding tools.',
  },
  {
    title: 'v0 Integration',
    href: '/docs/v0',
    description: 'Use the registry URL with v0 to generate on-brand UIs.',
  },
  {
    title: 'Lovable Integration',
    href: '/docs/lovable',
    description: 'Add n3wth components to Lovable projects.',
  },
]

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <main className="mx-auto max-w-3xl px-6 pt-32 pb-24">
        <h1 className="text-3xl font-bold tracking-tight text-ink">
          Documentation
        </h1>
        <p className="mt-3 text-ink-dim">
          Guides for installing components and integrating with AI coding tools.
        </p>

        <div className="mt-12 space-y-4">
          {guides.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="group block rounded-lg border border-rail p-5 transition-colors hover:border-rail-strong"
            >
              <h2 className="text-base font-semibold text-ink transition-colors group-hover:text-ink-dim">
                {guide.title}
              </h2>
              <p className="mt-1.5 text-sm text-ink-dim">
                {guide.description}
              </p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
