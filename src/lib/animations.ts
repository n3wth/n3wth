import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger)

// Centralized animation configuration
export const ANIMATION_CONFIG = {
  duration: {
    fast: 0.3,
    normal: 0.5,
    slow: 0.8,
    slower: 1.2,
  },
  ease: {
    default: 'power2.out',
    smooth: 'power3.out',
    bounce: 'back.out(1.4)',
    inOut: 'power2.inOut',
    elastic: 'elastic.out(1, 0.5)',
  },
  stagger: {
    tight: 0.05,
    normal: 0.1,
    loose: 0.15,
    wide: 0.2,
  },
  scroll: {
    start: 'top 85%',
    startLate: 'top 90%',
    startEarly: 'top 75%',
  },
} as const

// Check for reduced motion preference
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Create scroll-triggered reveal animation
export const createScrollReveal = (
  element: Element | null,
  options: {
    y?: number
    x?: number
    opacity?: number
    scale?: number
    duration?: number
    ease?: string
    delay?: number
    start?: string
  } = {}
) => {
  if (!element || prefersReducedMotion()) return null

  const {
    y = 40,
    x = 0,
    opacity = 0,
    scale = 1,
    duration = ANIMATION_CONFIG.duration.slow,
    ease = ANIMATION_CONFIG.ease.smooth,
    delay = 0,
    start = ANIMATION_CONFIG.scroll.start,
  } = options

  gsap.set(element, { y, x, opacity, scale })

  return gsap.to(element, {
    y: 0,
    x: 0,
    opacity: 1,
    scale: 1,
    duration,
    ease,
    delay,
    scrollTrigger: {
      trigger: element,
      start,
      once: true,
    },
  })
}

// Create staggered reveal for multiple elements
export const createStaggeredReveal = (
  container: Element | null,
  selector: string,
  options: {
    y?: number
    stagger?: number
    duration?: number
    ease?: string
    start?: string
  } = {}
) => {
  if (!container || prefersReducedMotion()) return null

  const elements = container.querySelectorAll(selector)
  if (elements.length === 0) return null

  const {
    y = 30,
    stagger = ANIMATION_CONFIG.stagger.normal,
    duration = ANIMATION_CONFIG.duration.normal,
    ease = ANIMATION_CONFIG.ease.smooth,
    start = ANIMATION_CONFIG.scroll.start,
  } = options

  gsap.set(elements, { y, opacity: 0 })

  return gsap.to(elements, {
    y: 0,
    opacity: 1,
    duration,
    ease,
    stagger,
    scrollTrigger: {
      trigger: container,
      start,
      once: true,
    },
  })
}

// Create entrance timeline for complex animations
export const createEntranceTimeline = (options: { delay?: number } = {}) => {
  if (prefersReducedMotion()) return null

  const { delay = 0.2 } = options

  return gsap.timeline({ delay })
}

// Magnetic button effect
export const createMagneticEffect = (
  element: Element | null,
  strength: number = 0.3
) => {
  if (!element || prefersReducedMotion()) return { destroy: () => {} }

  const handleMouseMove = (e: MouseEvent) => {
    const rect = (element as HTMLElement).getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    gsap.to(element, {
      x: x * strength,
      y: y * strength,
      duration: ANIMATION_CONFIG.duration.fast,
      ease: ANIMATION_CONFIG.ease.default,
    })
  }

  const handleMouseLeave = () => {
    gsap.to(element, {
      x: 0,
      y: 0,
      duration: ANIMATION_CONFIG.duration.normal,
      ease: ANIMATION_CONFIG.ease.elastic,
    })
  }

  element.addEventListener('mousemove', handleMouseMove as EventListener)
  element.addEventListener('mouseleave', handleMouseLeave)

  return {
    destroy: () => {
      element.removeEventListener('mousemove', handleMouseMove as EventListener)
      element.removeEventListener('mouseleave', handleMouseLeave)
    },
  }
}

// Smooth scroll to element
export const scrollToElement = (elementId: string) => {
  const element = document.getElementById(elementId)
  if (!element) return

  const offsetTop = element.offsetTop - 100

  gsap.to(window, {
    scrollTo: { y: offsetTop, autoKill: false },
    duration: ANIMATION_CONFIG.duration.slow,
    ease: ANIMATION_CONFIG.ease.inOut,
  })
}

export { gsap, ScrollTrigger }
