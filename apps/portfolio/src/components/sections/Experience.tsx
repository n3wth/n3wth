import { education, experiences } from '../../data/content'
import { SiteSection, SiteHeading, SiteText } from '@n3wth/ui/site'

/* Ship log: a decade of work as a dense, confident index — one line per
   chapter, no résumé prose. Density here earns the breathing room the
   art chapter gets below. */
export function Experience() {
  return (
    <SiteSection id="work" aria-label="Experience" className="site-content-gutter" style={{ paddingTop: 0 }}>
      <div>
        <ol className="space-y-2">
          {experiences.map((exp) => (
            <li
              key={exp.id}
              data-reveal
              className="grid gap-x-8 gap-y-4 border-t border-[var(--rail-strong)] py-6 md:py-7 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] md:items-baseline"
            >
              <div>
                <SiteHeading variant="item" level={2}>
                  {exp.company}
                </SiteHeading>
                <div className="mt-1 flex flex-col gap-1">
                  <SiteText variant="supporting">{exp.role}</SiteText>
                  <SiteText variant="supporting">{exp.period}</SiteText>
                </div>
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
        <div className="mt-8">
          <SiteText variant="supporting">{education}</SiteText>
        </div>
      </div>
    </SiteSection>
  )
}
