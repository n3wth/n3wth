import { useCallback, useEffect, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'

/**
 * Open/close state and the global shortcut for the ⌘K palette. Kept out of
 * CommandPalette.tsx so the listener is installed once from the layout shell,
 * whether or not the panel itself has been rendered yet.
 */

/**
 * Typing "k" into a search field, a textarea, or a rich-text block should
 * type a "k". Only the modifier combination is claimed, and only when the
 * keystroke isn't already going somewhere that wants it.
 */
function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  return target.isContentEditable
}

export interface CommandPaletteControls {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  toggle: () => void
}

export function useCommandPalette(): CommandPaletteControls {
  const [open, setOpen] = useState(false)
  const toggle = useCallback(() => setOpen((wasOpen) => !wasOpen), [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        // Once the palette is up, its own input is a typing target, so the
        // guard would strand the shortcut and ⌘K could open but never close.
        if (!open && isTypingTarget(event.target)) return
        // Firefox maps ⌘K/Ctrl+K to the address bar's search field, Chrome
        // and Safari have their own claims on it; take it before they do.
        event.preventDefault()
        setOpen((wasOpen) => !wasOpen)
        return
      }
      if (event.key === 'Escape' && open) setOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  return { open, setOpen, toggle }
}
