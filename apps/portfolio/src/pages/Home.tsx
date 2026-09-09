import { Component, Suspense, lazy, useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'
import { siteConfig } from '../data/content'
import { PageHeader } from '@n3wth/ui/site'

/* The front door is a field at night (three.js, lazy so the rest of the
   site never pays for it): every glowing structure is one of Oliver's
   works standing in for a page, and colored light — the medium of the
   art — is the only color on the site. The header provides ordinary
   navigation for keyboard, touch, and no-WebGL visitors. */

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

export default function Home() {
  usePageMeta(siteConfig.title, siteConfig.description, {
    ogImage: '/og-image.png',
  })
  const navigate = useNavigate()

  const reducedMotion = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  )
  const webglOk = useMemo(() => webglSupported(), [])

  const onEnter = useCallback(
    (href: string, external?: boolean) => {
      if (external) {
        window.location.href = href
      } else {
        navigate(href)
      }
    },
    [navigate]
  )

  return (
    <>
    <section aria-label="Explore the night scene" className="bleed relative -mt-24" style={{ height: '100svh' }}>
      {webglOk ? (
        <SceneBoundary>
          <Suspense
            fallback={(
              <div className="night-field-loader" data-ready="false">
                <StaticNight />
                <div className="night-field-loader-tint" />
                <div className="night-field-loader-status" role="status">
                  <span>Night field</span>
                  <span>Loading</span>
                  <span className="night-field-loader-track" aria-hidden>
                    <span style={{ transform: 'scaleX(0.08)' }} />
                  </span>
                </div>
              </div>
            )}
          >
            <NightField onEnter={onEnter} reducedMotion={reducedMotion} />
          </Suspense>
        </SceneBoundary>
      ) : (
        <StaticNight />
      )}

    </section>
    <PageHeader className="site-content-gutter" title="I build new ways to work with AI." description={<>
      <span className="block mb-4">{siteConfig.name}</span>
      <span className="block">
        I’m a product leader who spots opportunities, builds early versions, and learns by putting them in people’s hands.
      </span>
      <span className="block mt-5">
        My independent projects explore personal agents, tools for creating software, and skills that help people use both.
      </span>
    </>} actions={<Link to="/work#building">Explore my projects</Link>} />
    </>
  )
}
