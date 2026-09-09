import { PageHeader, SiteContainer, SiteSection } from '@n3wth/ui/site'
import Link from 'next/link'

interface PostLayoutProps {
  title: string
  date: string
  readingTime: string
  children: React.ReactNode
}

export function PostLayout({ title, date, readingTime, children }: PostLayoutProps) {
  return (
    <div className="min-h-screen bg-bg">
      <SiteContainer as="main" className="n3wth-site-main">
        <PageHeader title={title} description={<><time>{date}</time> · {readingTime}</>} actions={<Link href="/blog">Back to blog</Link>} />

        <SiteSection className="max-w-2xl space-y-6 text-base leading-relaxed text-ink-dim">
          {children}
        </SiteSection>
      </SiteContainer>
    </div>
  )
}
