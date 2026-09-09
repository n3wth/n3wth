import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import TransitionLink from 'next/link'
import { getAllNotes, getAllTags, getNoteBySlug, type NoteData } from '@/lib/content'
import { markdownToHtml, extractHeadings } from '@/lib/markdown'
import { getBacklinksForSlug } from '@/lib/backlinks'
import { getLocalGraph, getGraphData } from '@/lib/graph'
import { PlantGlyph } from '@/components/PlantGlyph'
import { getAllPreviews } from '@/lib/previews'
import { Prose } from '@/components/Prose'
import { Backlinks } from '@/components/Backlinks'
import { TagList } from '@/components/TagList'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { NoteMetadata } from '@/components/NoteMetadata'
import { TableOfContents, MobileToc } from '@/components/TableOfContents'
import { CopyLinkButton } from '@/components/CopyLinkButton'
import { GrowthStage } from '@/components/GrowthStage'
import { NoteGraph } from '@/components/NoteGraph'
import { LinkPreview } from '@/components/LinkPreview'
import { NotePageClient } from '@/components/NotePageClient'
import { WalkTrail } from '@/components/WalkTrail'
import { site } from '@/lib/site'
import { noteMetadata } from '@/lib/note-metadata'

interface PageProps {
  params: Promise<{ slug: string[] }>
}

