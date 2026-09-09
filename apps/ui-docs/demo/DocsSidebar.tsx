import { Link, NavLink } from 'react-router'
import { cn } from '@n3wth/ui'
import { SiteSectionLinks } from '@n3wth/ui/site'

export interface SidebarItem { id: string; label: string; href?: string }

export function DocsSidebar({ items, activeId, label, onSelect }: {
  items: SidebarItem[]
  activeId: string
  label: string
  onSelect?: (id: string) => void
}) {
  const links = () => <nav aria-label={label} className="space-y-1">
    {items.map(item => {
      const className = cn('w-full min-h-11 flex items-center px-3 py-2 rounded-lg text-sm text-left border',
        activeId === item.id ? 'bg-[var(--glass-bg)] text-[var(--color-white)] border-[var(--glass-border)]' : 'text-[var(--color-grey-400)] hover:text-[var(--color-white)] border-transparent')
      return item.href
        ? <NavLink key={item.id} to={item.href} className={className}>{item.label}</NavLink>
        : <button key={item.id} type="button" className={className} aria-current={activeId === item.id ? 'location' : undefined} onClick={() => onSelect?.(item.id)}>{item.label}</button>
    })}
  </nav>

  return <>
    <aside className="hidden lg:block"><div className="sticky top-20">{links()}</div></aside>
    <div className="lg:hidden"><SiteSectionLinks aria-label={label}>
      {items.map(item => {
        return item.href
          ? <Link key={item.id} to={item.href}>{item.label}</Link>
          : <button key={item.id} type="button" onClick={() => onSelect?.(item.id)}>{item.label}</button>
      })}
    </SiteSectionLinks></div>
  </>
}
