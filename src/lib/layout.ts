/**
 * Publishes the width html reserves for the scrollbar track as `--sbw`.
 *
 * `html { scrollbar-gutter: stable }` permanently reserves that track, so the
 * layout width is narrower than the visual viewport — but `100vw` still reports
 * the visual viewport. Every viewport-width breakout on this site (`.bleed`,
 * `.hero-backdrop`) is `width: 100vw; left: 50%; translateX(-50%)`, so the
 * overshoot got split in half and shifted the band, and everything inside it,
 * to the left. On /art and the 404 that put the page title 4px left of where
 * the same title sits on every other page.
 *
 * Measured rather than hardcoded: the reservation is this site's 8px webkit
 * scrollbar on Blink and WebKit, but the platform width on engines that ignore
 * `::-webkit-scrollbar`. body carries no margin, so the difference between the
 * visual viewport and body's content box is exactly the reserved track.
 */
function measure(): number {
  const reserved = window.innerWidth - document.body.clientWidth
  // Guard the pathological cases: a negative result (zoom rounding) or an
  // absurd one (a mid-layout read) would move bands further out of true than
  // leaving the correction off entirely.
  return reserved > 0 && reserved < 40 ? reserved : 0
}

export function syncScrollbarWidth(): () => void {
  const apply = () => {
    document.documentElement.style.setProperty('--sbw', `${measure()}px`)
  }
  apply()

  // Zoom and orientation changes both alter the reserved width; a resize
  // listener covers each, and is cheap enough not to need throttling since
  // it only writes one custom property.
  window.addEventListener('resize', apply)
  return () => window.removeEventListener('resize', apply)
}
