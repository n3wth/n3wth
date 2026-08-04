import { useCallback, useEffect } from 'react'
import { Outlet, useLocation, useNavigationType } from 'react-router-dom'
import { Theme } from '@astryxdesign/core/theme'
import { LinkProvider } from '@astryxdesign/core/Link'
import { RouterLink } from './components/RouterLink'
import { Nav } from './components/Nav'
import { Footer } from './components/Footer'
import { CommandPalette } from './components/CommandPalette'
import { useCommandPalette } from './hooks/useCommandPalette'
import { useKonamiCode } from './hooks/useKonamiCode'
import { useKeyboardNav } from './hooks/useKeyboardNav'
import { useReveal } from './hooks/useReveal'
import { gsap } from './lib/gsap'
import { n3wthTheme } from './theme/n3wthTheme'

/** Jump to the top on route change (browser back/forward keeps its position),
    unless the new location names somewhere specific to land. */
function ScrollToTop() {
  // location.key changes on every navigation, including same-path replaces
  // (re-clicking the active nav tab) — pathname alone misses those, leaving
  // the click a silent no-op.
  const { key, hash } = useLocation()
  const navigationType = useNavigationType()
  useEffect(() => {
    // POP = back/forward: let the browser restore the previous position
    // instead of clobbering it with the top of the page.
    if (navigationType === 'POP') return

    /* A hash is a request for one place on the page, and router navigations
       don't honour it on their own — the command palette deep-links into
       /library#ui-tooltip and friends, so without this every one of those
       results would change the URL and then dump the reader at the masthead.
       getElementById rather than querySelector: an id is not necessarily a
       valid CSS selector, and a thrown error here would take the scroll
       reset down with it. The rAF retry covers a target that mounts a frame
       late, which happens when the hash arrives from another route. */
    if (hash.length > 1) {
      const id = decodeURIComponent(hash.slice(1))
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
  }, [key, hash, navigationType])
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

  // Lives in the shell, not on a page: the shortcut has to work from anywhere,
  // and the palette is how the four n3wth sites are searchable as one.
  const { open: searchOpen, setOpen: setSearchOpen, toggle: toggleSearch } = useCommandPalette()
  const closeSearch = useCallback(() => setSearchOpen(false), [setSearchOpen])

  return (
    <Theme theme={n3wthTheme} mode="dark">
      <LinkProvider component={RouterLink}>
        <Nav onOpenSearch={toggleSearch} />
        <CommandPalette open={searchOpen} onClose={closeSearch} />
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
