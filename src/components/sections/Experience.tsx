import { SectionHeader } from '../Frame'
import { education, experiences } from '../../data/content'

/* Ship log: a decade of work as a dense, confident index — one line per
   chapter, no résumé prose. Density here earns the breathing room the
   art chapter gets below. */
export function Experience() {
  return (
    <section id="work" aria-label="Experience">
      <SectionHeader
        title="Experience"
        lede="From Azure Cognitive Services in 2014 to DeepMind model platforms today, by way of Meta and Covariant."
      />

      <div className="section-pad pad-tight !pt-0">
        <ol className="space-y-2">
          {experiences.map((exp) => (
            <li
              key={exp.id}
              data-reveal
              className="grid gap-x-8 gap-y-2 border-t border-[var(--rail-strong)] py-6 md:py-7 md:grid-cols-[6.5rem_13rem_minmax(0,1fr)] md:items-baseline"
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
                className="text-base leading-relaxed max-w-xl"
                style={{ color: 'var(--ink)' }}
              >
                {exp.summary}
              </p>

            </li>
          ))}
        </ol>
        <p className="meta mt-8" style={{ color: 'var(--ink-dim)' }}>
          {education}
        </p>
      </div>
    </section>
  )
}
