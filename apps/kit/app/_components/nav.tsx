'use client'

import { Icon } from '@n3wth/ui'
import { SiteNavigation } from '@n3wth/ui/site'
import Link from 'next/link'

const links = [{ href: '/docs/getting-started', label: 'Docs' }]

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

export function Nav() {
  return (
    <SiteNavigation
      brand={<Link href="/">n3wth/kit</Link>}
      links={links.map((link) => (
        <Link key={link.href} href={link.href}>
          {link.label}
        </Link>
      ))}
      actions={
        <>
          <a
            href="https://github.com/n3wth/n3wth/tree/main/apps/kit"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <Icon name="github" size="md" />
          </a>
          <a href="mailto:hey@n3wth.com" aria-label="Contact">
            <MailIcon className="h-4 w-4" />
          </a>
        </>
      }
    />
  )
}
