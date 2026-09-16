import type { ReactNode } from 'react'

const SHELF_LABEL: Record<string, string> = {
  kit: 'Essay kit',
  ui: 'UI',
  garden: 'Garden',
  skills: 'Skills',
}

/**
 * One shelf of /library. Every shelf is the same three moves: a hairline
 * rail, a masthead line with a plain shelf label plus whatever count is
 * real for it, then the heading and a short intro before the content.
 * Section ids stay for command-palette deep links; the visible label is
 * plain text, not a hashtag.
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
  label,
}: {
  id: string
  meta?: ReactNode
  title: string
  intro: ReactNode
  children: ReactNode
  label?: string
}) {
  const shelfLabel = label ?? SHELF_LABEL[id] ?? id
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
              {shelfLabel}
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
