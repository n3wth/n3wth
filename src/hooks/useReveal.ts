import { useEffect } from 'react'

/**
 * Quiet scroll-in reveals for every [data-reveal] element, including ones
 * mounted later by lazy sections (a MutationObserver picks up new nodes).
 * Elements start hidden via CSS and get .is-in when they enter the viewport.
 * Reduced motion (or no IntersectionObserver) shows everything immediately.
 */
export function useReveal() {
  useEffect(() => {
    const showAll = () =>
      document
        .querySelectorAll<HTMLElement>('[data-reveal]')
        .forEach((el) => el.classList.add('is-in'))

    if (
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      showAll()
      // Still catch late-mounted lazy sections.
      const mo = new MutationObserver(showAll)
      mo.observe(document.body, { childList: true, subtree: true })
      return () => mo.disconnect()
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in')
            io.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
    )

    const observe = (root: ParentNode) =>
      root
        .querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)')
        .forEach((el) => io.observe(el))

    observe(document)

    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            if (node.hasAttribute('data-reveal')) io.observe(node)
            observe(node)
          }
        })
      }
    })
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [])
}
