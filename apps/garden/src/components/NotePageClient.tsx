'use client'

import { useEffect, useRef, useState } from 'react'
import { useTransitionRouter } from 'next-view-transitions'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Lightbox, type LightboxMedia } from '@astryxdesign/core/Lightbox'
import { getVisited, recordVisit } from '@/lib/visited'

gsap.registerPlugin(ScrollTrigger)

export function NotePageClient({ children, slug }: { children: React.ReactNode; slug?: string }) {
  const container = useRef<HTMLDivElement>(null)
  const router = useTransitionRouter()

  // Add this note to the reader's explored trail (shown in the 3D garden)
  useEffect(() => {
    if (slug !== undefined) recordVisit(slug)
  }, [slug])

  // Wikilinks are server-rendered plain anchors; route them client-side so
  // an in-note hop gets the same view transition as every other navigation
  // (no full-document reload, nav island holds still).
  useEffect(() => {
    const root = container.current
    if (!root) return
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const anchor = (e.target as HTMLElement).closest?.('a.internal-link')
      if (!(anchor instanceof HTMLAnchorElement) || !root.contains(anchor)) return
      const href = anchor.getAttribute('href')
      if (!href?.startsWith('/')) return
      e.preventDefault()
      router.push(href)
    }
    root.addEventListener('click', onClick)
    return () => root.removeEventListener('click', onClick)
  }, [router])

  // Worn paths: wikilinks the reader has already opened render dimmed —
  // the same "been here" cue the notes index uses for visited rows.
  useEffect(() => {
    const visited = getVisited()
    container.current
      ?.querySelectorAll<HTMLAnchorElement>('a.internal-link')
      .forEach((a) => {
        const target = a.getAttribute('href')?.replace(/^\//, '')
        if (target && target !== slug && target in visited) {
          a.classList.add('walked')
          a.title = 'You’ve read this note'
        }
      })
  }, [slug])
  const [media, setMedia] = useState<LightboxMedia[]>([])
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  // In-page anchor clicks glide; route-change scroll resets stay instant
  // (global scroll-behavior: smooth broke nav resets + history restore).
  useEffect(() => {
    const el = container.current
    if (!el) return
    const onClick = (e: MouseEvent) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]')
      if (!anchor) return
      const target = document.getElementById(decodeURIComponent(anchor.hash.slice(1)))
      if (!target) return
      e.preventDefault()
      history.pushState(null, '', anchor.hash)
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    el.addEventListener('click', onClick)
    return () => el.removeEventListener('click', onClick)
  }, [])

  // Note images open in an Astryx Lightbox (gallery across the note)
  useEffect(() => {
    const imgs = Array.from(
      container.current?.querySelectorAll<HTMLImageElement>('.prose img') ?? []
    )
    if (imgs.length === 0) return

    setMedia(imgs.map((img) => ({ src: img.src, alt: img.alt || 'Note image' })))
    const handlers = imgs.map((img, i) => {
      const open = () => {
        setLightboxIndex(i)
        setLightboxOpen(true)
      }
      img.style.cursor = 'zoom-in'
      img.addEventListener('click', open)
      return { img, open }
    })
    return () => handlers.forEach(({ img, open }) => img.removeEventListener('click', open))
  }, [])

  useGSAP(() => {
    // Reading progress tracks scroll position, not motion preference —
    // scrub follows the user's own scrolling, so it stays on.
    gsap.to('.reading-progress', {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
    })

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // The stage glow drifts up slower than the page scrolls — a quiet
    // depth cue that separates the light from the text.
    gsap.to('.stage-ambient', {
      yPercent: -22,
      ease: 'none',
      scrollTrigger: { start: 0, end: 'max', scrub: 0.4 },
    })

    /* Page entry is handled by the view transition (globals.css) — GSAP
       from-tweens here would leave the h1 half-invisible when the new-state
       snapshot is captured and break the note-title morph. */
    gsap.from('.note-backlinks', {
      y: 20,
      opacity: 0,
      duration: 0.5,
      scrollTrigger: {
        trigger: '.note-backlinks',
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
    })
  }, { scope: container })

  return (
    <div ref={container}>
      <div className="reading-progress" aria-hidden />
      {children}
      {media.length > 0 && (
        <Lightbox
          isOpen={lightboxOpen}
          onOpenChange={setLightboxOpen}
          media={media}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
        />
      )}
    </div>
  )
}
