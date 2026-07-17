import { useEffect, useRef } from 'react'

/* A single light travelling down the left frame rail with scroll progress —
   the page's narrative device made literal: it starts faint in the daylight
   chapters and burns brighter the deeper you scroll into the dark. Purely
   scroll-driven (no autonomous motion), desktop only. */
export function ScrollBeacon() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let raf = 0
    const update = () => {
      raf = 0
      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      const f = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      const travel = Math.max(0, window.innerHeight - 128)
      el.style.transform = `translateY(${64 + f * travel}px)`
      el.style.opacity = String(0.3 + f * 0.7)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return <div ref={ref} className="scroll-beacon" aria-hidden="true" />
}
