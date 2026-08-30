import { useState, useEffect } from 'react'
import { Github, Star, GitFork } from 'lucide-react'
import { Button } from '@astryxdesign/core/Button'
import { SectionHeader } from '../Frame'
import { projects, type Project } from '../../data/content'
import statsSnapshot from '../../data/github-stats.json'

export interface GitHubStats {
  stars: number | string
  forks: number | string
}

/* Build-time snapshot (scripts/fetch-github-stats.mjs, npm prebuild) so
   the counts are present on first paint even when the live API hiccups;
   the client fetch below refreshes them. */
function snapshotFor(github?: string): GitHubStats {
  if (github) {
    try {
      const [, owner, repo] = new URL(github).pathname.split('/')
      const entry = (statsSnapshot as Record<string, { stars: number; forks: number }>)[
        `${owner}/${repo}`
      ]
      if (entry) return entry
    } catch {
      // malformed url — fall through to placeholder
    }
  }
  return { stars: '—', forks: '—' }
}

export function ProjectCard({ project }: { project: Project }) {
  const [stats, setStats] = useState<GitHubStats>(() => snapshotFor(project.github))

  useEffect(() => {
    if (!project.github) return
    const fetchStats = async () => {
      try {
        const url = new URL(project.github!)
        const [, owner, repo] = url.pathname.split('/')
        if (!owner || !repo) return
        const response = await fetch(`/api/github-stats?owner=${owner}&repo=${repo}`)
        if (!response.ok) return // keep the build-time snapshot
        const data = await response.json()
        setStats({ stars: data.stars ?? '—', forks: data.forks ?? '—' })
      } catch (err) {
        console.error(`Error fetching stats for ${project.name}:`, err)
      }
    }
    fetchStats()
  }, [project.github, project.name])

  /* Counts of one or two quantify obscurity instead of proving traction;
     the star row earns its place at 25. */
  const hasStars = Number(stats.stars) >= 25

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
              aria-label={`Visit ${project.name} (opens in new tab)`}
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

      <div className="flex items-center gap-3 pt-2">
        <Button
          label="Visit"
          variant="ghost"
          size="sm"
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
        />
        {project.github && (
          <Button
            label="GitHub"
            variant="ghost"
            size="sm"
            icon={<Github size={14} strokeWidth={1.5} aria-hidden="true" />}
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
          />
        )}
      </div>
    </article>
  )
}

export function Building() {
  return (
    <section id="building" aria-label="Building">
      <SectionHeader
        title="Designed by hand, shipped by agents"
        lede="Five live products. I design the systems; my agent team keeps them shipping."
      />

      <div className="section-pad pad-tight !pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {projects.map((project, i) => (
            <div key={project.id} className={i === 0 ? 'md:col-span-2' : undefined}>
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
