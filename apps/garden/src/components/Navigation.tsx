'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search } from 'lucide-react'
import { SearchPalette, type PaletteNote } from '@/components/SearchPalette'
import { SiteNavigation } from '@n3wth/ui/site'
import { Icon } from '@n3wth/ui'
import { site } from '@/lib/site'

const navItems = [
  { label: 'Notes', href: '/notes' },
  { label: 'Graph', href: '/graph' },
  { label: 'Groves', href: '/tags' },
  { label: 'About', href: '/about' },
]


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
      <SiteNavigation
        brand={<Link href="/">n3wth/garden</Link>}
        links={navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isSelected(item.href) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
        actions={<>
            <button
              type="button"
              onClick={openSearch}
              aria-label="Search notes"
            >
              <Search size={16} aria-hidden="true" />
            </button>
            <a
              href={site.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View source on GitHub"
            >
              <Icon name="github" size="md" />
            </a>
        </>}
      />

      <SearchPalette notes={paletteNotes} isOpen={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
