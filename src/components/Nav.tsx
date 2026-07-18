import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { IconButton } from '@astryxdesign/core/IconButton'
import { Menu, X } from 'lucide-react'
import { CursorMark } from './marks'
import { navigation } from '../data/content'

export function Nav() {
  const [open, setOpen] = useState(false)

  // Close the mobile menu after client-side navigation
  const { pathname } = useLocation()
  useEffect(() => {
    setOpen(false)
  }, [pathname])

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

  return (
    <>
      {/* Floating island nav */}
      <header
        className="site-nav fixed inset-x-3 md:inset-x-4 z-50 flex md:justify-center pointer-events-none"
        style={{ top: 'calc(0.75rem + env(safe-area-inset-top))' }}
      >
        <div className="nav-island pointer-events-auto flex h-12 w-full items-center gap-1 pl-4 pr-2 md:w-auto md:pl-5">
          <Link to="/" viewTransition className="brand shrink-0" aria-label="n3wth — home">
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
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'nav-link-active' : ''}`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          <span className="md:hidden ml-auto inline-flex items-center">
            <IconButton
              label={open ? 'Close menu' : 'Open menu'}
              icon={open ? <X size={18} /> : <Menu size={18} />}
              variant="ghost"
              onClick={() => setOpen((v) => !v)}
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
          <nav className="flex flex-col gap-1 px-4 pt-2" aria-label="Mobile navigation">
            {navigation.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                viewTransition
                onClick={() => setOpen(false)}
                className="mobile-nav-link"
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}
