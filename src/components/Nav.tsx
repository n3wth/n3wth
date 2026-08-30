import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, MouseEvent } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { IconButton } from '@astryxdesign/core/IconButton'
import { Menu, Search, X } from 'lucide-react'
import { CursorMark } from './marks'
import { navigation } from '../data/content'

export interface NavProps {
  /** Opens site search. The layout owns its state, so Nav only asks. */
  onOpenSearch?: () => void
}

export function Nav({ onOpenSearch }: NavProps) {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  // Any navigation closes the sheet — including back/forward gestures and
  // programmatic navigations that never touch the menu's own links.
  // (State adjusted during render, per React's derived-state-reset pattern.)
  const [prevPathname, setPrevPathname] = useState(pathname)
  if (prevPathname !== pathname) {
    setPrevPathname(pathname)
    setOpen(false)
  }

  // The sheet and its toggle are md:hidden — if the viewport crosses into
  // the desktop layout while open (rotation, window resize), close it so
  // the body scroll lock can't outlive its only visible way out.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Lock body scroll while the full-screen menu is open; Escape closes it
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  /* The sheet is a modal: focus moves to its close button on open, Tab
     wraps at its edges instead of walking into the covered page, and
     focus returns to the opener on close. */
  const menuRef = useRef<HTMLDivElement>(null)
  const closeWrapRef = useRef<HTMLSpanElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  useEffect(() => {
    if (!open) {
      if (openerRef.current?.isConnected) openerRef.current.focus()
      openerRef.current = null
      return
    }
    openerRef.current = (document.activeElement as HTMLElement | null) ?? null
    const menu = menuRef.current
    closeWrapRef.current?.querySelector('button')?.focus()
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !menu) return
      const focusables = menu.querySelectorAll<HTMLElement>('a, button')
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

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
    <>
      {/* Floating island nav */}
      <header
        className="site-nav fixed inset-x-3 md:inset-x-4 z-50 flex md:justify-center pointer-events-none"
        style={{ top: 'calc(0.75rem + env(safe-area-inset-top))' }}
      >
        <div className="nav-island pointer-events-auto flex h-12 w-full items-center gap-1 pl-4 pr-2 md:w-auto md:pl-5">
          <Link
            to="/"
            viewTransition
            className="brand shrink-0"
            aria-label="n3wth — home"
            onClick={sameRouteClick('/')}
          >
            <span className="brand-mark shrink-0" aria-hidden="true">
              <CursorMark size={18} />
            </span>
            <span>n3wth</span>
          </Link>

          <nav aria-label="Primary" className="hidden md:flex items-center gap-0.5 ml-3">
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

          <span className="ml-auto inline-flex items-center gap-1">
            {onOpenSearch && (
              <button
                type="button"
                onClick={onOpenSearch}
                className="nav-search"
                aria-label="Search"
              >
                <Search size={16} aria-hidden="true" />
              </button>
            )}
            <IconButton
              className="nav-burger md:hidden"
              label={open ? 'Close menu' : 'Open menu'}
              icon={open ? <X size={18} /> : <Menu size={18} />}
              variant="ghost"
              onClick={() => setOpen((value) => !value)}
            />
          </span>
        </div>
      </header>

      {/* Full-screen mobile menu — app-style sheet with large tap targets */}
      {open && (
        <div
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className="mobile-menu fixed inset-0 z-[70] md:hidden flex flex-col"
          style={{
            background: 'var(--bg)',
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          <div className="flex items-center justify-between h-16 px-4">
            <span className="brand" aria-hidden="true">
              <span className="brand-mark shrink-0">
                <CursorMark size={18} />
              </span>
              <span>n3wth</span>
            </span>
            <span ref={closeWrapRef}>
              <IconButton
                label="Close navigation"
                icon={<X size={20} />}
                variant="ghost"
                size="lg"
                onClick={() => setOpen(false)}
              />
            </span>
          </div>
          {/* Scrollable on short (landscape) viewports so the last link is
              always reachable; overscroll-contain + touch-pan-y keep iOS
              from rubber-banding the locked page beneath. */}
          <nav
            className="mobile-nav flex flex-1 min-h-0 flex-col overflow-y-auto overscroll-contain touch-pan-y px-4 pt-2 pb-4"
            aria-label="Mobile navigation"
          >
            {onOpenSearch && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  onOpenSearch()
                }}
                className="mobile-nav-link mobile-nav-row w-full"
                style={{ '--row-i': 0 } as CSSProperties}
              >
                <span className="mobile-nav-link-label">Search</span>
              </button>
            )}
            {navigation.map((item, i) => (
              <NavLink
                key={item.href}
                to={item.href}
                viewTransition
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `mobile-nav-link mobile-nav-row ${isActive ? 'mobile-nav-link-active' : ''}`
                }
                style={{ '--row-i': i + 1 } as CSSProperties}
              >
                <span className="mobile-nav-link-label">{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}
