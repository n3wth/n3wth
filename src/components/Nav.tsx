import { Nav as N3wthNav, type NavItem } from '@n3wth/ui'
import { navigation } from '../data/content'

const navItems: NavItem[] = navigation.map((item) => ({
  label: item.name,
  href: item.href,
  external: item.external,
}))

export function Nav() {
  return (
    <N3wthNav
      logo="n3wth"
      logoHref="/"
      items={navItems}
      showThemeToggle={false}
      className="mx-auto max-w-6xl py-4 md:py-6"
    />
  )
}
