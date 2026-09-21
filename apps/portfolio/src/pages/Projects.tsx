import { Link } from 'react-router-dom'
import { Icon } from '@n3wth/ui'
import { SiteHeading } from '@n3wth/ui/site'
import { projects } from '../data/content'
import { ProjectVisual } from '../components/ProjectVisual'
import { SectionHeader } from '../components/Frame'
import { usePageMeta, buildWebPageSchema } from '../hooks/usePageMeta'

const TITLE = 'Projects — Oliver Newth'
const DESCRIPTION = 'Independent projects by Oliver Newth: tools for AI agents, a shared component library, and other experiments.'

export default function Projects() {
  usePageMeta(TITLE, DESCRIPTION, {
    canonical: '/projects',
    ogImage: '/og/work.png',
    jsonLd: buildWebPageSchema({
      url: 'https://n3wth.com/projects',
      title: TITLE,
      description: DESCRIPTION,
      breadcrumbs: [
        { name: 'Home', url: 'https://n3wth.com/' },
        { name: 'Projects', url: 'https://n3wth.com/projects' },
      ],
    }),
  })

  return <>
    <SectionHeader as="h1" title="Projects" lede="Tools for AI agents, a shared component library, and other experiments." />
    <div className="site-content-gutter project-index">
      {['r3', 'ui', 'skills'].map(slug => {
        const project = projects.find(item => item.id === slug)!
        return <article key={slug} className="project-feature">
          <div className="project-feature-copy">
            <div className="project-feature-heading">
              <SiteHeading level={2}><Link to={`/projects/${slug}`}>{project.name}</Link></SiteHeading>
              <a className="project-source" href={project.github} aria-label={`${project.name} source on GitHub`} title="Source on GitHub" target="_blank" rel="noopener noreferrer"><Icon name="github" size="md" /></a>
            </div>
            <p className="project-purpose">{project.question}</p>
            <p>{project.description}</p>
          </div>
          <ProjectVisual slug={slug} />
        </article>
      })}
      <section className="project-other">
        <SiteHeading level={2}>Other explorations</SiteHeading>
        <div className="project-other-list">{projects.filter(project => !['r3', 'ui', 'skills'].includes(project.id)).map(project => <article key={project.id}>
          <SiteHeading level={3} variant="item"><a href={project.url} target="_blank" rel="noopener noreferrer">{project.name}</a></SiteHeading>
          <p>{project.description}</p>
        </article>)}</div>
      </section>
    </div>
  </>
}
