import type { MouseEvent } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Github, Mail, Search } from 'lucide-react'
import { navigation, siteConfig } from '../data/content'

export interface NavProps {
  /** Opens site search. The layout owns its state, so Nav only asks. */
  onOpenSearch?: () => void
}

export function Nav({ onOpenSearch }: NavProps) {
  const { pathname } = useLocation()

  /* Clicking the link for the page you're already on used to run a full
     view transition of identical content — a flicker that read as a dead
     click. Skip the navigation and give the click a real result instead:
     scroll back to the top. */
  const sameRouteClick = (href: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (href !== pathname) return
    e.preventDefault()
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <header
      className="site-nav fixed inset-x-3 md:inset-x-4 z-50 flex justify-center pointer-events-none"
      style={{ top: 'calc(0.75rem + env(safe-area-inset-top))' }}
      data-nosnippet
    >
      <div className="nav-island pointer-events-auto flex h-12 items-center gap-1 pl-4 pr-2 md:pl-5">
        <Link
          to="/"
          viewTransition
          className="brand shrink-0"
          aria-label="n3wth — home"
          onClick={sameRouteClick('/')}
        >
          <span>n3wth</span>
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-0.5 ml-3">
          {navigation.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              viewTransition
              onClick={sameRouteClick(item.href)}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : ''}`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        <span className="ml-2 inline-flex items-center gap-0.5">
          <a
            href="https://github.com/n3wth/n3wth"
            rel="noopener me"
            className="nav-icon"
            aria-label="GitHub"
          >
            <Github size={16} aria-hidden="true" />
          </a>
          <a
            href={`mailto:${siteConfig.email}`}
            className="nav-icon"
            aria-label="Contact"
          >
            <Mail size={16} aria-hidden="true" />
          </a>
          {onOpenSearch && (
            <button
              type="button"
              onClick={onOpenSearch}
              className="nav-icon"
              aria-label="Search"
            >
              <Search size={16} aria-hidden="true" />
            </button>
          )}
        </span>
      </div>
    </header>
  )
}
