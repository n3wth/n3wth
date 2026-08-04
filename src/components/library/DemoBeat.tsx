import { Beat } from '../thinking/kit/Beat'
import { MarginNote } from '../thinking/kit/MarginNote'

/**
 * Beat, running. Lazy-loaded by KitShelf so the four live specimens on
 * /library stay out of the page's first chunk.
 *
 * The margin note points at a real garden note (5 Whys), with the note's
 * own description verbatim from src/data/garden-index.json — a MarginNote
 * demo pointing at a made-up URL would be demonstrating the one thing the
 * component is documented as not being for.
 */
export default function DemoBeat() {
  return (
    <figure className="m-0">
      <Beat
        stage={{ n: '01', label: 'Layout' }}
        prose="Prose runs in the wide column and holds a 62-character measure no matter how much room the viewport gives it. The note sits in the narrow column beside the paragraph that earned it. On a phone there is no margin to sit in, so it drops underneath instead."
        margin={
          <MarginNote
            href="https://garden.n3wth.com/frameworks/5-whys"
            title="5 Whys"
            description="A framework for identifying root causes of problems through iterative questioning"
          />
        }
      />
      <figcaption className="mt-1 max-w-[62ch] text-sm leading-relaxed" style={{ color: 'var(--ink-dim)' }}>
        Watch the connector draw itself in, then narrow the window: past the medium breakpoint the
        note stops being a margin note and becomes a footnote.
      </figcaption>
    </figure>
  )
}
