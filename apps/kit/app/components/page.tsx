import type { Metadata } from 'next'
import { ComponentGrid } from './_components/component-grid'

export const metadata: Metadata = {
  title: 'Components',
  description: '47 production-ready React components with built-in AI context. Install via shadcn CLI with context packs for v0, Cursor, Windsurf, Lovable, and Cline.',
  alternates: {
    canonical: 'https://kit.n3wth.com/components',
  },
  openGraph: {
    title: 'Components — n3wth/kit',
    description: '47 production-ready React components with built-in AI context. 32 UI components, 4 blocks, 11 hooks.',
    url: 'https://kit.n3wth.com/components',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Components — n3wth/kit',
    description: '47 production-ready React components with built-in AI context. 32 UI components, 4 blocks, 11 hooks.',
  },
}

const webPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': 'https://kit.n3wth.com/components#webpage',
  url: 'https://kit.n3wth.com/components',
  name: 'Components — n3wth/kit',
  description: '47 production-ready React components with built-in AI context. Install via shadcn CLI.',
  isPartOf: { '@id': 'https://kit.n3wth.com/#website' },
  primaryImageOfPage: {
    '@type': 'ImageObject',
    url: 'https://kit.n3wth.com/components/opengraph-image',
  },
}

export default function ComponentsPage() {
  return (
    <div className="min-h-screen bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <main className="mx-auto max-w-5xl px-6 pt-32 pb-24">
        <div className="flex items-baseline gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-ink">
            Components
          </h1>
          <span className="rounded-full border border-rail px-2.5 py-0.5 text-xs font-medium text-ink-faint">
            47
          </span>
        </div>
        <p className="mt-3 max-w-2xl text-ink-dim">
          Every component ships with AI context packs. Install one, and AI tools
          know how to use it on-brand.
        </p>

        <ComponentGrid />
      </main>
    </div>
  )
}
