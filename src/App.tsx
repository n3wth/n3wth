import { Suspense, lazy } from 'react'
import { Nav } from './components/Nav'
import { Footer } from './components/Footer'
import { SmoothScroll } from './components/SmoothScroll'
import { Hero } from './components/sections/Hero'

// Lazy load decorative elements - not critical for FCP
const NoiseOverlay = lazy(() => import('./components/NoiseOverlay').then(m => ({ default: m.NoiseOverlay })))
const BackgroundElements = lazy(() => import('./components/BackgroundElements').then(m => ({ default: m.BackgroundElements })))

// Lazy load below-fold sections for better initial load performance
const Experience = lazy(() => import('./components/sections/Experience').then(m => ({ default: m.Experience })))
const Frameworks = lazy(() => import('./components/sections/Frameworks').then(m => ({ default: m.Frameworks })))
const Creative = lazy(() => import('./components/sections/Creative').then(m => ({ default: m.Creative })))
const Contact = lazy(() => import('./components/sections/Contact').then(m => ({ default: m.Contact })))

// Minimal loading fallback to prevent layout shift
function SectionFallback() {
  return <div className="min-h-screen" aria-hidden="true" />
}

function App() {
  return (
    <SmoothScroll>
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
          <Frameworks />
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
