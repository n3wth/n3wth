import { useRef, useState, useEffect } from 'react'
import { ArrowUpRight, Github, Star, GitFork } from 'lucide-react'
import { useReveal } from '../../hooks/useReveal'
import { SectionHeader } from '../Frame'
import { CubeMark } from '../marks'
import { projects, type Project } from '../../data/content'

export interface GitHubStats {
  stars: number | string
  forks: number | string
}

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [stats, setStats] = useState<GitHubStats>({ stars: '—', forks: '—' })

  useEffect(() => {
    if (!project.github) return
    const fetchStats = async () => {
      try {
        const url = new URL(project.github!)
        const [, owner, repo] = url.pathname.split('/')
        if (!owner || !repo) return
        const response = await fetch(`/api/github-stats?owner=${owner}&repo=${repo}`)
        if (!response.ok) {
          setStats({ stars: '—', forks: '—' })
          return
        }
        const data = await response.json()
        setStats({ stars: data.stars ?? '—', forks: data.forks ?? '—' })
      } catch (err) {
        console.error(`Error fetching stats for ${project.name}:`, err)
        setStats({ stars: '—', forks: '—' })
      }
    }
    fetchStats()
  }, [project.github, project.name])

  return (
    <article data-reveal data-build-card className="reveal cell group p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-baseline gap-3">
          <span className="index">{String(index + 1).padStart(2, '0')}</span>
          <h3 className="display text-2xl sm:text-3xl !tracking-tight">{project.name}</h3>
        </div>
        <div className="flex items-center gap-3">
          {project.github && (
            <span className="meta flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Star size={11} aria-hidden="true" /> {stats.stars}
              </span>
              <span className="flex items-center gap-1">
                <GitFork size={11} aria-hidden="true" /> {stats.forks}
              </span>
            </span>
          )}
        </div>
      </div>

      <p
        className="text-sm sm:text-base leading-relaxed mb-6"
        style={{ color: 'var(--dim)' }}
      >
        {project.description}
      </p>

      <ul className="flex flex-wrap gap-x-3 gap-y-1 mb-6">
        {project.tech.map((tag) => (
          <li key={tag} className="meta">
            {tag}
          </li>
        ))}
      </ul>

      <div
        className="flex items-center gap-5 pt-5"
        style={{ borderTop: '1px solid var(--rail)' }}
      >
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="link-underline font-mono text-xs uppercase tracking-[0.14em] inline-flex items-center gap-1.5"
          aria-label={`Visit ${project.name}`}
        >
          Visit <ArrowUpRight size={13} aria-hidden="true" />
        </a>
        {project.github && project.github !== project.url && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline font-mono text-xs uppercase tracking-[0.14em] inline-flex items-center gap-1.5"
            aria-label={`${project.name} on GitHub`}
          >
            <Github size={13} aria-hidden="true" /> Source
          </a>
        )}
      </div>
    </article>
  )
}

export function Building() {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)

  return (
    <section ref={ref} id="building" aria-label="Building">
      <SectionHeader
        index="02"
        eyebrow="Building"
        title="Open-source tools"
        lede="At the intersection of AI and collaboration. Shipped, documented, and free to use."
        mark={<CubeMark size={56} />}
      />

      <div className="section-pad !pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px" style={{ background: 'var(--rail)' }}>
          {projects.map((project, i) => (
            <div key={project.id} style={{ background: 'var(--canvas)' }}>
              <ProjectCard project={project} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
