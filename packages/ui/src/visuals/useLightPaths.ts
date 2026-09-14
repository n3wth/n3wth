import { useEffect, useMemo, useRef } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'

/** Shared animation lifecycle; each drawing owns its geometry. */
export function useLightPaths(buildPath: (direction: -1 | 1, time: number) => string) {
  const upperRefs = useRef<(SVGPathElement | null)[]>([])
  const lowerRefs = useRef<(SVGPathElement | null)[]>([])
  const reducedMotion = useReducedMotion()
  const initial = useMemo(() => ({ up: buildPath(-1, 0), lo: buildPath(1, 0) }), [buildPath])

  useEffect(() => {
    if (reducedMotion) return
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const time = (now - start) / 1000
      const upper = buildPath(-1, time)
      const lower = buildPath(1, time)
      for (const path of upperRefs.current) path?.setAttribute('d', upper)
      for (const path of lowerRefs.current) path?.setAttribute('d', lower)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [buildPath, reducedMotion])

  return { upperRefs, lowerRefs, initial }
}
