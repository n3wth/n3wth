import { useEffect, useRef } from 'react'
import { createScrollReveal, createStaggeredReveal } from '../lib/animations'

interface ScrollRevealOptions {
  y?: number
  x?: number
  opacity?: number
  scale?: number
  duration?: number
  ease?: string
  delay?: number
  start?: string
}

export function useScrollReveal<T extends HTMLElement>(
  options: ScrollRevealOptions = {}
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const animation = createScrollReveal(element, options)

    return () => {
      animation?.kill()
    }
  }, [])

  return ref
}

interface StaggeredRevealOptions {
  selector: string
  y?: number
  stagger?: number
  duration?: number
  ease?: string
  start?: string
}

export function useStaggeredReveal<T extends HTMLElement>(
  options: StaggeredRevealOptions
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return

    const animation = createStaggeredReveal(container, options.selector, options)

    return () => {
      animation?.kill()
    }
  }, [])

  return ref
}
