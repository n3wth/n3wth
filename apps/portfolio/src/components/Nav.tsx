import { type MouseEvent } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Search } from 'lucide-react'
import { SiteNavigation } from '@n3wth/ui/site'
import { navigation } from '../data/content'

export interface NavProps { onOpenSearch?: () => void; searchOpen?: boolean }

export function Nav({ onOpenSearch, searchOpen = false }: NavProps) {
  const { pathname } = useLocation()
  const sameRouteClick = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (href !== pathname) return
    event.preventDefault()
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  }
  return (
    <SiteNavigation
      navigationId="primary-navigation"
      menuLabel="Open menu"
      data-nosnippet
      brand={<Link to="/" aria-label="Oliver Newth — home" onClick={sameRouteClick('/')}>Oliver Newth</Link>}
      links={navigation.map((item) => <NavLink key={item.href} to={item.href} onClick={sameRouteClick(item.href)}>{item.name}</NavLink>)}
      actions={<>
        {onOpenSearch && (
          <button
            type="button"
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
