import { useState, useEffect, useCallback, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { HamburgerIcon, MobileDrawer } from '@n3wth/ui'
import { navigation, siteConfig } from '../data/content'

gsap.registerPlugin(ScrollTrigger)

export function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isLightBg, setIsLightBg] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  const toggleMenu = useCallback(() => setIsMenuOpen((prev) => !prev), [])
  const closeMenu = useCallback(() => setIsMenuOpen(false), [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Track when we're in the Creative section with light backgrounds
  useGSAP(() => {
    const creativeSection = document.getElementById('creative')
    if (!creativeSection) return

    const lightPanels = creativeSection.querySelectorAll('[data-light-bg="true"]')

    lightPanels.forEach((panel) => {
      ScrollTrigger.create({
        trigger: panel,
        start: 'top top',
        end: 'bottom top',
        onEnter: () => setIsLightBg(true),
        onLeave: () => setIsLightBg(false),
        onEnterBack: () => setIsLightBg(true),
        onLeaveBack: () => setIsLightBg(false),
      })
    })
  }, [])

  const textColor = isLightBg ? 'rgba(0, 0, 0, 0.8)' : 'var(--color-grey-200)'
  const nameColor = isLightBg ? 'rgba(0, 0, 0, 0.9)' : 'white'

  return (
    <>
      <nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-3 md:py-4 flex items-center justify-between transition-all duration-500"
      >
        <a
          href="/"
          className={`text-base md:text-lg font-display font-semibold tracking-tight hover:opacity-70 transition-all duration-500 focus-ring rounded ${
            scrolled ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ color: nameColor }}
        >
          {siteConfig.name}
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-sm link-hover transition-colors duration-500"
              style={{ color: textColor }}
            >
              {item.name}
            </a>
          ))}
        </div>

        <button
          onClick={toggleMenu}
          className="md:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-all duration-500 hover:opacity-70"
          style={{ color: textColor }}
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
