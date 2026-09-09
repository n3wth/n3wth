import { ArrowUpRight } from 'lucide-react'
import { projects, type Project } from '../../data/content'
import { SiteSection, SiteHeading } from '@n3wth/ui/site'

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article data-reveal className="grid gap-6 border-t border-[var(--rail-strong)] py-9 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-12 md:py-12">
      <div>
        <SiteHeading variant="item">{project.name}</SiteHeading>
        <p className="meta mt-3">{project.focus}</p>
      </div>
      <div>
        <p className="max-w-xl text-base font-semibold leading-relaxed">{project.question}</p>
        <p className="mt-5 max-w-xl text-base leading-relaxed" style={{ color: 'var(--ink-dim)' }}>{project.description}</p>
        <div className="mt-6 flex flex-wrap gap-x-7 gap-y-3 text-base">
          <a href={project.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2">Explore {project.name}<ArrowUpRight size={15} aria-hidden /></a>
          {project.github && <a href={project.github} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center" style={{ color: 'var(--ink-dim)' }}>Read the source</a>}
        </div>
      </div>
    </article>
  )
}

export function Building() {
  const selected = ['r3', 'kit', 'skills'].map((id) => projects.find((project) => project.id === id)!)
  const others = projects.filter((project) => !selected.includes(project))
  return (
    <SiteSection id="building" aria-labelledby="selected-projects" className="site-content-gutter scroll-mt-24">
      <SiteHeading id="selected-projects" className="mb-5">Selected independent projects</SiteHeading>
      <p className="mb-8 max-w-xl text-base leading-relaxed" style={{ color: 'var(--ink-dim)' }}>I build and operate these projects independently with coding agents. They are separate from my work at Google.</p>
      {selected.map((project) => <ProjectCard key={project.id} project={project} />)}
      <div className="border-t border-[var(--rail-strong)] pt-8">
        <SiteHeading className="mb-6">Other explorations</SiteHeading>
        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          {others.map((project) => (
            <article key={project.id}>
              <SiteHeading variant="item"><a className="inline-flex min-h-11 items-center gap-2" href={project.url} target="_blank" rel="noopener noreferrer">{project.name}<ArrowUpRight size={15} aria-hidden /></a></SiteHeading>
              <p className="mt-2 max-w-md text-base leading-relaxed" style={{ color: 'var(--ink-dim)' }}>{project.description}</p>
            </article>
          ))}
        </div>
      </div>
    </SiteSection>
  )
}
