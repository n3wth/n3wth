import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import './pageContinuation.css'

const destinations = {
  work: { title: 'Work', description: 'Building AI products.' },
  projects: { title: 'Projects', description: 'Tools and experiments.' },
  thinking: { title: 'Thinking', description: 'AI, design, and everyday life.' },
  art: { title: 'Art', description: 'Large-scale light installations.' },
  library: { title: 'Library', description: 'Notes, components, and skills.' },
  contact: { title: 'Contact', description: 'Product, AI, art, or coffee.' },
} as const

type Destination = keyof typeof destinations

const connections: Record<string, readonly Destination[]> = {
  '/work': ['projects', 'contact'],
  '/projects': ['library', 'thinking'],
  '/thinking': ['projects', 'art'],
  '/art': ['thinking', 'contact'],
  '/library': ['projects', 'thinking'],
  '/contact': ['work', 'art'],
}

/** Contextual exits for section indexes; reading pages have their own next links. */
export function PageContinuation({ pathname }: { pathname: string }) {
  const next = connections[pathname.replace(/\/$/, '')]
  if (!next) return null

  return (
    <nav className="site-content-gutter page-continuation" aria-label="Continue exploring">
      <div className="page-continuation-links">
        {next.map(slug => (
          <Link key={slug} to={`/${slug}`}>
            <span className="page-continuation-title">{destinations[slug].title}</span>
            <ArrowRight size={20} aria-hidden="true" />
            <span className="page-continuation-description">{destinations[slug].description}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
