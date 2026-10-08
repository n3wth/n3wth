import { type MouseEvent } from 'react'
import { Search } from 'lucide-react'
import { SiteNavigation } from '@n3wth/ui/site'
import { navigation } from '../data/content'
import { useHydrated } from '../lib/navigation'

export interface NavProps { onOpenSearch?: () => void; searchOpen?: boolean; pathname?: string }

export function Nav({ onOpenSearch, searchOpen = false, pathname = '/' }: NavProps) {
  const ready = useHydrated()
  const sameRouteClick = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (href !== pathname || event.defaultPrevented || event.button !== 0
      || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  }
  return (
    <SiteNavigation
      navigationId="primary-navigation"
      controlsReady={ready}
      collapseAt="lg"
      compactBar
      menuLabel="Open menu"
      data-nosnippet
      brand={<a href="/" aria-label="Oliver Newth — home" onClick={sameRouteClick('/')}>Oliver Newth</a>}
      links={navigation.map((item) => <a key={item.href} href={item.href} aria-current={pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'page' : undefined} onClick={sameRouteClick(item.href)}>{item.name}</a>)}
      actions={<>
        {onOpenSearch && (
          <button
            type="button"
            disabled={!ready}
            onClick={onOpenSearch}
            aria-label="Search"
            aria-haspopup="dialog"
            aria-expanded={searchOpen}
            aria-controls="command-palette"
            aria-keyshortcuts="Control+K Meta+K /"
          >
            <Search size={16} aria-hidden="true" />
          </button>
        )}
      </>}
    />
  )
}
