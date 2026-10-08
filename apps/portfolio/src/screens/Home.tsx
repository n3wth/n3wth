import { withTheme } from '../components/withTheme'
import { Component, Suspense, lazy, useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { PageHeader } from '@n3wth/ui/site'
import { Button } from '@n3wth/ui/primitives'
import { track } from '../lib/analytics'
import { getSceneGraphics } from '../lib/sceneGraphics'

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

/* Catches three.js/context crashes at runtime and swaps in the still. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed
      ? (<><StaticNight /><div className="night-field-loader-tint" /></>)
      : this.props.children
  }
}

function Home() {

  const [reducedMotion, setReducedMotion] = useState(true)
  const [graphics, setGraphics] = useState<ReturnType<typeof getSceneGraphics>>('unavailable')
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      setGraphics(getSceneGraphics())
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  const onEnter = useCallback(
    (href: string) => window.location.assign(href),
    []
  )

  return (
    <>
    <section aria-label="Explore the night scene" className="bleed relative -mt-24" style={{ height: '100svh' }}>
      {graphics !== 'unavailable' ? (
        <SceneBoundary>
          <Suspense
            fallback={(
              <div className="night-field-loader" data-ready="false">
                <StaticNight />
                <div className="night-field-loader-tint" />
                <span className="sr-only" role="status">Loading scene</span>
              </div>
            )}
          >
            <NightField onEnter={onEnter} reducedMotion={reducedMotion} softwareRendering={graphics === 'software'} />
          </Suspense>
        </SceneBoundary>
      ) : (
        <>
          <StaticNight />
          <div className="night-field-loader-tint" />
        </>
      )}
    </section>
    <PageHeader
      className="site-content-gutter"
      title={<span data-nosnippet>I build new ways to work with AI.</span>}
      aside={
          <Button label="Explore my projects" variant="primary" size="md" href="/projects" clickAction={() => track('home_projects_clicked', { source_page: '/' })} />
      }
    />
    </>
  )
}

export default withTheme(Home)
