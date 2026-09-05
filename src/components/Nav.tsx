import { useRef, useState, type MouseEvent } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Github, Mail, Menu, Search, X } from 'lucide-react'
import { navigation } from '../data/content'

export interface NavProps {
  /** Opens site search. The layout owns its state, so Nav only asks. */
  onOpenSearch?: () => void
}

export function Nav({ onOpenSearch }: NavProps) {
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)

  /* Clicking the link for the page you're already on used to run a full
     view transition of identical content — a flicker that read as a dead
     click. Skip the navigation and give the click a real result instead:
     scroll back to the top. */
  const sameRouteClick = (href: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    setMenuOpen(false)
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
      onKeyDown={(event) => {
        if (event.key === 'Escape' && menuOpen) {
          setMenuOpen(false)
          menuButton.current?.focus()
        }
      }}
    >
      <div className="nav-island pointer-events-auto flex h-12 w-full items-center gap-1 pl-4 pr-2 md:w-auto md:pl-5">
        <Link
          to="/"
          viewTransition
          className="brand shrink-0"
          aria-label="n3wth — home"
          onClick={sameRouteClick('/')}
        >
          <span>n3wth</span>
        </Link>

        <nav
          id="primary-navigation"
          aria-label="Primary"
          className={`${menuOpen ? 'flex' : 'hidden'} absolute inset-x-0 top-full mt-2 flex-col rounded-2xl border border-[var(--rail-strong)] bg-[var(--bg)] p-2 md:static md:ml-3 md:mt-0 md:flex md:flex-row md:items-center md:gap-0.5 md:rounded-none md:border-0 md:bg-transparent md:p-0`}
        >
          {navigation.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              viewTransition
              onClick={sameRouteClick(item.href)}
              className={({ isActive }) =>
                `nav-link max-md:min-h-12 ${isActive ? 'nav-link-active' : ''}`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        <span className="ml-auto inline-flex items-center gap-3 md:ml-2 md:gap-0.5">
          <span className="hidden md:inline-flex">
            <a
              href="https://github.com/n3wth/n3wth"
              rel="noopener me"
              className="nav-icon"
              aria-label="GitHub"
            >
              <Github size={16} aria-hidden="true" />
            </a>
          </span>
          <Link
            to="/contact"
            viewTransition
            onClick={sameRouteClick('/contact')}
            className="nav-icon"
            aria-label="Contact"
          >
            <Mail size={16} aria-hidden="true" />
          </Link>
          {onOpenSearch && (
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                onOpenSearch()
              }}
              className="nav-icon"
              aria-label="Search"
            >
              <Search size={16} aria-hidden="true" />
            </button>
          )}
          <span className="inline-flex md:hidden">
            <button
              ref={menuButton}
              type="button"
              className="nav-icon"
              aria-label="Primary"
              aria-controls="primary-navigation"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
            </button>
          </span>
        </span>
      </div>
    </header>
  )
}
