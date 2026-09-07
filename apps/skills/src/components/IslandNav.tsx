'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { siteConfig } from '../config/site'

const navItems = [
  { label: 'Bundles', href: '/curated-bundles' },
  { label: 'Workflows', href: '/workflows' },
  { label: 'Contribute', href: '/contribute' },
  { label: 'About', href: '/about' },
]

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"
      />
    </svg>
  )
}

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
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let lastY = 0
    const onScroll = () => {
      const y = window.scrollY
      setHidden(y > lastY && y > 100)
      lastY = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className="fixed top-4 z-50 transition-all duration-300"
      style={{
        left: '50%',
        transform: hidden
          ? 'translateX(-50%) translateY(-150%)'
          : 'translateX(-50%)',
        width: 'max-content',
      }}
      aria-label="Main navigation"
    >
      <div className="island-nav flex items-center gap-1 px-2 py-1.5 rounded-full w-max">
        {/* Logo/Home */}
        <Link
          href="/"
          className="px-3 py-1.5 text-sm font-medium text-white hover:opacity-80 transition-opacity"
        >
          {siteConfig.name}
        </Link>

        {/* Separator */}
        <div className="w-px h-4 bg-[var(--glass-border)]" />

        {/* Primary links - hidden on mobile */}
        <div className="hidden md:flex items-center gap-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                  isActive
                    ? 'text-white bg-white/10'
                    : 'text-[var(--color-grey-300)] hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* Separator - hidden on mobile */}
        <div className="hidden md:block w-px h-4 bg-[var(--glass-border)]" />

        {/* Icon links */}
        <div className="flex items-center gap-0.5">
          <a
            href="mailto:hey@n3wth.com"
            className="p-2 text-[var(--color-grey-300)] hover:text-white hover:bg-white/5 rounded-full transition-colors"
            aria-label="Contact via email"
          >
            <MailIcon className="w-4 h-4" />
          </a>
          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-[var(--color-grey-300)] hover:text-white hover:bg-white/5 rounded-full transition-colors"
            aria-label="View on GitHub"
          >
            <GitHubIcon className="w-4 h-4" />
          </a>
        </div>
      </div>
    </nav>
  )
}
