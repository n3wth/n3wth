import type { ReactNode } from 'react'

/**
 * One shelf of /library. Every shelf is the same three moves: a hairline
 * rail, a masthead line carrying the shelf's own anchor plus whatever
 * count is real for it, then the heading and a short intro before the
 * content itself.
 *
 * The anchor is rendered as a visible `#kit` / `#garden` link on purpose.
 * The command palette deep-links into these sections, so the fragment is
 * functional information, not decoration — showing it means someone can
 * copy the exact link they landed on. It's also the one place Geist Mono
 * earns its keep in the chrome: a URL fragment is literal machine output.
 *
 * No boxes. Shelves are separated by rails and vertical space, which is
 * the same grammar the Thinking pieces use.
 */
export function Shelf({
  id,
  meta,
  title,
  intro,
  children,
}: {
  id: string
  meta?: ReactNode
  title: string
  intro: ReactNode
  children: ReactNode
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="section-pad !py-0 mt-16 scroll-mt-24 md:mt-24"
    >
      <div className="border-t pt-8 md:pt-11" style={{ borderColor: 'var(--rail)' }}>
        <div data-reveal>
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <a href={`#${id}`} className="mono link-underline">
              #{id}
            </a>
            {meta && <p className="mono">{meta}</p>}
          </div>

          <h2
            id={`${id}-title`}
            className="display mt-5 text-[clamp(1.55rem,2.9vw,2.35rem)]"
            style={{ letterSpacing: '-0.03em', lineHeight: 1.02 }}
          >
            {title}
          </h2>

          <p
            className="mt-5 max-w-[64ch] text-base leading-relaxed md:text-lg"
            style={{ color: 'var(--ink-dim)' }}
          >
            {intro}
          </p>
        </div>

        {children}
      </div>
    </section>
  )
}

/**
 * A code specimen: a plain <pre> with a hairline border and the surface
 * fill. Deliberately not a fake terminal — no window chrome, no traffic
 * lights, no language badge. Long signatures scroll inside the block so
 * the page itself never scrolls sideways on a phone.
 */
export function CodeBlock({ code, className }: { code: string; className?: string }) {
  return (
    <pre
      className={`overflow-x-auto rounded-xl border px-4 py-3.5 font-mono text-xs leading-relaxed ${className ?? ''}`}
      style={{
        borderColor: 'var(--rail)',
        background: 'var(--bg-soft)',
        color: 'var(--ink-dim)',
      }}
    >
      <code>{code}</code>
    </pre>
  )
}
