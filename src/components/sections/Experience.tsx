import { SectionHeader } from '../Frame'
import { experiences } from '../../data/content'

/* Ship log: a decade of work as a dense, confident index — one line per
   chapter, no résumé prose. Density here earns the breathing room the
   art chapter gets below. */
export function Experience() {
  return (
    <section id="work" aria-label="Experience">
      <SectionHeader
        as="h1"
        title="A decade of AI, in production"
        lede="Ten years taking AI from research demos to production at Google, Covariant, Meta, and Microsoft."
      />

      <div className="section-pad pad-tight !pt-0">
        <ol className="space-y-2">
          {experiences.map((exp) => (
            <li
              key={exp.id}
              data-reveal
              className="cell grid gap-x-8 gap-y-2 px-5 py-6 md:px-7 md:py-7 md:grid-cols-[6.5rem_13rem_minmax(0,1fr)_auto] md:items-baseline"
            >
              <span className="meta" style={{ color: 'var(--ink-dim)' }}>
                {exp.period}
              </span>

              <div>
                <h3
                  className="display text-xl"
                  style={{ letterSpacing: '-0.02em', lineHeight: 1.1 }}
                >
                  {exp.company}
                </h3>
                <p className="meta mt-1">{exp.role}</p>
              </div>

              <p
                className="text-sm leading-relaxed max-w-xl"
                style={{ color: 'var(--ink-dim)' }}
              >
                {exp.summary}
              </p>

              {exp.metric && (
                <p className="meta md:text-right md:justify-self-end whitespace-nowrap">
                  <span className="font-semibold" style={{ color: 'var(--ink)' }}>
                    {exp.metric.value}
                  </span>{' '}
                  {exp.metric.label}
                </p>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
