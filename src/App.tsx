import { Suspense } from 'react'
import type { ReactNode } from 'react'
import { Nav } from './components/Nav'
import { Footer } from './components/Footer'
import { NoiseOverlay } from './components/NoiseOverlay'
import { BackgroundElements } from './components/BackgroundElements'
import { SmoothScroll } from './components/SmoothScroll'
import { ErrorBoundary } from './components/ErrorBoundary'
import { SectionErrorFallback } from './components/ErrorFallback'
import { Hero } from './components/sections/Hero'
import { lazyWithRetry } from './utils/lazyWithRetry'

// Lazy load below-fold sections for better initial load performance
const Experience = lazyWithRetry(
  () => import('./components/sections/Experience').then(m => ({ default: m.Experience }))
)
const Frameworks = lazyWithRetry(
  () => import('./components/sections/Frameworks').then(m => ({ default: m.Frameworks }))
)
const Creative = lazyWithRetry(
  () => import('./components/sections/Creative').then(m => ({ default: m.Creative }))
)
const Contact = lazyWithRetry(
  () => import('./components/sections/Contact').then(m => ({ default: m.Contact }))
)

// Minimal loading fallback to prevent layout shift
function SectionFallback() {
  return <div className="min-h-screen" aria-hidden="true" />
}

interface LazySectionProps {
  label: string
  children: ReactNode
}

function LazySection({ label, children }: LazySectionProps) {
  return (
    <ErrorBoundary
      fallback={(props) => <SectionErrorFallback sectionLabel={label} {...props} />}
    >
      <Suspense fallback={<SectionFallback />}>{children}</Suspense>
    </ErrorBoundary>
  )
}

function App() {
  return (
    <SmoothScroll>
      <BackgroundElements />
      <NoiseOverlay />
      <Nav />
      <main>
        <Hero />
        <LazySection label="Experience">
          <Experience />
        </LazySection>
        <LazySection label="Frameworks">
          <Frameworks />
        </LazySection>
        <LazySection label="Creative">
          <Creative />
        </LazySection>
        <LazySection label="Contact">
          <Contact />
        </LazySection>
      </main>
      <Footer />
    </SmoothScroll>
  )
}

export default App
