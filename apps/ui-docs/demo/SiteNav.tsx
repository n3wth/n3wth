import { NavLink } from 'react-router'
import { Icon } from '@n3wth/ui'
import { SiteNavigation } from '@n3wth/ui/site'

export function SiteNav() {
  return (
    <SiteNavigation
      brand={<NavLink to="/">n3wth/ui</NavLink>}
      links={<>
        <NavLink to="/" end>Components</NavLink>
        <NavLink to="/docs/getting-started">Docs</NavLink>
      </>}
      actions={<a href="https://github.com/n3wth/ui" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><Icon name="github" size="md" /></a>}
    />
  )
}
