import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'

/**
 * Full-bleed hero backdrop: the three "Art in the desert" installation
 * photos slowly crossfading with a subtle Ken Burns scale drift. Purely
 * decorative (aria-hidden, pointer-events: none) — legibility is handled
 * by a separate gradient overlay layered on top in Hero.tsx.
 *
 * Respects prefers-reduced-motion: renders only the first frame, static,
 * no crossfade or scale drift.
 */
const HOLD = 6 // seconds each image holds before crossfading
const FADE = 1.2 // seconds for the crossfade itself

const images = [
  { src: '/images/installations/circle-of-light.webp' },
  { src: '/images/installations/pink-triangle.webp' },
  { src: '/images/installations/them.webp' },
]

export function HeroBackdrop() {
  const layerRefs = useRef<(HTMLImageElement | null)[]>([])

  useEffect(() => {
    const layers = layerRefs.current.filter((el): el is HTMLImageElement => el !== null)
    if (layers.length !== images.length) return

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    // Static baseline: first image visible, rest hidden, no scale drift.
    layers.forEach((layer, i) => gsap.set(layer, { opacity: i === 0 ? 1 : 0, scale: 1 }))

    if (prefersReducedMotion) return

    // Built entirely from plain .to() tweens (never .set()/.fromTo() *inside*
    // the timeline): those default immediateRender to true and apply their
    // "from" values synchronously at creation time regardless of where they
    // land on the timeline, which would stomp the baseline set above.
    const tl = gsap.timeline({ repeat: -1, defaults: { ease: 'none' } })
    const cycle = HOLD + FADE

    layers.forEach((current, i) => {
      const next = layers[(i + 1) % layers.length]
      const start = i * cycle

      // Ken Burns: scale drift while this layer holds fully visible.
      tl.to(current, { scale: 1.06, duration: HOLD }, start)

      // Crossfade at the end of the hold: current fades out while the next
      // layer (reset to a clean scale first) fades in underneath it.
      tl.to(next, { scale: 1, duration: 0 }, start + HOLD)
      tl.to(current, { opacity: 0, duration: FADE }, start + HOLD)
      tl.to(next, { opacity: 1, duration: FADE }, start + HOLD)
    })

    return () => {
      tl.kill()
    }
  }, [])

  return (
    <div className="hero-backdrop" aria-hidden="true">
      {images.map((image, i) => (
        <img
          key={image.src}
          ref={(el) => {
            layerRefs.current[i] = el
          }}
          src={image.src}
          alt=""
          loading={i === 0 ? 'eager' : 'lazy'}
          decoding="async"
          className="hero-backdrop-layer"
        />
      ))}
      <div className="hero-backdrop-scrim" />
      <div className="hero-backdrop-fade" />
    </div>
  )
}
