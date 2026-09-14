import { PageHeader, SiteContainer, SiteSection } from '@n3wth/ui/site'
import { siteUrls } from '@n3wth/site-config'
import Link from 'next/link'

interface PostLayoutProps {
  title: string
  date: string
  readingTime: string
  description?: string
  path?: string
  publishedIso?: string
  children: React.ReactNode
}

export function PostLayout({ title, date, readingTime, description, path, publishedIso, children }: PostLayoutProps) {
  const articleJsonLd = path && publishedIso ? {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${siteUrls.kit}${path}#article`,
    headline: title,
    description,
    datePublished: publishedIso,
    author: { '@type': 'Person', name: 'Oliver Newth', url: siteUrls.home },
    isPartOf: { '@id': `${siteUrls.kit}/#website` },
    mainEntityOfPage: `${siteUrls.kit}${path}`,
  } : null

  return (
    <div className="min-h-screen bg-bg">
      {articleJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
      )}
      <SiteContainer as="main" className="n3wth-site-main">
        <PageHeader title={title} description={<><time>{date}</time> · {readingTime}</>} actions={<Link href="/blog">Back to blog</Link>} />

        <SiteSection className="max-w-2xl space-y-6 text-base leading-relaxed text-ink-dim">
          {children}
        </SiteSection>
      </SiteContainer>
    </div>
  )
}
