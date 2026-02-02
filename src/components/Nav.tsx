import { useState, useCallback } from 'react'
import { HamburgerIcon, MobileDrawer } from '@n3wth/ui'
import { navigation, siteConfig } from '../data/content'

export function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = useCallback(() => setIsMenuOpen((prev) => !prev), [])
  const closeMenu = useCallback(() => setIsMenuOpen(false), [])

  return (
    <>
      <nav className="px-6 md:px-12 py-4 md:py-6 flex items-center justify-between">
        <a
          href="/"
          className="text-base md:text-lg font-display font-semibold tracking-tight hover:opacity-70 transition-opacity focus-ring rounded text-white"
        >
          n3wth
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
        </div>

        <button
          onClick={toggleMenu}
          className="md:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:opacity-70 transition-opacity"
          style={{ color: 'var(--color-grey-200)' }}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
        >
          <HamburgerIcon isOpen={isMenuOpen} />
        </button>
      </nav>

      <MobileDrawer
        isOpen={isMenuOpen}
        onClose={closeMenu}
        position="right"
        width="280px"
        zIndex={55}
        ariaLabel="Navigation menu"
        className="md:hidden"
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
      </MobileDrawer>
    </>
  )
}
