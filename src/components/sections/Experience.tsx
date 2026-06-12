import { SectionHeader } from '../Frame'
import { RingsMark } from '../marks'
import { experiences } from '../../data/content'
import { useReveal } from '../../hooks/useReveal'

function isReal(v?: string) {
  return !!v && !v.trimStart().startsWith('[OLIVER')
}

export function Experience() {
  const revealRef = useReveal<HTMLElement>()
  return (
    <section id="work" aria-label="Experience" ref={revealRef}>
      <SectionHeader
        index="01"
        eyebrow="Experience"
        title={
          <>
            Building AI products at <span className="accent">billion-user</span>{' '}
            scale
          </>
        }
        lede="A decade shipping AI from research demos to production systems that millions depend on."
        mark={<RingsMark size={56} />}
      />

      <ol>
        {experiences.map((exp) => {
          const details: [string, string | undefined][] = [
            ['Context', exp.businessContext],
            ['Decision', exp.decision],
            ['Outcome', exp.businessOutcome],
            ['Lesson', exp.strategicLesson],
          ]
          const realDetails = details.filter(([, v]) => isReal(v))
          return (
            <li
              key={exp.id}
              className="relative section-pad !py-10 md:!py-14"
              style={{ borderTop: '1px solid var(--rail)' }}
              data-reveal
            >
              <span className="tick tick-tl" aria-hidden="true" />
              <span className="tick tick-tr" aria-hidden="true" />

              <div className="grid gap-6 md:grid-cols-[7rem_minmax(0,1fr)] md:gap-10">
                <div className="flex md:flex-col md:items-start items-baseline gap-4 md:gap-3 md:pt-2">
                  <span className="meta">{exp.period}</span>
                </div>

                <div>
                  <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
                    <h3 className="display text-[clamp(2rem,7vw,4.5rem)]">
                      {exp.company}
                    </h3>
                    {exp.metric && (
                      <span className="meta">
                        <span style={{ color: 'var(--ink)' }}>
                          {exp.metric.value}
                        </span>{' '}
                        {exp.metric.label}
                      </span>
                    )}
                  </div>

                  <p
                    className="mt-2 text-base md:text-lg font-medium"
                    style={{ color: 'var(--ink)' }}
                  >
                    {exp.role}
                  </p>

                  <p
                    className="mt-4 max-w-2xl text-sm md:text-base leading-relaxed"
                    style={{ color: 'var(--ink-dim)' }}
                  >
                    {exp.description}
                  </p>

                  {realDetails.length > 0 && (
                    <dl
                      className="mt-6 grid gap-4 sm:grid-cols-2 max-w-2xl pl-4"
                      style={{ borderLeft: '1px solid var(--rail)' }}
                    >
                      {realDetails.map(([k, v]) => (
                        <div key={k}>
                          <dt className="index mb-1">{k}</dt>
                          <dd
                            className="text-sm leading-relaxed"
                            style={{ color: 'var(--ink-dim)' }}
                          >
                            {v}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}

                  <ul className="mt-6 flex flex-wrap gap-x-3 gap-y-1">
                    {exp.tech.map((t, ti) => (
                      <li key={t} className="meta">
                        {t}
                        {ti < exp.tech.length - 1 && (
                          <span className="ml-3" style={{ color: 'var(--rail-strong)' }}>
                            /
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
