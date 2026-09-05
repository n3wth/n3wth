import { ArrowUpRight } from 'lucide-react'
import { projects, type Project } from '../../data/content'

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article data-reveal className="grid gap-6 border-t border-[var(--rail-strong)] py-9 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-12 md:py-12">
      <div>
        <h3 className="display text-3xl tracking-tight">{project.name}</h3>
        <p className="meta mt-3">{project.focus}</p>
      </div>
      <div>
        <p className="display max-w-[28ch] text-2xl leading-tight tracking-tight md:text-3xl" style={{ textWrap: 'balance' }}>{project.question}</p>
        <p className="mt-5 max-w-xl text-base leading-relaxed" style={{ color: 'var(--ink-dim)' }}>{project.description}</p>
        <div className="mt-6 flex flex-wrap gap-x-7 gap-y-3 text-sm">
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
    <section id="building" aria-labelledby="selected-projects" className="section-pad !pt-0 scroll-mt-24">
      <h2 id="selected-projects" className="meta mb-5">Selected independent projects</h2>
      {selected.map((project) => <ProjectCard key={project.id} project={project} />)}
      <div className="border-t border-[var(--rail-strong)] pt-8">
        <h2 className="meta mb-6">Other explorations</h2>
        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          {others.map((project) => (
            <article key={project.id}>
              <h3 className="display text-xl"><a className="inline-flex min-h-11 items-center gap-2" href={project.url} target="_blank" rel="noopener noreferrer">{project.name}<ArrowUpRight size={15} aria-hidden /></a></h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed" style={{ color: 'var(--ink-dim)' }}>{project.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
