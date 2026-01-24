import { useEffect, useRef } from 'react'
import { createMagneticEffect } from '../lib/animations'

export function useMagneticButton<T extends HTMLElement>(strength: number = 0.3) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const magnetic = createMagneticEffect(element, strength)

    return () => {
      magnetic.destroy()
    }
  }, [strength])

  return ref
}
