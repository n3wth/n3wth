'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'next-view-transitions'
import { usePathname } from 'next/navigation'
import { Search } from 'lucide-react'
import { SearchPalette, type PaletteNote } from '@/components/SearchPalette'
import { ShimmerText } from '@/components/ShimmerText'
import { site } from '@/lib/site'

const navItems = [
  { label: 'Notes', href: '/notes' },
  { label: 'Graph', href: '/graph' },
  { label: 'Groves', href: '/tags' },
  { label: 'About', href: '/about' },
]

function GitHubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
    </svg>
  )
}

export function Navigation({ paletteNotes }: { paletteNotes: PaletteNote[] }) {
  const pathname = usePathname()
  const [searchOpen, setSearchOpen] = useState(false)
  const searchOpenerRef = useRef<HTMLElement | null>(null)
  const searchWasOpen = useRef(false)

  const openSearch = useCallback(() => {
    searchOpenerRef.current = document.activeElement as HTMLElement | null
    setSearchOpen(true)
  }, [])

  useEffect(() => {
    if (searchOpen) {
      searchWasOpen.current = true
    } else if (searchWasOpen.current) {
      searchWasOpen.current = false
      if (searchOpenerRef.current?.isConnected) searchOpenerRef.current.focus()
      searchOpenerRef.current = null
    }
  }, [searchOpen])

  const isSelected = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`)

  return (
    <>
      {/* Floating island nav — no hamburger, all links visible */}
      <header
        className="site-nav fixed inset-x-3 md:inset-x-4 z-50 flex justify-center pointer-events-none"
        style={{ top: 'calc(0.75rem + env(safe-area-inset-top))' }}
      >
        <div className="nav-island pointer-events-auto items-center gap-1">
          <Link
            href="/"
            className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--color-text-primary)] whitespace-nowrap"
          >
            <ShimmerText>
              n3wth<span className="text-[var(--color-text-disabled)]">/</span>garden
            </ShimmerText>
          </Link>

          <nav aria-label="Main navigation" className="flex items-center gap-0.5 min-[601px]:ml-2 md:ml-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${isSelected(item.href) ? 'nav-link-active' : ''}`}
                aria-current={isSelected(item.href) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <span className="min-[601px]:ml-2 md:ml-3 inline-flex items-center gap-1">
            <button
              type="button"
              onClick={openSearch}
              className="nav-search"
              aria-label="Search notes"
            >
              <Search size={16} aria-hidden="true" />
            </button>
            <a
              href={site.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-search"
              aria-label="View source on GitHub"
            >
              <GitHubIcon size={16} />
            </a>
          </span>
        </div>
      </header>

      <SearchPalette notes={paletteNotes} isOpen={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