export async function generateStaticParams() {
  const notes = getAllNotes()
  return notes
    // '' renders at /, 'notes' is shadowed by the static /notes index route
    .filter((note) => note.slug !== '' && note.slug !== 'notes')
    .map((note) => ({
      slug: note.slug.split('/'),
    }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const slugStr = slug.join('/')
  const note = getNoteBySlug(slugStr)

  if (!note) return { title: 'Not Found' }

  const { description, image, publishedTime } = noteMetadata(note, slugStr, site.url)

  return {
    title: note.title,
    description,
    keywords: note.tags,
    alternates: { canonical: `/${slugStr}` },
    openGraph: {
      title: note.title,
      description,
      type: 'article',
      url: `/${slugStr}`,
      siteName: 'n3wth/garden',
      publishedTime,
      tags: note.tags,
      images: [{ url: image, width: 1200, height: 630, alt: note.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: note.title,
      description,
      images: [image],
    },
  }
}

export default async function NotePage({ params }: PageProps) {
  const { slug } = await params
  const slugStr = slug.join('/')
  const note = getNoteBySlug(slugStr)

  if (!note) notFound()

  const html = await markdownToHtml(note.content)
  const headings = extractHeadings(html)
  const backlinks = getBacklinksForSlug(slugStr)
  const localGraph = getLocalGraph(slugStr)
  const previews = getAllPreviews()

  const url = `${site.url}/${slugStr}`
  const { description, image, publishedTime } = noteMetadata(note, slugStr, site.url)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: note.title,
    description,
    image,
    keywords: note.tags.join(', ') || undefined,
    datePublished: publishedTime,
    author: { '@type': 'Person', name: 'Oliver Newth', url: site.parentUrl },
    publisher: { '@type': 'Person', name: 'Oliver Newth', url: site.parentUrl },
    mainEntityOfPage: url,
  }
  const crumbs = slugStr.split('/')
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Garden', item: site.url },
      ...crumbs.map((part, i) => ({
        '@type': 'ListItem',
        position: i + 2,
        name: i === crumbs.length - 1 ? note.title : part.replace(/-/g, ' '),
        item: `${site.url}/${crumbs.slice(0, i + 1).join('/')}`,
      })),
    ],
  }

  /* Notes with one connection or none are dead ends; offer the nearest
     grove (first tag with company) so every note has a next step. The
     count is the set of distinct connected notes — a note that mentions
     this one appears in both backlinks and the (undirected) local graph,
     so summing the two would count it twice. */
  const nearby = new Set(localGraph.nodes.map((n) => n.id))
  nearby.delete(slugStr)
  backlinks.forEach((b) => nearby.add(b.slug))
  let grove: { tag: string; notes: NoteData[] } | null = null
  if (nearby.size <= 1) {
    const stageWeight = { evergreen: 2, budding: 1, seedling: 0 }
    const tagMap = getAllTags()
    for (const tag of note.tags) {
      const siblings = (tagMap.get(tag) || []).filter((n) => n.slug !== slugStr && !nearby.has(n.slug))
      if (siblings.length > 0) {
        grove = {
          tag,
          notes: [...siblings]
            .sort((a, b) => stageWeight[b.stage] - stageWeight[a.stage] || a.title.localeCompare(b.title))
            .slice(0, 3),
        }
        break
      }
    }
  }

  const gardenHref = `/?note=${encodeURIComponent(slugStr)}`
  const graphById = new Map(getGraphData().nodes.map((n) => [n.id, n]))
  const graphNode = graphById.get(slugStr)
  const plantedLabel = graphNode?.created
    ? new Date(graphNode.created).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null
  const tendedDays = graphNode?.modified
    ? Math.floor((Date.now() - graphNode.modified) / 86400000)
    : null
  const tendedMonth = graphNode?.modified
    ? new Date(graphNode.modified).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null
  /* Drop "tended" when it would repeat the planted month verbatim —
     "Planted Feb 2026 · tended Feb 2026" said one fact twice. */
  const tendedLabel =
    tendedDays === null
      ? null
      : tendedDays <= 0
        ? 'tended today'
        : tendedDays < 30
          ? `tended ${tendedDays}d ago`
          : tendedMonth === plantedLabel
            ? null
            : `tended ${tendedMonth}`

  return (
    <NotePageClient slug={slugStr}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {/* Faint stage-tinted glow behind the header; z-index -1 keeps it under
          all content, pointer-events off. */}
      <div className="stage-ambient" data-stage={note.stage} aria-hidden />
      <div className="mx-auto max-w-6xl px-6 md:px-12 py-16">
        <div className="flex gap-16">
          <article className="min-w-0 flex-1">
            <div className="note-header">
              <Breadcrumbs slug={slugStr} />
              {/* Shares 'note-title' with the clicked notes-index row (and with
                  the previous note's h1 on wikilink hops), so the title morphs
                  across the navigation instead of cutting. */}
              <div className="flex items-end justify-between gap-6 mb-3">
                <h1
                  className="font-display text-[2rem] md:text-[2.5rem] leading-[1.12] font-semibold tracking-[-0.025em] text-[var(--color-text-primary)]"
                >
                  {note.title}
                </h1>
                {/* the note's own plant, drawing itself in over the header's spare corner */}
                <span className="hidden sm:block shrink-0">
                  <PlantGlyph
                    slug={slugStr}
                    stage={note.stage}
                    linkCount={graphNode?.linkCount ?? 0}
                    size={64}
                    draw
                  />
                </span>
              </div>
            </div>
            <div className="note-meta flex flex-wrap items-center gap-3 mb-6">
              <GrowthStage stage={note.stage} explain />
              <span className="text-[var(--color-text-disabled)]">·</span>
              <NoteMetadata readingTime={note.readingTime} date={note.date} />
              {plantedLabel && (
                <>
                  <span className="text-[var(--color-text-disabled)]">·</span>
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    Planted {plantedLabel}
                    {tendedLabel ? ` · ${tendedLabel}` : ''}
                  </span>
                </>
              )}
              <CopyLinkButton />
            </div>
            <TagList tags={note.tags} />
            {note.tags.length > 0 && <div className="mt-6" />}
            {note.audience && (
              <aside className="assumed-audience" role="note">
                <p className="label mb-1">Assumed audience</p>
                <p className="text-sm leading-relaxed text-[var(--color-text-secondary)] m-0">
                  {note.audience}
                </p>
              </aside>
            )}
            <MobileToc headings={headings} />
            <div className="note-content">
              <Prose html={html} />
            </div>
            {/* On xl the local graph lives in the sidebar; keep the full-width
                version for narrower viewports only. */}
            {localGraph.nodes.length > 1 && (
              <div className="note-graph xl:hidden mt-12 pt-8 border-t border-[var(--color-border)]">
                <div className="flex items-baseline justify-between mb-4">
                  <h2 className="label">Connected notes</h2>
                  <Link
                    href={gardenHref}
                    className="text-xs text-[var(--color-text-disabled)] hover:text-[var(--color-text-secondary)] transition-colors"
                  >
                    See in the garden →
                  </Link>
                </div>
                <div className="rounded-lg overflow-hidden" style={{ height: 300 }}>
                  <NoteGraph
                    nodes={localGraph.nodes}
                    edges={localGraph.edges}
                    currentSlug={slugStr}
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}
            <div className="note-backlinks">
              <Backlinks backlinks={backlinks} />
            </div>
            {grove && (
              <section className="mt-12 pt-8 border-t border-[var(--color-border)]">
                <h2 className="label mb-4">More in the {grove.tag} grove</h2>
                <ul className="flex flex-wrap gap-2">
                  {grove.notes.map((n) => (
                    <li key={n.slug}>
                      <TransitionLink
                        href={`/${n.slug}`}
                        className="glass-pill press inline-flex items-center gap-2 py-1.5 pl-2 pr-3.5 text-xs"
                      >
                        <PlantGlyph
                          slug={n.slug}
                          stage={n.stage}
                          linkCount={graphById.get(n.slug)?.linkCount ?? 0}
                          size={22}
                        />
                        {n.title}
                      </TransitionLink>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {/* Keep exploring: hand the reader back to the world */}
            <div className="mt-12 border-t border-[var(--color-border)] pt-8">
              <nav aria-label="Keep exploring" className="flex flex-wrap items-center gap-3">
                <Link
                  href={gardenHref}
                  className="rounded-lg px-4 py-2 text-sm transition-colors"
                  style={{
                    background: 'var(--color-background-surface)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Stand at this note in the garden
                </Link>
                <Link
                  href="/random"
                  className="rounded-lg px-4 py-2 text-sm transition-colors"
                  style={{
                    background: 'var(--color-background-surface)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  Wander to a random note
                </Link>
              </nav>
              {/* Below the buttons so its post-hydration appearance never
                  shifts them under a moving cursor. */}
              <WalkTrail slug={slugStr} title={note.title} />
            </div>
          </article>
          <div className="note-sidebar hidden xl:block w-56 shrink-0 self-start">
            <div className="sticky top-24 space-y-8">
              <TableOfContents headings={headings} />
              {localGraph.nodes.length > 1 && (
                <div>
                  <h3 className="label mb-3">Nearby in the garden</h3>
                  <div className="rounded-lg overflow-hidden border border-[var(--color-border)]" style={{ height: 200 }}>
                    <NoteGraph
                      nodes={localGraph.nodes}
                      edges={localGraph.edges}
                      currentSlug={slugStr}
                      className="w-full h-full"
                    />
                  </div>
                  <Link
                    href={gardenHref}
                    className="mt-2 inline-block text-xs text-[var(--color-text-disabled)] hover:text-[var(--color-text-secondary)] transition-colors"
                  >
                    See in the garden →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <LinkPreview previews={previews} />
    </NotePageClient>
  )
}
