import type { ReactNode } from 'react'

/** Library sections retain heading anchors for direct links and search. */
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
          <h2
            id={`${id}-title`}
            className="display text-[clamp(1.55rem,2.9vw,2.35rem)]"
            style={{ letterSpacing: '-0.03em', lineHeight: 1.02 }}
          >
            <a href={`#${id}`} className="link-underline">{title}</a>
          </h2>
          {meta && <p className="mt-3 text-sm" style={{ color: 'var(--ink-dim)' }}>{meta}</p>}

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
