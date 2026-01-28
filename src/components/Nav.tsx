import { useState, useEffect, useCallback } from 'react'
import { navigation, siteConfig } from '../data/content'

function HamburgerIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-transform duration-300"
    >
      {isOpen ? (
        <>
          <path d="M18 6L6 18" />
          <path d="M6 6l12 12" />
        </>
      ) : (
        <>
          <path d="M4 6h16" />
          <path d="M4 12h16" />
          <path d="M4 18h16" />
        </>
      )}
    </svg>
  )
}

export function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const toggleMenu = useCallback(() => setIsMenuOpen((prev) => !prev), [])
  const closeMenu = useCallback(() => setIsMenuOpen(false), [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  return (
    <>
      <nav
        className="glass-nav px-6 md:px-12 py-3 md:py-4 flex items-center justify-between transition-all duration-300"
      >
        <a
          href="/"
          className={`text-base md:text-lg font-display font-semibold tracking-tight text-white hover:opacity-70 transition-all duration-300 focus-ring rounded ${
            scrolled ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {siteConfig.name}
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-sm link-hover"
              style={{ color: 'var(--color-grey-200)' }}
            >
              {item.name}
            </a>
          ))}
          <a
            href={siteConfig.artSite}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm link-hover"
            style={{ color: 'var(--color-grey-200)' }}
          >
            Art
          </a>
        </div>

        <button
          onClick={toggleMenu}
          className="md:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-all duration-200 hover:opacity-70"
          style={{ color: 'var(--color-grey-200)' }}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
        >
          <HamburgerIcon isOpen={isMenuOpen} />
        </button>
      </nav>

      {/* Mobile overlay */}
      <div
        className={`md:hidden fixed inset-0 z-[55] transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={closeMenu}
        aria-hidden={!isMenuOpen}
      />

      {/* Mobile drawer */}
      <div
        className={`md:hidden fixed top-0 right-0 z-[56] h-full w-[280px] max-w-[80vw] transition-transform duration-300 ease-out ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          backgroundColor: 'var(--color-bg)',
          borderLeft: '1px solid var(--glass-border)',
        }}
        aria-hidden={!isMenuOpen}
      >
        <div className="flex flex-col h-full pt-20 px-6 pb-8">
          <div className="flex flex-col gap-2">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={closeMenu}
                className="mobile-nav-link text-lg py-4 px-4 rounded-xl min-h-[52px] flex items-center text-white"
              >
                {item.name}
              </a>
            ))}
            <a
              href={siteConfig.artSite}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
              className="mobile-nav-link text-lg py-4 px-4 rounded-xl min-h-[52px] flex items-center text-white"
            >
              Art
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-2 opacity-50"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>

          <div className="mt-auto pt-6 border-t" style={{ borderColor: 'var(--glass-border)' }}>
            <a
              href={`mailto:${siteConfig.email}`}
              className="block text-center text-sm py-3 px-4 rounded-full border border-[var(--glass-border)] text-white hover:bg-[var(--glass-bg)] transition-colors"
            >
              {siteConfig.email}
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
