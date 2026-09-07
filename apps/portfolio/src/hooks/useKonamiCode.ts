import { useEffect, useRef } from 'react'

const KONAMI = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowLeft', 'ArrowRight', 'ArrowRight',
  'KeyB', 'KeyA',
]

export function useKonamiCode(onActivate: () => void) {
  const indexRef = useRef(0)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === KONAMI[indexRef.current]) {
        indexRef.current++
        if (indexRef.current === KONAMI.length) {
          indexRef.current = 0
          onActivate()
        }
      } else {
        indexRef.current = 0
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onActivate])
}
