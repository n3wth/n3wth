import { useCallback, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Nav } from './components/Nav'
import { Footer } from './components/Footer'
import { useKonamiCode } from './hooks/useKonamiCode'
import { useKeyboardNav } from './hooks/useKeyboardNav'
import { useReveal } from './hooks/useReveal'
import { gsap } from './lib/gsap'
import Home from './pages/Home'
import Work from './pages/Work'
import Art from './pages/Art'
import Thinking from './pages/Thinking'
import Contact from './pages/Contact'

/** Jump to the top on route change (browser back/forward keeps its position). */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
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
      <ScrollToTop />
      <div className="pt-20">
        <div className="frame">
          <main id="main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/work" element={<Work />} />
              <Route path="/art" element={<Art />} />
              <Route path="/thinking" element={<Thinking />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </main>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default App
