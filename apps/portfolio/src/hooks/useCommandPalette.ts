import { useCallback, useEffect, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'

/**
 * Open/close state for site search. Kept out of CommandPalette.tsx so the
 * layout shell can own it — the panel mounts from here, whether or not it
 * is on screen yet.
 */

export interface CommandPaletteControls {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  toggle: () => void
}

export function useCommandPalette(): CommandPaletteControls {
  const [open, setOpen] = useState(false)
  const toggle = useCallback(() => setOpen((wasOpen) => !wasOpen), [])

  /* ⌘K/Ctrl+K toggles from anywhere; '/' opens when focus isn't in a field
     (WCAG 2.1.4: single-key shortcuts must not fire while typing); Escape
     closes. The '/' guard mirrors useKeyboardNav. */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((wasOpen) => !wasOpen)
        return
      }
      if (event.key === 'Escape') {
        setOpen(false)
        return
      }
      if (event.key !== '/' || event.altKey || event.shiftKey) return
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return
      event.preventDefault()
      setOpen(true)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return { open, setOpen, toggle }
}
