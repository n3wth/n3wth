'use client'

import { Icon } from '@n3wth/ui'
import { SiteNavigation } from '@n3wth/ui/site'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { siteConfig } from '../config/site'

const navItems = [
  { label: 'Bundles', href: '/curated-bundles' },
  { label: 'Workflows', href: '/workflows' },
  { label: 'Contribute', href: '/contribute' },
  { label: 'About', href: '/about' },
]

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 7l-10 6L2 7" />
    </svg>
  )
}

export function IslandNav() {
  const pathname = usePathname()
  return (
    <SiteNavigation
      brand={<Link href="/">{siteConfig.name}</Link>}
      links={<>{navItems.map(item => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? 'page' : undefined}>{item.label}</Link>)}</>}
      actions={<>
        <a href="mailto:hey@n3wth.com" aria-label="Contact via email"><MailIcon className="w-4 h-4" /></a>
        <a href={siteConfig.links.github} target="_blank" rel="noopener noreferrer" aria-label="View on GitHub"><Icon name="github" size="md" /></a>
      </>}
    />
  )
}
