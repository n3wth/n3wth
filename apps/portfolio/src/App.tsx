import { Suspense, useCallback, useEffect } from 'react'
import { Outlet, useLocation, useNavigationType } from 'react-router-dom'
import { N3wthProvider } from '@n3wth/ui/site'
import { LinkProvider } from '@n3wth/ui/primitives'
import { RouterLink } from './components/RouterLink'
import { Nav } from './components/Nav'
import { Footer } from './components/Footer'
import { CommandPalette } from './components/CommandPalette'
import { useCommandPalette } from './hooks/useCommandPalette'
import { useKonamiCode } from './hooks/useKonamiCode'
import { useKeyboardNav } from './hooks/useKeyboardNav'

/** Jump to the top on route change (browser back/forward keeps its position),
    unless the new location names somewhere specific to land. */
function ScrollToTop() {
  // location.key changes on every navigation, including same-path replaces
  // (re-clicking the active nav tab) — pathname alone misses those, leaving
  // the click a silent no-op.
  const { key, hash, state } = useLocation()
  const navigationType = useNavigationType()
  useEffect(() => {
    // POP = back/forward: let the browser restore the previous position
    // instead of clobbering it with the top of the page.
    if (navigationType === 'POP' && key !== 'default') return
    if (navigationType !== 'POP' && state?.preserveScroll) return

    /* A hash is a request for one place on the page, and router navigations
       don't honour it on their own — the command palette deep-links into
       /library#ui-tooltip and friends, so without this every one of those
       results would change the URL and then dump the reader at the masthead.
       getElementById rather than querySelector: an id is not necessarily a
       valid CSS selector, and a thrown error here would take the scroll
       reset down with it. The rAF retry covers a target that mounts a frame
       late, which happens when the hash arrives from another route. */
    if (hash.length > 1) {
      let id = hash.slice(1)
      try {
        id = decodeURIComponent(id)
      } catch {
        // Malformed URL fragments must not take down the route. A literal
        // percent sign can also be part of an element's ID.
      }
      const land = () => {
        const target = document.getElementById(id)
        if (target) target.scrollIntoView({ block: 'start' })
        return Boolean(target)
      }
      if (land()) return
      const frame = requestAnimationFrame(land)
      return () => cancelAnimationFrame(frame)
    }

    window.scrollTo(0, 0)
  }, [key, hash, navigationType, state])
  return null
}

function App() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const onKonami = useCallback(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const els = document.querySelectorAll('h1, h2, h3, .display')
    import('./lib/gsap').then(({ gsap }) => {
      gsap.fromTo(
        els,
        { color: '#ffffff' },
        { clearProps: 'color', duration: 0.8, ease: 'power2.out' }
      )
    })
  }, [])

  useKonamiCode(onKonami)
  useKeyboardNav()

  // Lives in the shell, not on a page: search has to open from anywhere,
  // and the palette is how the four n3wth sites are searchable as one.
  const { open: searchOpen, setOpen: setSearchOpen, toggle: toggleSearch } = useCommandPalette()
  const closeSearch = useCallback(() => setSearchOpen(false), [setSearchOpen])

  return (
    <N3wthProvider mode="dark">
      <LinkProvider component={RouterLink}>
        <a href="#main" className="skip-link">Skip to content</a>
        <Nav onOpenSearch={toggleSearch} searchOpen={searchOpen} />
        <CommandPalette open={searchOpen} onClose={closeSearch} />
        <Suspense fallback={
          <main id="main" tabIndex={-1} className="n3wth-site-main" aria-busy="true">
            <span className="sr-only" role="status">Loading page</span>
          </main>
        }>
          <ScrollToTop />
          <div className="n3wth-site-main">
            <div className="frame">
              <main id="main" tabIndex={-1}>
                <Outlet />
              </main>
            </div>
          </div>
          {!isHome && <Footer />}
        </Suspense>
      </LinkProvider>
    </N3wthProvider>
  )
}

export default App
