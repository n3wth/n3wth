import { ArrowUpRight } from 'lucide-react'
import { Button } from '@n3wth/ui/primitives'
import { track } from '../../lib/analytics'
import { SiteSection, SiteHeading } from '@n3wth/ui/site'
import { RouterLink } from '../RouterLink'

const projects = [
  {
    name: 'Elephant-Goldfish',
    href: '/projects/elephant-goldfish',
    purpose: 'Design checks, bug diagnosis, and code review in Codex.',
    contact: 'support@n3wth.com',
  },
  {
    name: 'n3wth.com',
    href: '/',
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
    name: 'lunchmoney.sh',
    href: 'https://lunchmoney.sh',
    purpose: 'Unofficial Lunch Money plugin for Claude, Codex, and Cursor.',
    contact: 'support@n3wth.com',
  },
  {
    name: 'theywontshutup.com',
    href: 'https://theywontshutup.com',
    purpose: 'AI voice hotline — call and chat with AI characters.',
    contact: 'support@n3wth.com',
  },
]

export default function Support() {
  return (
    <section id="support" aria-label="Support" className="scroll-mt-24">
      <SiteSection className="site-content-gutter">
        <SiteHeading level={2}>Support</SiteHeading>
        <p className="mt-4 mb-6 max-w-2xl">For help with a project, include its name, what you expected, and what happened. Screenshots and steps to reproduce the problem help. Leave out passwords and private data.</p>
          <Button
            label="support@n3wth.com"
            variant="primary"
            href="mailto:support@n3wth.com"
            clickAction={() => track('support_contact_clicked', { project: 'all', channel: 'email' })}
            endContent={<ArrowUpRight size={16} strokeWidth={1.5} aria-hidden="true" />}
          />
        <ul className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <li
              key={project.name}
              className="border-t pt-5"
              style={{ borderColor: 'var(--rail-strong)' }}
            >
              <SiteHeading variant="item" level={3}>
                <RouterLink href={project.href} className="link-underline">
                  {project.name}
                </RouterLink>
              </SiteHeading>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--ink-dim)' }}>
                {project.purpose}
              </p>
              <a
                href={`mailto:${project.contact}`}
                className="mono link-underline mt-4 inline-block py-3"
                style={{ color: 'var(--ink-dim)' }}
                onClick={() => track('support_contact_clicked', { project: project.name, channel: 'email' })}
              >
                {project.contact}
              </a>
            </li>
          ))}
        </ul>
      </SiteSection>
    </section>
  )
}
