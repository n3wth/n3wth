/**
 * The label for the palette shortcut: ⌘ on Apple hardware, Ctrl everywhere
 * else. Three surfaces print it — the nav trigger, the palette's own chip,
 * and the garden shelf's prose — and a hint naming a key the reader doesn't
 * have teaches the wrong shortcut, so they all read it from here.
 *
 * navigator.platform is deprecated but still the most reliable signal for
 * Apple hardware; userAgent is the fallback for the browsers that dropped it.
 */
export const SHORTCUT_HINT: string =
  typeof navigator !== 'undefined' &&
  /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent)
    ? '⌘K'
    : 'Ctrl K'
