import { useEffect, useRef } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Icon, Selector, TextInput } from '@n3wth/ui/primitives'
import { RouterLink } from '../RouterLink'
import { registeredPieces } from './registry'
import notes from '../../data/writing-index.json'
import './writingIndex.css'

const PAGE_SIZE = 24
const articles = registeredPieces.map(({ meta }) => ({
  slug: meta.id, href: `/thinking/${meta.id}`, title: meta.title,
  description: meta.dek, tags: ['articles'], date: meta.date,
  readingTime: '', kind: 'articles', updated: undefined,
}))
const entries = [...articles, ...notes.map((note: typeof notes[number] & { updated?: string }) => ({ ...note, kind: 'notes' }))]
const topics = [...new Set(notes.flatMap(note => note.tags))].sort()
const topicLabel = (tag: string) => tag.replace(/-/g, ' ')
const topicOptions = [{ value: '', label: 'All topics' }, ...topics.map(tag => ({ value: tag, label: topicLabel(tag) }))]
const relativeDate = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

function TendedDate({ value }: { value?: string }) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  const now = new Date()
  const days = Math.round((Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) / 86_400_000)
  const exactDate = date.toLocaleDateString('en', { dateStyle: 'long', timeZone: 'UTC' })
  return <><time dateTime={value} title={exactDate} aria-label={`Tended ${exactDate}`}>Tended {relativeDate.format(days, 'day')}</time>{' · '}</>
}

export function NotesIndex() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const query = params.get('q') ?? ''
  const topic = params.get('topic') ?? ''
  const kind = topic === 'articles' ? 'articles' : params.get('kind') ?? ''
  const sort = params.get('sort') === 'title' ? 'title' : 'newest'
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const visible = entries.filter(entry => (!kind || entry.kind === kind) &&
    (!topic || entry.tags.includes(topic)) &&
    `${entry.title} ${entry.description} ${entry.tags.join(' ')}`.toLocaleLowerCase().includes(normalizedQuery))
    .sort((a, b) => (sort === 'newest' ? (b.date ?? '').localeCompare(a.date ?? '') : 0) || a.title.localeCompare(b.title))
  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE))
  const requestedPage = Number(params.get('page'))
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, pageCount) : 1
  const shown = Math.min(page * PAGE_SIZE, visible.length)
  const search = params.toString()
  useEffect(() => {
    const target = loadMoreRef.current
    if (!target || page >= pageCount || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      const next = new URLSearchParams(search)
      next.set('page', String(page + 1))
      navigate(`/thinking?${next}`, { replace: true, state: { preserveScroll: true } })
    }, { rootMargin: '300px' })
    observer.observe(target)
    return () => observer.disconnect()
  }, [navigate, page, pageCount, search])
  const isFiltered = Boolean(query || topic || kind)
  const href = (changes: Record<string, string>) => {
    const next = new URLSearchParams(params)
    next.delete('page')
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    return `/thinking${next.size ? `?${next}` : ''}#notes`
  }
  const update = (changes: Record<string, string>, replace = false) => navigate(href(changes), { replace, state: { preserveScroll: true } })

  return (
    <section id="notes" aria-label="Writing collection" className="site-content-gutter writing-index">
      <div className="writing-search">
        <TextInput className="writing-control" label="Search writing" isLabelHidden placeholder="Search writing" size="lg" width="100%" startIcon={<Icon icon="search" size="sm" color="secondary" />} value={query} onChange={value => update({ q: value }, true)} />
      </div>
      <div className="writing-toolbar" id="writing-results">
        <nav aria-label="Writing format" className="writing-formats">
          {[['', 'All writing'], ['articles', 'Articles'], ['notes', 'Notes']].map(([value, label]) => (
            <Link key={value} to={href({ kind: value, topic: '' })} state={{ preserveScroll: true }} aria-current={kind === value ? 'page' : undefined}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="writing-topic-picker">
          <Selector className="writing-control" label="Topic" isLabelHidden size="lg" options={topicOptions} value={topic === 'articles' ? '' : topic} onChange={value => update({ topic: value, kind: '' })} hasSearch searchPlaceholder="Find a topic" width="100%" />
        </div>
        <p role="status">{visible.length} {visible.length === 1 ? 'result' : 'results'}</p>
        <div className="writing-sort"><Selector className="writing-control" label="Sort writing" isLabelHidden size="lg" width="100%" options={[{ value: 'newest', label: 'Newest first' }, { value: 'title', label: 'Title A–Z' }]} value={sort} onChange={value => update({ sort: value === 'newest' ? '' : value })} /></div>
      </div>
      {isFiltered && <div className="writing-filter-summary">
        <span>{[kind === 'articles' ? 'Articles' : kind === 'notes' ? 'Notes' : '', topic && topic !== 'articles' ? topicLabel(topic) : '', query ? `“${query}”` : ''].filter(Boolean).join(' / ')}</span>
        <Link to="/thinking#notes" state={{ preserveScroll: true }}>Clear filters</Link>
      </div>}
      <ul className="writing-results">
        {visible.slice(0, shown).map(entry => <li key={entry.href}>
          <div>
            <h2><RouterLink href={entry.href}>{entry.title}</RouterLink></h2>
            {entry.description && <p>{entry.description}</p>}
            <span className="writing-entry-meta">{entry.kind === 'notes' && <TendedDate value={entry.updated ?? entry.date} />}{[entry.kind === 'articles' ? 'Article' : 'Note', entry.readingTime].filter(Boolean).join(' · ')}</span>
          </div>
        </li>)}
      </ul>
      {visible.length === 0 && <div className="writing-empty"><p>No writing matches these filters.</p><p>Try a broader search, choose another topic, or <Link to="/thinking#notes" state={{ preserveScroll: true }}>browse all writing</Link>.</p></div>}
      {page < pageCount && <div ref={loadMoreRef} className="writing-load-more">
        <Link to={href({ page: String(page + 1) }).replace('#notes', '')} replace state={{ preserveScroll: true }}>Load more</Link>
      </div>}
    </section>
  )
}
