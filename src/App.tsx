import { Suspense, lazy, useCallback } from 'react'
import { Nav } from './components/Nav'
import { Footer } from './components/Footer'
import { Rule, CornerTicks } from './components/Frame'
import { useKonamiCode } from './hooks/useKonamiCode'
import { useKeyboardNav } from './hooks/useKeyboardNav'
import { useReveal } from './hooks/useReveal'
import { gsap } from './lib/gsap'
import { Hero } from './components/sections/Hero'

const Experience = lazy(() => import('./components/sections/Experience').then((m) => ({ default: m.Experience })))
const Building = lazy(() => import('./components/sections/Building').then((m) => ({ default: m.Building })))
const Thinking = lazy(() => import('./components/sections/Thinking').then((m) => ({ default: m.Thinking })))
const AIExplainer = lazy(() => import('./components/sections/AIExplainer').then((m) => ({ default: m.AIExplainer })))
const Creative = lazy(() => import('./components/sections/Creative').then((m) => ({ default: m.Creative })))
const Contact = lazy(() => import('./components/sections/Contact').then((m) => ({ default: m.Contact })))

function SectionFallback() {
  return <div className="min-h-[60vh]" aria-hidden="true" />
}

function App() {
  const onKonami = useCallback(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const els = document.querySelectorAll('h1, h2, h3, .display')
    gsap.fromTo(
      els,
      { color: '#ffffff' },
      { clearProps: 'color', duration: 0.8, ease: 'power2.out' }
    )
  }, [])

  useKonamiCode(onKonami)
  useKeyboardNav()
  useReveal()

  return (
    <>
      <Nav />
      <div className="pt-20">
        <div className="frame">
          <CornerTicks />
          <main>
            <Hero />
            <Rule />
            <Suspense fallback={<SectionFallback />}>
              <Experience />
            </Suspense>
            <Rule />
            <Suspense fallback={<SectionFallback />}>
              <Building />
            </Suspense>
            <Rule />
            <Suspense fallback={<SectionFallback />}>
              <Creative />
            </Suspense>
            <Rule />
            <Suspense fallback={<SectionFallback />}>
              <Thinking />
            </Suspense>
            <Rule />
            <Suspense fallback={<SectionFallback />}>
              <AIExplainer />
            </Suspense>
            <Rule />
            <Suspense fallback={<SectionFallback />}>
              <Contact />
            </Suspense>
          </main>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default App
