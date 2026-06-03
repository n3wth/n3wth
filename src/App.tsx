import { Suspense, lazy, useCallback } from 'react'
import { Nav } from './components/Nav'
import { Footer } from './components/Footer'
import { SmoothScroll } from './components/SmoothScroll'
import { GameCursor } from './components/GameCursor'
import { ScrollProgress } from './components/ScrollProgress'
import { AmbientAgent } from './components/AmbientAgent'
import { AgentPresence } from './components/AgentPresence'
import { useKonamiCode } from './hooks/useKonamiCode'
import { useKeyboardNav } from './hooks/useKeyboardNav'
import { gsap } from './lib/gsap'
import { Hero } from './components/sections/Hero'

// Lazy load decorative elements - not critical for FCP
const NoiseOverlay = lazy(() => import('./components/NoiseOverlay').then(m => ({ default: m.NoiseOverlay })))
const BackgroundElements = lazy(() => import('./components/BackgroundElements').then(m => ({ default: m.BackgroundElements })))

// Lazy load below-fold sections for better initial load performance
const Experience = lazy(() => import('./components/sections/Experience').then(m => ({ default: m.Experience })))
const Thinking = lazy(() => import('./components/sections/Thinking').then(m => ({ default: m.Thinking })))
const Building = lazy(() => import('./components/sections/Building').then(m => ({ default: m.Building })))
const Frameworks = lazy(() => import('./components/sections/Frameworks').then(m => ({ default: m.Frameworks })))
const AIExplainer = lazy(() => import('./components/sections/AIExplainer').then(m => ({ default: m.AIExplainer })))
const Creative = lazy(() => import('./components/sections/Creative').then(m => ({ default: m.Creative })))
const Contact = lazy(() => import('./components/sections/Contact').then(m => ({ default: m.Contact })))

// Minimal loading fallback to prevent layout shift
function SectionFallback() {
  return <div className="min-h-screen" aria-hidden="true" />
}

const ACCENT_COLORS = ['#FF6B9D', '#5DADE2', '#FFD93D', '#A78BFA']

function App() {
  const onKonami = useCallback(() => {
    const color = ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)]
    const els = document.querySelectorAll('h1, h2, h3, p, span, a')
    gsap.to(els, {
      color,
      duration: 0.3,
      onComplete: () => {
        gsap.to(els, { clearProps: 'color', duration: 0.5 })
      },
    })
  }, [])

  useKonamiCode(onKonami)
  useKeyboardNav()

  return (
    <SmoothScroll>
      <GameCursor />
      <ScrollProgress />
      <AmbientAgent />
      <AgentPresence />
      {/* Decorative elements lazy-loaded to prioritize FCP */}
      <Suspense fallback={null}>
        <BackgroundElements />
        <NoiseOverlay />
      </Suspense>
      <Nav />
      <main>
        <Hero />
        <Suspense fallback={<SectionFallback />}>
          <Experience />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <Building />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <Thinking />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <Frameworks />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <AIExplainer />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <Creative />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <Contact />
        </Suspense>
      </main>
      <Footer />
    </SmoothScroll>
  )
}

export default App
