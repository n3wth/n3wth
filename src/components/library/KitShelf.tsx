import { Fragment, Suspense, lazy } from 'react'
import type { ComponentType } from 'react'
import { RouterLink } from '../RouterLink'
import { Shelf, CodeBlock } from './Shelf'
import { kitPrimitives } from '../../data/library'
import type { KitPrimitive } from '../../data/library'
import { registeredPieces } from '../thinking/registry'

/**
 * The essay kit shelf: the only place these eight components are written
 * down, since the Thinking pieces just import them.
 *
 * Each row borrows the kit's own layout grammar — Beat's 7fr/3fr split,
 * prose in the wide column and the file path plus the "seen in" link in
 * the margin — so the page documenting the kit is laid out the way the
 * kit lays out everything else.
 *
 * Only four primitives get a live specimen, and each is lazy so /library's
 * first chunk stays small. The two react-three-fiber demos are deliberately
 * absent: importing either would pull three.js and a .glb into a page that
 * is otherwise text, and /thinking/night-field already runs both.
 */

const DEMOS: Record<NonNullable<KitPrimitive['demo']>, ComponentType> = {
  beat: lazy(() => import('./DemoBeat')),
  toggle: lazy(() => import('./DemoRails')),
  flow: lazy(() => import('./DemoFlow')),
  field: lazy(() => import('./DemoField')),
}

/** Real title for a "seen in" link, straight off the piece registry so it
 *  can't drift from what's actually published. */
function pieceTitle(slug: string) {
  return registeredPieces.find((piece) => piece.meta.id === slug)?.meta.title ?? slug
}

/**
 * A repo path with a break opportunity after every slash. The longest of
 * these is 52 characters and the margin column is about 345px at the
 * frame's full width, so some of them have to wrap; letting them wrap
 * after `kit/` instead of mid-identifier is the difference between a
 * second line and a stray `x`. overflowWrap stays on as the backstop so
 * an unbreakable segment can never push the page sideways.
 */
function SourcePath({ path }: { path: string }) {
  const segments = path.split('/')
  return (
    <p className="mono" style={{ overflowWrap: 'anywhere' }}>
      {segments.map((segment, i) => (
        <Fragment key={segment + i}>
          {segment}
          {i < segments.length - 1 && (
            <>
              /<wbr />
            </>
          )}
        </Fragment>
      ))}
    </p>
  )
}

function KitRow({ primitive }: { primitive: KitPrimitive }) {
  const Demo = primitive.demo ? DEMOS[primitive.demo] : null

  return (
    <li
      id={`kit-${primitive.id}`}
      className="scroll-mt-24 border-t pt-8 pb-2 md:pt-11"
      style={{ borderColor: 'var(--rail)' }}
    >
      <div data-reveal>
        <div className="md:grid md:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] md:gap-12">
          <div>
            <h3
              className="display text-xl md:text-2xl"
              style={{ letterSpacing: '-0.025em', lineHeight: 1.1 }}
            >
              {primitive.name}
            </h3>
            <p
              className="mt-3 max-w-[62ch] text-base leading-relaxed"
              style={{ color: 'var(--ink-dim)' }}
            >
              {primitive.blurb}
            </p>
          </div>

          <div className="mt-5 md:mt-1.5">
            <SourcePath path={primitive.source} />
            {primitive.usedIn && (
              <p className="mt-4 text-sm leading-snug" style={{ color: 'var(--ink-dim)' }}>
                Seen in{' '}
                <RouterLink href={`/thinking/${primitive.usedIn}`} className="link-underline">
                  {pieceTitle(primitive.usedIn)}
                </RouterLink>
              </p>
            )}
          </div>
        </div>

        <CodeBlock code={primitive.signature} className="mt-7 max-w-[52ch]" />
      </div>

      {/* data-reveal on the specimen wrapper is load-bearing, not decoration:
          the kit's line-draw, node-in and dot-in keyframes are all scoped to
          `[data-reveal].is-in .kit-…` in index.css, so a FlowDiagram or an
          AssembleField mounted without a revealed ancestor renders its paths
          at full dash offset and its dots at opacity 0 — i.e. blank. */}
      {Demo && (
        <div data-reveal className="mt-10">
          <p className="index">Live</p>
          <div className="mt-5">
            <Suspense fallback={<div className="h-36" aria-hidden />}>
              <Demo />
            </Suspense>
          </div>
        </div>
      )}
    </li>
  )
}

export function KitShelf() {
  return (
    <Shelf
      id="kit"
      meta={`${kitPrimitives.length} primitives`}
      title="The essay kit"
      intro={
        <>
          Every Thinking piece on this site is laid out by the same eight components. They never had
          a page of their own; the essays just imported them, so this is the first place the whole
          set is written down. Each row carries the props and the file it lives in. Four of them run
          live below, and the two that load a 3D scene stay over on{' '}
          <RouterLink href="/thinking/night-field" className="link-underline">
            What the night field broke
          </RouterLink>
          , where they already have one.
        </>
      }
    >
      <ul className="mt-11 space-y-14 md:mt-14">
        {kitPrimitives.map((primitive) => (
          <KitRow key={primitive.id} primitive={primitive} />
        ))}
      </ul>
    </Shelf>
  )
}
