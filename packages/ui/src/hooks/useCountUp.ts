import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

export interface UseCountUpOptions {
  /** Animation duration in seconds */
  duration?: number
  /** Delay before animation starts */
  delay?: number
  /** Trigger animation on scroll into view */
  onScroll?: boolean
  /** Suffix to append to value (e.g., '%', '+') */
  suffix?: string
  /** Prefix to prepend to value (e.g., '$') */
  prefix?: string
  /** Callback when animation completes */
  onComplete?: () => void
}

export interface UseCountUpReturn {
  ref: React.RefObject<HTMLElement | null>
  value: number
  displayValue: string
}

/**
 * Hook for animated number counting
 * Creates smooth counter animations with scroll trigger support
 */
export function useCountUp(
  target: number,
  options: UseCountUpOptions = {}
): UseCountUpReturn {
  const {
    duration = 1.5,
    delay = 0,
    onScroll = true,
    suffix = '',
    prefix = '',
    onComplete,
  } = options

  const [value, setValue] = useState(0)
  const ref = useRef<HTMLElement>(null)
  const currentValue = useRef(0)
  const currentTarget = useRef(target)
  const hasStarted = useRef(false)
  const hasCompleted = useRef(false)
  const onCompleteRef = useRef(onComplete)

  useIsomorphicLayoutEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    const element = ref.current
    if (!element) return
    if (!Object.is(currentTarget.current, target)) {
      currentTarget.current = target
      hasCompleted.current = false
    }
    if (hasCompleted.current) return

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (prefersReducedMotion) {
      currentValue.current = target
      hasStarted.current = true
      hasCompleted.current = true
      setValue(target)
      onCompleteRef.current?.()
      return
    }

    const counter = { value: currentValue.current }
    let tween: ReturnType<typeof gsap.to> | undefined
    let trigger: ReturnType<typeof ScrollTrigger.create> | undefined
    let startedHere = false

    const animate = () => {
      if (startedHere || hasCompleted.current) return
      startedHere = true
      hasStarted.current = true

      tween = gsap.to(counter, {
        value: target,
        duration,
        delay,
        ease: 'power2.out',
        onUpdate: () => {
          currentValue.current = counter.value
          setValue(Math.round(counter.value))
        },
        onComplete: () => {
          hasCompleted.current = true
          onCompleteRef.current?.()
        },
      })
    }

    if (onScroll && !hasStarted.current) {
      trigger = ScrollTrigger.create({
        trigger: element,
        start: 'top 80%',
        onEnter: animate,
        once: true,
      })
    } else {
      animate()
    }

    return () => {
      trigger?.kill()
      tween?.kill()
    }
  }, [target, duration, delay, onScroll])

  const displayValue = `${prefix}${value.toLocaleString()}${suffix}`

  return { ref, value, displayValue }
}
