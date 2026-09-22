import { useLoaderData } from 'react-router-dom'
import { PageHeader, ReadingOutline } from '@n3wth/ui/site'
import { RouterLink } from '../components/RouterLink'
import { buildArticleSchema, usePageMeta } from '../hooks/usePageMeta'
import '../notes.css'

interface Note {
  slug: string
  href: string
  title: string
  description: string
  tags: string[]
  stage: 'seedling' | 'budding' | 'evergreen'
  readingTime: string
  date?: string
  html: string
  headings: { id: string; text: string; level: number }[]
  backlinks: { slug: string; title: string; href: string; context: { before: string; mention: string; after: string } | null }[]
}

export default function ThinkingNote() {
  const note = useLoaderData() as Note
  usePageMeta(`${note.title} — Oliver Newth`, note.description, {
    canonical: note.href,
    publishedTime: note.date,
    jsonLd: note.date ? buildArticleSchema({ url: `https://n3wth.com${note.href}`, title: note.title, description: note.description, datePublished: note.date }) : undefined,
  })
  const headings = note.headings.filter(heading => heading.level <= 3)

  return (
    <article className="site-content-gutter thinking-note">
      <PageHeader title={note.title} description={note.description} spacing="compact" />
      <p className="text-sm mt-6" style={{ color: 'var(--ink-dim)' }}>
        {note.date && <><time dateTime={note.date}>{new Date(note.date.length === 10 ? `${note.date}T00:00:00` : note.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</time>{' · '}</>}
        {note.readingTime} · {note.stage}
      </p>
      <nav aria-label="Note topics" className="flex flex-wrap gap-x-5 mt-2">
        {note.tags.map(tag => <RouterLink className="link-underline inline-flex min-h-11 items-center text-sm" key={tag} href={`/thinking?topic=${encodeURIComponent(tag)}#notes`}>{tag}</RouterLink>)}
      </nav>
      <div className="thinking-note-layout">
        {headings.length > 0 && <aside className="thinking-note-outline"><ReadingOutline label="Contents" collapsible items={headings.map(heading => ({ id: heading.id, label: heading.text, level: heading.level }))} /></aside>}
        <div className="min-w-0">
          {/* HTML comes from the repository's trusted Markdown build pipeline. */}
          <div className="n3wth-site-prose thinking-note-prose" dangerouslySetInnerHTML={{ __html: note.html }} />
          {note.backlinks.length > 0 && <section className="mt-16" aria-labelledby="backlinks-heading">
            <h2 id="backlinks-heading" className="text-lg">Linked from</h2>
            <ul className="mt-6 space-y-6">
              {note.backlinks.map(link => <li key={link.slug}>
                <RouterLink href={link.href} className="link-underline">{link.title}</RouterLink>
                {link.context && <p className="text-sm mt-2" style={{ color: 'var(--ink-dim)' }}>{link.context.before}{link.context.mention}{link.context.after}</p>}
              </li>)}
            </ul>
          </section>}
        </div>
      </div>
    </article>
  )
}
