import { useCallback } from 'react'
import { Nav } from './Nav'
import { CommandPalette } from './CommandPalette'
import { useCommandPalette } from '../hooks/useCommandPalette'
import { useKeyboardNav } from '../hooks/useKeyboardNav'
import { useKonamiCode } from '../hooks/useKonamiCode'
import { withTheme } from './withTheme'

function SiteHeader({ pathname }: { pathname: string }) {
  useKeyboardNav()
  const onKonami = useCallback(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    import('../lib/gsap').then(({ gsap }) => {
      gsap.fromTo(document.querySelectorAll('h1, h2, h3, .display'), { color: '#ffffff' }, { clearProps: 'color', duration: 0.8, ease: 'power2.out' })
    })
  }, [])
  useKonamiCode(onKonami)
  const { open, setOpen, toggle } = useCommandPalette()
  const close = useCallback(() => setOpen(false), [setOpen])
  return <><Nav pathname={pathname} onOpenSearch={toggle} searchOpen={open} /><CommandPalette open={open} onClose={close} /></>
}

export default withTheme(SiteHeader)
