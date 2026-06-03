import { useEffect, useState } from 'react'
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
        background: 'color-mix(in srgb, var(--canvas) 86%, transparent)',
        backdropFilter: 'saturate(140%)',
        borderBottom: '1px solid var(--rail)',
      }}
    >
      <div className="frame !border-t-0" style={{ borderBottom: 'none' }}>
        <nav
          aria-label="Primary"
          className="flex items-center justify-between px-6 md:px-10 h-14 md:h-16"
        >
          <a
            href="#top"
            className="font-mono text-sm font-medium tracking-[0.04em]"
            style={{ color: 'var(--ink)' }}
          >
            n3wth<span style={{ color: 'var(--signal)' }}>.</span>
          </a>

          <ul className="hidden md:flex items-center gap-7">
            {navigation.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="font-mono text-xs uppercase tracking-[0.14em] transition-colors"
                  style={{ color: 'var(--dim)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ink)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--dim)')}
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="md:hidden flex flex-col gap-[5px] p-2 -mr-2"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span
              className="block w-5 h-px transition-transform"
              style={{
                background: 'var(--ink)',
                transform: open ? 'translateY(3px) rotate(45deg)' : 'none',
              }}
            />
            <span
              className="block w-5 h-px transition-transform"
              style={{
                background: 'var(--ink)',
                transform: open ? 'translateY(-3px) rotate(-45deg)' : 'none',
              }}
            />
          </button>
        </nav>
      </div>
    </header>

    {open && (
      <div
        className="md:hidden fixed inset-0 z-40 pt-14"
        style={{ background: '#08090b' }}
      >
        <ul className="flex flex-col px-6 pt-4">
          {navigation.map((item) => (
            <li key={item.href} style={{ borderTop: '1px solid var(--rail)' }}>
              <a
                href={item.href}
                onClick={() => setOpen(false)}
                className="block py-5 font-mono text-sm uppercase tracking-[0.14em]"
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
