import { useSearchParams, useNavigate } from 'react-router-dom'
import { TextInput } from '@n3wth/ui/primitives'
import { RouterLink } from '../RouterLink'
import { registeredPieces } from './registry'
import notes from '../../data/writing-index.json'

const topics = [...new Set(notes.flatMap(note => note.tags))].sort()

export function NotesIndex() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const query = params.get('q') ?? ''
  const topic = params.get('topic') ?? ''
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const entries = topic === 'articles'
    ? registeredPieces.map(({ meta }) => ({ slug: meta.id, href: `/thinking/${meta.id}`, title: meta.title, description: meta.dek, tags: ['articles'] }))
    : notes
  const visible = entries.filter(note => (!topic || note.tags.includes(topic)) &&
    `${note.title} ${note.description} ${note.tags.join(' ')}`.toLocaleLowerCase().includes(normalizedQuery))
  const topicHref = (value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set('topic', value)
    else next.delete('topic')
    return `/thinking${next.size ? `?${next}` : ''}#notes`
  }

  return (
    <section id="notes" aria-labelledby="notes-heading" className="frame section-pad">
      <h2 id="notes-heading" className="text-2xl mb-8">Notes</h2>
      <div className="max-w-xl">
        <TextInput label="Search writing" placeholder="Search titles, descriptions and topics" value={query} onChange={value => {
          const next = new URLSearchParams(params)
          if (value) next.set('q', value)
          else next.delete('q')
          navigate({ pathname: '/thinking', search: next.toString(), hash: '#notes' }, { replace: true, preventScrollReset: true })
        }} />
      </div>
      <nav aria-label="Writing topics" className="flex flex-wrap gap-x-5 mt-6">
        {['', 'articles', ...topics.filter(tag => tag !== 'articles')].map(tag => (
          <RouterLink key={tag} href={topicHref(tag)} aria-current={topic === tag ? 'page' : undefined} className="link-underline inline-flex min-h-11 items-center" style={{ color: topic === tag ? 'var(--ink)' : 'var(--ink-dim)' }}>
            {tag || 'All notes'}
          </RouterLink>
        ))}
      </nav>
      <p role="status" className="text-sm mt-6" style={{ color: 'var(--ink-dim)' }}>{visible.length} {visible.length === 1 ? 'result' : 'results'}</p>
      <ul className="mt-8 grid gap-x-10 gap-y-8 md:grid-cols-2">
        {visible.map(note => (
          <li key={note.slug} className="max-w-lg">
            <h3><RouterLink href={note.href} className="link-underline text-lg">{note.title}</RouterLink></h3>
            {note.description && <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--ink-dim)' }}>{note.description}</p>}
          </li>
        ))}
      </ul>
      {visible.length === 0 && <p className="mt-8">No writing matches this search. Try another term or topic.</p>}
    </section>
  )
}
