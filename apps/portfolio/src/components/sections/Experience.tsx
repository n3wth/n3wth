import { education, experiences } from '../../data/content'
import { SiteSection, SiteHeading, SiteText } from '@n3wth/ui/site'

export function Experience() {
  return (
    <SiteSection id="work" aria-label="Experience" className="site-content-gutter" style={{ paddingTop: 0 }}>
      <div>
        <ol className="work-chapters">
          {experiences.map((exp) => (
            <li
              key={exp.id}
              id={exp.id}
              className="work-chapter"
            >
              <div>
                <SiteHeading variant="item" level={2}>
                  <span className="work-company">{exp.company}</span>
                </SiteHeading>
                <div className="mt-1 flex flex-col gap-1">
                  <SiteText className="work-detail">{exp.role}</SiteText>
                  <SiteText className="work-detail">{exp.period}</SiteText>
                </div>
              </div>

              <div className="work-chapter-story"><p>
                {exp.summary}
              </p>
              {exp.metric && <p className="work-recognition">{exp.metric.label}, {exp.metric.value}</p>}
              </div>

            </li>
          ))}
        </ol>
        <div className="mt-8">
          <SiteText className="work-detail">{education}</SiteText>
        </div>
      </div>
    </SiteSection>
  )
}
