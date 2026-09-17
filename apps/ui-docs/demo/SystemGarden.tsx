import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router'

export const gardenDestinations = [
  { label: 'Typography', href: '/components#typography', description: 'Give an idea its voice' },
  { label: 'Colour', href: '/components#tokens', description: 'Set the atmosphere' },
  { label: 'Controls', href: '/components#atoms', description: 'Make it respond' },
]

export function SystemGarden() {
  const host = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  useEffect(() => {
    let cancelled = false
    let dispose: (() => void) | undefined
    import('./systemGardenScene').then(({ mountGarden }) => {
      if (!cancelled && host.current) dispose = mountGarden(host.current, index => navigate(gardenDestinations[index].href))
    }).catch(() => { /* The destination links remain usable without WebGL. */ })
    return () => { cancelled = true; dispose?.() }
  }, [navigate])

  return <section className="system-garden" aria-label="Explore the design system">
    <div ref={host} className="system-garden-canvas" aria-hidden="true" />
    <nav className="system-garden-paths" aria-label="Design system paths">
      {gardenDestinations.map(item => <Link key={item.href} to={item.href}>
        <span>{item.label}</span><small>{item.description}</small>
      </Link>)}
    </nav>
  </section>
}
