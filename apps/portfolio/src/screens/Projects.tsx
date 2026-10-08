import { withTheme } from '../components/withTheme'
import { Github } from 'lucide-react'
import { SiteHeading } from '@n3wth/ui/site'
import { projects, sections } from '../data/content'
import { ProjectVisual } from '../components/ProjectVisual'
import { SectionHeader } from '../components/Frame'

function Projects() {

  return <>
    <SectionHeader as="h1" story="projects" title={sections.projects.name} lede={sections.projects.description} />
    <div className="site-content-gutter project-index">
      {['ui', 'r3'].map(slug => {
        const project = projects.find(item => item.id === slug)!
        return <article key={slug} className={`project-feature project-feature--${slug}`}>
          <div className="project-feature-copy">
            <div className="project-feature-heading">
              <SiteHeading level={2}><a href={`/projects/${slug}`}>{project.name}</a></SiteHeading>
              <a className="project-source" href={project.github} aria-label={`${project.name} source on GitHub`} title="Source on GitHub" target="_blank" rel="noopener noreferrer"><Github size={24} strokeWidth={2} aria-hidden="true" /></a>
            </div>
            <p className="project-purpose">{project.question}</p>
            <p>{project.description}</p>
            <div className="project-actions">
              <a href={`/projects/${slug}`}>About {project.name}</a>
              <a href={project.url} target="_blank" rel="noopener noreferrer">Open project</a>
            </div>
          </div>
          <ProjectVisual slug={slug} />
        </article>
      })}
      <section className="project-other">
        <SiteHeading level={2}>Other explorations</SiteHeading>
        <div className="project-other-list">{projects.filter(project => !['r3', 'ui'].includes(project.id)).map(project => <article key={project.id}>
          <SiteHeading level={3} variant="item"><a href={project.url} target="_blank" rel="noopener noreferrer">{project.name}</a></SiteHeading>
          <p>{project.description}</p>
        </article>)}</div>
      </section>
    </div>
  </>
}

export default withTheme(Projects)
