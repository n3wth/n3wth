import { SectionHeader } from '../Frame'
import { experiences } from '../../data/content'

/* Ship log: a decade of work as a dense, confident index — one line per
   chapter, no résumé prose. Density here earns the breathing room the
   art chapter gets below. */
export function Experience() {
  return (
    <section id="work" aria-label="Experience">
      <SectionHeader
        index="01"
        eyebrow="Experience"
        title="A decade of AI, in production"
        lede="Google, Covariant, Meta, Microsoft — taking systems from research demos to things billions of people rely on."
      />

      <div className="section-pad pad-tight !pt-0">
        <ol style={{ borderTop: '1px solid var(--rail)' }}>
          {experiences.map((exp) => (
            <li
              key={exp.id}
              data-reveal
              className="grid gap-x-8 gap-y-2 py-7 md:py-8 md:grid-cols-[6.5rem_13rem_minmax(0,1fr)_auto] md:items-baseline"
              style={{ borderBottom: '1px solid var(--rail)' }}
            >
              <span className="meta" style={{ color: 'var(--ink-faint)' }}>
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
