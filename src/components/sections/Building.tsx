import { useState, useEffect } from 'react'
import { Github, Star, GitFork } from 'lucide-react'
import { SectionHeader } from '../Frame'
import { CubeMark } from '../marks'
import { projects, type Project } from '../../data/content'

export interface GitHubStats {
  stars: number | string
  forks: number | string
}

export function ProjectCard({ project }: { project: Project }) {
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

  const hasStars = Number(stats.stars) > 0

  return (
    <article data-build-card className="cell group p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-baseline gap-3">
          <h3 className="display text-2xl sm:text-3xl !tracking-tight">
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline"
              aria-label={`Visit ${project.name}`}
            >
              {project.name}
            </a>
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {project.github && hasStars && (
            <span className="mono flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Star size={14} strokeWidth={1.5} aria-hidden="true" /> {stats.stars}
              </span>
              <span className="flex items-center gap-1">
                <GitFork size={14} strokeWidth={1.5} aria-hidden="true" /> {stats.forks}
              </span>
            </span>
          )}
        </div>
      </div>

      <p
        className="text-sm sm:text-base leading-relaxed mb-6"
        style={{ color: 'var(--ink-dim)' }}
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
        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline text-xs font-medium uppercase tracking-[0.16em] inline-flex items-center gap-1.5"
            aria-label={`${project.name} on GitHub`}
          >
            <Github size={14} strokeWidth={1.5} aria-hidden="true" /> GitHub
          </a>
        )}
      </div>
    </article>
  )
}

export function Building() {
  return (
    <section id="building" aria-label="Building">
      <SectionHeader
        eyebrow="Open source"
        title="Tools I've shipped"
        lede="Small, focused tools for AI and collaboration — documented, in production, and free to use."
        mark={<CubeMark size={56} />}
      />

      <div className="section-pad pad-tight !pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px" style={{ background: 'var(--rail)' }}>
          {projects.map((project, i) => (
            <div
              key={project.id}
              className={i === 0 ? 'md:col-span-2' : undefined}
              style={{ background: 'var(--bg)' }}
            >
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
