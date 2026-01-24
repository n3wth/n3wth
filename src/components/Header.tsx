import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { cn } from '../lib/utils'
import { navigation, siteConfig } from '../data/content'
import { Button } from './ui/Button'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false)
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled ? 'py-3' : 'py-5'
      )}
    >
      <div className="container-wide">
        <nav
          className={cn(
            'flex items-center justify-between rounded-full px-6 py-3 transition-all duration-300',
            isScrolled ? 'glass' : 'bg-transparent'
          )}
        >
          {/* Logo */}
          <a
            href="#"
            className="text-lg font-semibold text-white hover:text-gold transition-colors"
          >
            {siteConfig.name}
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.href)}
                className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/10"
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button
              size="sm"
              onClick={() => handleNavClick('#contact')}
            >
              Get in Touch
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        {/* Mobile Menu */}
        <div
          className={cn(
            'md:hidden absolute left-4 right-4 top-full mt-2 glass rounded-2xl overflow-hidden transition-all duration-300',
            isMobileMenuOpen
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 -translate-y-4 pointer-events-none'
          )}
        >
          <div className="p-4 flex flex-col gap-2">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.href)}
                className="px-4 py-3 text-left text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                {item.name}
              </button>
            ))}
            <div className="pt-2 border-t border-white/10">
              <Button
                className="w-full"
                onClick={() => handleNavClick('#contact')}
              >
                Get in Touch
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
