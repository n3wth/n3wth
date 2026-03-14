import { useRef } from 'react'
import { ArrowUpRight, Github } from 'lucide-react'
import { gsap, useGSAP } from '../../lib/gsap'
import { projects, type Project } from '../../data/content'
import { useTilt } from '../../hooks/useTilt'

function ProjectCard({ project }: { project: Project }) {
  const cardRef = useRef<HTMLElement>(null)
  useTilt(cardRef)

  return (
    <article
      ref={cardRef}
      data-build-card
      className="group relative glass-card p-6 sm:p-8"
    >
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <h3 className="font-display text-xl sm:text-2xl font-semibold text-white tracking-tight">
          {project.name}
        </h3>
        <div className="flex items-center gap-2">
          {project.github && project.github !== project.url && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-lg transition-colors hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center focus-ring"
              style={{ color: 'var(--color-grey-400)' }}
              aria-label={`${project.name} on GitHub`}
            >
              <Github size={18} aria-hidden="true" />
            </a>
          )}
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-lg transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 min-w-[44px] min-h-[44px] flex items-center justify-center focus-ring"
            style={{ color: 'var(--color-grey-400)' }}
            aria-label={`Visit ${project.name}`}
          >
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </div>
      </div>

      <p
        className="text-base sm:text-lg leading-relaxed mb-4 sm:mb-6"
        style={{ color: 'var(--color-grey-300)' }}
      >
        {project.description}
      </p>

      <div className="flex flex-wrap gap-2">
        {project.tech.map((tag) => (
          <span
            key={tag}
            className="text-xs sm:text-sm font-mono uppercase tracking-wider px-2.5 py-1 rounded"
            style={{
              color: 'var(--color-grey-400)',
              background: 'var(--glass-bg)',
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  )
}

export function Building() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches
      if (prefersReducedMotion) return

      gsap.from('[data-build-header]', {
        scrollTrigger: {
          trigger: '[data-build-header]',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      })

      gsap.from('[data-build-card]', {
        scrollTrigger: {
          trigger: '[data-build-grid]',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        y: 40,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
      })
    },
    { scope: sectionRef }
  )

  return (
    <section ref={sectionRef} id="building" className="section relative">
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        <div data-build-header className="mb-10 sm:mb-16 md:mb-24">
          <p className="label mb-3 sm:mb-4">Building</p>
          <h2 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-[1.1] mb-4 sm:mb-6 text-glow">
            Open-source tools
          </h2>
          <p
            className="text-base sm:text-lg md:text-xl leading-relaxed max-w-xl"
            style={{ color: 'var(--color-grey-400)' }}
          >
            At the intersection of AI and collaboration.
          </p>
        </div>

        <div
          data-build-grid
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  )
}
