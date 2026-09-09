import { type MouseEvent } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Mail, Search } from 'lucide-react'
import { Icon } from '@n3wth/ui'
import { SiteNavigation } from '@n3wth/ui/site'
import { navigation } from '../data/content'

export interface NavProps { onOpenSearch?: () => void }

export function Nav({ onOpenSearch }: NavProps) {
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
      menuLabel="Primary"
      data-nosnippet
      brand={<Link to="/" viewTransition aria-label="n3wth — home" onClick={sameRouteClick('/')}>n3wth</Link>}
      links={navigation.map((item) => <NavLink key={item.href} to={item.href} viewTransition onClick={sameRouteClick(item.href)}>{item.name}</NavLink>)}
      actions={<>
        <a href="https://github.com/n3wth/n3wth" rel="noopener me" aria-label="GitHub"><Icon name="github" size="md" /></a>
        <Link to="/contact" viewTransition onClick={sameRouteClick('/contact')} aria-label="Contact"><Mail size={16} aria-hidden="true" /></Link>
        {onOpenSearch && <button type="button" onClick={onOpenSearch} aria-label="Search"><Search size={16} aria-hidden="true" /></button>}
      </>}
    />
  )
}
