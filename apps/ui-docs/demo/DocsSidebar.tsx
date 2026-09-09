import { useRef, useState } from 'react'
import { NavLink } from 'react-router'
import { Collapsible } from '@n3wth/ui/primitives'
import { cn } from '@n3wth/ui'

export interface SidebarItem { id: string; label: string; href?: string }

export function DocsSidebar({ items, activeId, label, onSelect }: {
  items: SidebarItem[]
  activeId: string
  label: string
  onSelect?: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const mobile = useRef<HTMLDivElement>(null)
  const links = () => <nav aria-label={label} className="space-y-1" onClick={() => setOpen(false)}>
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
    <div ref={mobile} className="lg:hidden sticky top-16 z-30 py-3 bg-[var(--color-bg)] border-b border-[var(--glass-border)]" onKeyDown={event => {
      if (event.key === 'Escape' && open) {
        event.stopPropagation()
        setOpen(false)
        mobile.current?.querySelector('button')?.focus()
      }
    }}>
      <Collapsible trigger={`${label}: ${items.find(item => item.id === activeId)?.label ?? 'Navigate'}`} isOpen={open} onOpenChange={setOpen}>
        {links()}
      </Collapsible>
    </div>
  </>
}
