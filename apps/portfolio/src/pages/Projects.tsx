import { Link } from 'react-router-dom'
import { Github } from 'lucide-react'
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
    <SectionHeader as="h1" story="projects" title="Projects" lede="Tools for AI agents, a shared component library, and other experiments." />
    <div className="site-content-gutter project-index">
      {['ui', 'r3', 'skills'].map(slug => {
        const project = projects.find(item => item.id === slug)!
        return <article key={slug} className={`project-feature project-feature--${slug}`}>
          <div className="project-feature-copy">
            <div className="project-feature-heading">
              <SiteHeading level={2}><Link to={`/projects/${slug}`}>{project.name}</Link></SiteHeading>
              <a className="project-source" href={project.github} aria-label={`${project.name} source on GitHub`} title="Source on GitHub" target="_blank" rel="noopener noreferrer"><Github size={24} strokeWidth={2} aria-hidden="true" /></a>
            </div>
            <p className="project-purpose">{project.question}</p>
            <p>{project.description}</p>
            <div className="project-actions">
              <Link to={`/projects/${slug}`}>About {project.name}</Link>
              <a href={project.url} target="_blank" rel="noopener noreferrer">Open project</a>
            </div>
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
