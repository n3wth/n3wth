import type { ErrorBoundaryFallbackProps } from './ErrorBoundary'

export function AppErrorFallback({ error, resetErrorBoundary }: ErrorBoundaryFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="max-w-lg text-center">
        <p className="label mb-3">Site recovery</p>
        <h1 className="font-display text-3xl sm:text-4xl text-white text-glow mb-4">
          Something went wrong
        </h1>
        <p className="text-sm sm:text-base" style={{ color: 'var(--color-grey-400)' }}>
          The site hit an unexpected error. Reload to fetch a fresh copy or try again.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="cta-button btn-press px-5 py-2 text-sm"
          >
            Reload page
          </button>
          <button
            type="button"
            onClick={resetErrorBoundary}
            className="cta-button btn-press px-5 py-2 text-sm"
            style={{ color: 'var(--color-grey-200)' }}
          >
            Try again
          </button>
        </div>
        <p className="mt-5 text-xs" style={{ color: 'var(--color-grey-500)' }}>
          Error: {error.message || 'Unexpected error'}
        </p>
      </div>
    </div>
  )
}

interface SectionErrorFallbackProps extends ErrorBoundaryFallbackProps {
  sectionLabel: string
}

export function SectionErrorFallback({
  error,
  resetErrorBoundary,
  sectionLabel,
}: SectionErrorFallbackProps) {
  return (
    <section className="min-h-[60vh] flex items-center justify-center px-6 py-12">
      <div className="max-w-md text-center">
        <p className="label mb-3">Section unavailable</p>
        <h2 className="font-display text-2xl sm:text-3xl text-white mb-3">
          {sectionLabel} could not load
        </h2>
        <p className="text-sm sm:text-base" style={{ color: 'var(--color-grey-400)' }}>
          Refresh the page to fetch the latest content or try again.
        </p>
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="cta-button btn-press px-5 py-2 text-sm"
          >
            Reload page
          </button>
          <button
            type="button"
            onClick={resetErrorBoundary}
            className="cta-button btn-press px-5 py-2 text-sm"
            style={{ color: 'var(--color-grey-200)' }}
          >
            Try again
          </button>
        </div>
        <p className="mt-4 text-xs" style={{ color: 'var(--color-grey-600)' }}>
          Error: {error.message || 'Unexpected error'}
        </p>
      </div>
    </section>
  )
}
