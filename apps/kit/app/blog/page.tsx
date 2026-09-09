import { PageHeader, SiteContainer, SiteSection, SiteHeading } from '@n3wth/ui/site'
import type { Metadata } from 'next'
import { siteUrls } from '@n3wth/site-config'
import { pageMetadata, pageJsonLd } from '@n3wth/site-config/metadata'
import Link from 'next/link'

const url = `${siteUrls.kit}/blog`
const socialTitle = 'Blog — n3wth/kit'
const description = 'Notes on registries, context packs, and generated UI.'

export const metadata: Metadata = pageMetadata({
  title: 'Blog',
  description,
  url,
  socialTitle,
})

const webPageJsonLd = pageJsonLd({
  url,
  title: socialTitle,
  description: description,
  siteUrl: siteUrls.kit,
  type: 'Blog',
  image: `${url}/opengraph-image`,
})

const posts = [
  {
    slug: 'shadcn-registry-protocol-deep-dive',
    title: 'The shadcn Registry Protocol: A Technical Deep Dive',
    date: 'April 9, 2026',
    excerpt: 'How the JSON schema, dependency resolution, and install flow work under the hood — and how to build your own custom component registry.',
  },
  {
    slug: 'shadcn-registry-protocol',
    title: 'The shadcn Registry Protocol',
    date: 'February 12, 2026',
    excerpt: 'How the shadcn registry protocol works.',
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <SiteContainer as="main" className="n3wth-site-main">
        <PageHeader title="Blog" description="Notes on registries, context packs, and generated UI." />

        <SiteSection className="space-y-12">
          {posts.map((post) => (
            <article key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="group block">
                <SiteHeading variant="item" level={2}>
                  {post.title}
                </SiteHeading>
                <time className="mt-2 block text-sm text-ink-faint">
                  {post.date}
                </time>
                <p className="mt-3 text-ink-dim">{post.excerpt}</p>
              </Link>
            </article>
          ))}
        </SiteSection>
      </SiteContainer>
    </div>
  )
}
