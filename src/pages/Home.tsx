import { Component, Suspense, lazy, useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'
import { siteConfig } from '../data/content'

/* The front door is a field at night (three.js, lazy so the rest of the
   site never pays for it): every glowing structure is one of Oliver's
   works standing in for a page, and colored light — the medium of the
   art — is the only color on the site. The portal links below the scene
   are real anchors, so keyboard, touch, and no-WebGL visitors get the
   same doors. */

const NightField = lazy(() => import('../components/NightField'))

/* Static night: the FLORA playa photograph, for browsers without WebGL
   or when the GL context dies. Same mood, zero JS. */
function StaticNight() {
  return (
    <img
      src="/images/hero-playa.webp"
      alt=""
      aria-hidden
      className="absolute inset-0 h-full w-full object-cover"
    />
  )
}

function webglSupported(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

/* Catches three.js/context crashes at runtime and swaps in the still. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? <StaticNight /> : this.props.children
  }
}

const portals = [
  { href: '/work', label: 'Work' },
  { href: '/art', label: 'After dark' },
  { href: '/thinking', label: 'Thinking' },
  { href: '/contact', label: 'Contact' },
]

export default function Home() {
  usePageMeta(siteConfig.title, siteConfig.description)
  const navigate = useNavigate()

  const reducedMotion = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  )
  const webglOk = useMemo(webglSupported, [])

  const onEnter = useCallback(
    (href: string, external?: boolean) => {
      if (external) {
        window.location.href = href
      } else {
        navigate(href, { viewTransition: true })
      }
    },
    [navigate]
  )

  return (
    <section className="bleed relative -mt-20" style={{ height: '100svh' }}>
      {webglOk ? (
        <SceneBoundary>
          <Suspense
            fallback={<div className="absolute inset-0" style={{ background: '#08090b' }} />}
          >
            <NightField onEnter={onEnter} reducedMotion={reducedMotion} />
          </Suspense>
        </SceneBoundary>
      ) : (
        <StaticNight />
      )}

      {/* Hero copy over the dark left field */}
      <div className="absolute left-6 md:left-12 top-28 md:top-32 z-10 max-w-md pointer-events-none">
        <h1
          className="display text-[clamp(2.75rem,7vw,5.5rem)]"
          style={{ lineHeight: 0.9 }}
        >
          Oliver
          <br />
          Newth
        </h1>
        <p
          className="display mt-6 text-lg md:text-xl leading-snug"
          style={{ letterSpacing: '-0.02em' }}
        >
          AI at Google. <span className="accent">Art in the desert.</span>
        </p>
        <p
          className="mt-4 text-sm leading-relaxed max-w-sm"
          style={{ color: 'var(--ink-dim)' }}
        >
          I ship AI products by day and build large-scale light art after
          dark. This page is a field at night — everything glowing is
          somewhere to go.
        </p>
      </div>

      {/* Real doors: the same portals as the lights */}
      <nav
        aria-label="Site chapters"
        className="absolute inset-x-6 md:inset-x-12 bottom-6 md:bottom-8 z-10 flex flex-wrap items-center gap-x-7 gap-y-3"
      >
        {portals.map((p) => (
          <Link key={p.href} to={p.href} viewTransition className="world-door">
            {p.label}
          </Link>
        ))}
        <a href="https://garden.n3wth.com" className="world-door">
          The garden
        </a>
        <span className="ml-auto hidden md:inline meta pointer-events-none">
          Click a light to enter
        </span>
      </nav>
    </section>
  )
}
