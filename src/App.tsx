import { useCallback, useEffect } from 'react'
import { Outlet, useLocation, useNavigationType } from 'react-router-dom'
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
  const navigationType = useNavigationType()
  useEffect(() => {
    // POP = back/forward: let the browser restore the previous position
    // instead of clobbering it with the top of the page.
    if (navigationType === 'POP') return
    window.scrollTo(0, 0)
  }, [pathname, navigationType])
  return null
}

function App() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
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
            {/* tabIndex so the skip link moves DOM focus here, not just
                the scroll position */}
            <main id="main" tabIndex={-1} style={{ outline: 'none' }}>
              <Outlet />
            </main>
          </div>
        </div>
        {/* the home page is a single full-viewport scene — no footer,
            nothing to scroll to */}
        {!isHome && <Footer />}
      </LinkProvider>
    </Theme>
  )
}

export default App
