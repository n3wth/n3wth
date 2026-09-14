import { PageHeader, SiteContainer, SiteSection } from '@n3wth/ui/site'
import type { Metadata } from 'next'
import { siteUrls } from '@n3wth/site-config'
import { pageMetadata, pageJsonLd } from '@n3wth/site-config/metadata'
import { ComponentGrid } from './_components/component-grid'

const url = `${siteUrls.kit}/components`
const socialTitle = 'Components — n3wth/kit'
const description = '47 production-ready React components with built-in AI context. Install via shadcn CLI with context packs for Antigravity CLI.'

export const metadata: Metadata = pageMetadata({
  title: 'Components',
  description,
  url,
  socialTitle,
  socialDescription: '47 production-ready React components with built-in AI context. 32 UI components, 4 blocks, 11 hooks.',
})

const webPageJsonLd = pageJsonLd({
  url,
  title: socialTitle,
  description: '47 production-ready React components with built-in AI context. Install via shadcn CLI.',
  siteUrl: siteUrls.kit,
  type: 'CollectionPage',
  image: `${url}/opengraph-image`,
})

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
