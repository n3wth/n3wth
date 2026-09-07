import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6">
      <p className="font-mono text-sm text-ink-dim">404</p>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink">
        Page not found
      </h1>
      <p className="mt-2 text-ink-dim">
        The page you are looking for does not exist.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/"
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-dim"
        >
          Go home
        </Link>
        <Link
          href="/components"
          className="rounded-lg border border-rail px-5 py-2.5 text-sm font-medium text-ink-dim transition-colors hover:border-rail-strong hover:text-ink"
        >
          Browse components
        </Link>
      </div>
    </div>
  )
}
