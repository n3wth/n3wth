import { useCallback, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Theme } from '@astryxdesign/core/theme'
import { LinkProvider } from '@astryxdesign/core/Link'
import { RouterLink } from './components/RouterLink'
import { Nav } from './components/Nav'
import { Footer } from './components/Footer'
import { useKonamiCode } from './hooks/useKonamiCode'
import { useKeyboardNav } from './hooks/useKeyboardNav'
import { useReveal } from './hooks/useReveal'
import { gsap } from './lib/gsap'
import { n3wthTheme } from './theme/n3wthTheme'

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
    <Theme theme={n3wthTheme} mode="dark">
      <LinkProvider component={RouterLink}>
        <Nav />
        <ScrollToTop />
        <div className="pt-20">
          <div className="frame">
            <main id="main">
              <Outlet />
            </main>
          </div>
        </div>
        <Footer />
      </LinkProvider>
    </Theme>
  )
}

export default App
