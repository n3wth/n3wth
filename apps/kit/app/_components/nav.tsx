import Link from 'next/link'

const links = [
  { href: '/docs/getting-started', label: 'Docs' },
]

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

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
    <nav className="fixed top-4 left-1/2 z-50 -translate-x-1/2 isolate">
      <div
        className="nav-blur-pill flex items-center gap-1 rounded-full border border-rail/50 px-1.5 py-1.5"
        style={{
          backgroundColor: 'hsl(var(--background) / 0.72)',
          WebkitBackdropFilter: 'blur(16px) saturate(1.2)',
          backdropFilter: 'blur(16px) saturate(1.2)',
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          className="rounded-full px-3 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-bg-raise"
        >
          n3wth/kit
        </Link>

        {/* Separator */}
        <div className="h-4 w-px bg-rail" />

        {/* Links */}
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-full px-3 py-1.5 text-sm text-ink-dim transition-colors hover:bg-bg-raise hover:text-ink"
          >
            {l.label}
          </Link>
        ))}

        {/* Separator */}
        <div className="h-4 w-px bg-rail" />

        {/* Icons */}
        <a
          href="https://github.com/n3wth/kit"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-8 w-8 items-center justify-center rounded-full text-ink-dim transition-colors hover:bg-bg-raise hover:text-ink"
          aria-label="GitHub"
        >
          <GitHubIcon className="h-4 w-4" />
        </a>

        <a
          href="mailto:hey@n3wth.com"
          className="flex h-8 w-8 items-center justify-center rounded-full text-ink-dim transition-colors hover:bg-bg-raise hover:text-ink"
          aria-label="Contact"
        >
          <MailIcon className="h-4 w-4" />
        </a>
      </div>
    </nav>
  )
}
