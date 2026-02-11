import { useEffect } from 'react'
import { ScrollTrigger } from '../lib/gsap'

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Refresh ScrollTrigger after all content has loaded
    const timeout = setTimeout(() => ScrollTrigger.refresh(), 100)
    return () => clearTimeout(timeout)
  }, [])

  return <>{children}</>
}
