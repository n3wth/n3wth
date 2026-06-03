import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { CursorMark } from './marks'
import { navigation } from '../data/content'

export function Nav() {
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let lastY = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setHidden(y > 120 && y > lastY)
      lastY = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
    <header
      className="fixed inset-x-0 top-0 z-50 transition-transform duration-500"
      style={{
        transform: hidden && !open ? 'translateY(-100%)' : 'translateY(0)',
        background: 'color-mix(in srgb, var(--bg) 78%, transparent)',
        backdropFilter: 'blur(14px) saturate(140%)',
        WebkitBackdropFilter: 'blur(14px) saturate(140%)',
        borderBottom: '1px solid var(--rail)',
      }}
    >
      <div className="frame !border-t-0" style={{ borderBottom: 'none' }}>
        <nav
          aria-label="Primary"
          className="flex items-center justify-between px-6 md:px-10 h-16 md:h-[4.5rem]"
        >
          <a href="#top" className="brand" aria-label="n3wth — home">
            <span className="brand-mark shrink-0" aria-hidden="true">
              <CursorMark size={20} />
            </span>
            <span>n3wth</span>
          </a>

          <ul className="hidden md:flex items-center gap-7">
            {navigation.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-[0.8125rem] font-medium tracking-[0.01em] transition-colors"
                  style={{ color: 'var(--ink-dim)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ink)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink-dim)')}
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="md:hidden flex items-center justify-center p-2 -mr-2"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <X size={20} strokeWidth={1.5} style={{ color: 'var(--ink)' }} aria-hidden="true" />
            ) : (
              <Menu size={20} strokeWidth={1.5} style={{ color: 'var(--ink)' }} aria-hidden="true" />
            )}
          </button>
        </nav>
      </div>
    </header>

    {open && (
      <div
        className="md:hidden fixed inset-0 z-40 pt-14"
        style={{ background: 'var(--bg)' }}
      >
        <ul className="flex flex-col px-6 pt-4">
          {navigation.map((item) => (
            <li key={item.href} style={{ borderTop: '1px solid var(--rail)' }}>
              <a
                href={item.href}
                onClick={() => setOpen(false)}
                className="block py-5 text-sm font-medium tracking-[0.01em]"
                style={{ color: 'var(--ink)' }}
              >
                <span className="index mr-3">
                  {String(navigation.indexOf(item) + 1).padStart(2, '0')}
                </span>
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    )}
    </>
  )
}
