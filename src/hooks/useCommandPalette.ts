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

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  return { open, setOpen, toggle }
}
