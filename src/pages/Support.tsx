import { ArrowUpRight } from 'lucide-react'
import { Button } from '@astryxdesign/core/Button'
import { usePageMeta } from '../hooks/usePageMeta'

const projects = [
  {
    name: 'n3wth.com',
    href: 'https://n3wth.com',
    purpose: 'Portfolio, writing, and experiments.',
    contact: 'support@n3wth.com',
  },
  {
    name: 'hop.flights',
    href: 'https://hop.flights',
    purpose: 'Flight search and booking tools.',
    contact: 'support@hop.flights',
  },
  {
    name: 'theywontshutup.com',
    href: 'https://theywontshutup.com',
    purpose: 'AI voice hotline — call and chat with AI characters.',
    contact: 'support@n3wth.com',
  },
]

export default function Support() {
  usePageMeta('Support — Oliver Newth', 'Support for n3wth projects.', { noindex: false })

  return (
    <section aria-label="Support">
      <header data-reveal className="section-pad pb-8 md:pb-12">
        <h1
          className="display text-[length:var(--display-h1)] max-w-[18ch]"
          style={{ letterSpacing: '-0.03em', lineHeight: 1 }}
        >
          Need a hand with something I built?
        </h1>
        <p className="t-lead mt-6 max-w-xl" style={{ color: 'var(--ink-dim)' }}>
          One inbox covers everything. Include the product name and what you
          were doing when things went sideways; screenshots help.
        </p>
        <div className="mt-10">
          <Button
            label="support@n3wth.com"
            variant="primary"
            href="mailto:support@n3wth.com"
            endContent={<ArrowUpRight size={16} strokeWidth={1.5} aria-hidden="true" />}
          />
        </div>
      </header>

      <div data-reveal className="section-pad pb-20">
        <ul className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <li
              key={project.name}
              className="border-t pt-5"
              style={{ borderColor: 'var(--rail-strong)' }}
            >
              <h2 className="display text-lg" style={{ letterSpacing: '-0.025em', lineHeight: 1.1 }}>
                <a href={project.href} className="link-underline">
                  {project.name}
                </a>
              </h2>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--ink-dim)' }}>
                {project.purpose}
              </p>
              <a
                href={`mailto:${project.contact}`}
                className="mono mt-4 inline-block"
                style={{ color: 'var(--ink-dim)' }}
              >
                {project.contact}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
