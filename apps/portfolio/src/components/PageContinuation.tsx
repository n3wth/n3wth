import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { sections } from '../data/content'
import './pageContinuation.css'

const connections: Record<string, readonly (keyof typeof sections)[]> = {
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
          <Link key={slug} to={sections[slug].href}>
            <span className="page-continuation-title">{sections[slug].name}</span>
            <ArrowRight size={20} aria-hidden="true" />
            <span className="page-continuation-description">{sections[slug].description}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
