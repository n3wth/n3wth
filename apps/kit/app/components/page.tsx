import { PageHeader, SiteContainer, SiteSection } from '@n3wth/ui/site'
import type { Metadata } from 'next'
import { ComponentGrid } from './_components/component-grid'

export const metadata: Metadata = {
  title: 'Components',
  description: '47 production-ready React components with built-in AI context. Install via shadcn CLI with context packs for Antigravity CLI.',
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
      <SiteContainer as="main" className="n3wth-site-main">
        <PageHeader title="Components" description="Every component ships with AI context packs. Install one, and AI tools know how to use it on-brand." actions={<span>47 components</span>} />

        <SiteSection><ComponentGrid /></SiteSection>
      </SiteContainer>
    </div>
  )
}
