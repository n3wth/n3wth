import { ArrowUpRight } from 'lucide-react'
import { Button } from '@n3wth/ui/primitives'
import { usePageMeta } from '../hooks/usePageMeta'
import { track } from '../lib/analytics'
import { PageHeader, SiteSection, SiteHeading } from '@n3wth/ui/site'

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
  usePageMeta(
    'Support — Oliver Newth',
    'Support for n3wth projects — n3wth.com, hop.flights, and theywontshutup.com. Email support@n3wth.com.',
    { noindex: false }
  )

  return (
    <section aria-label="Support">
      <PageHeader data-reveal className="site-content-gutter" title="Need a hand with something I built?" description={<>
          One inbox covers everything. Include the product name and what you
          were doing when things went sideways; screenshots help.
        </>} actions={
          <Button
            label="support@n3wth.com"
            variant="primary"
            href="mailto:support@n3wth.com"
            clickAction={() => track('support_contact_clicked', { project: 'all', channel: 'email' })}
            endContent={<ArrowUpRight size={16} strokeWidth={1.5} aria-hidden="true" />}
          />
        } />

      <SiteSection data-reveal className="site-content-gutter">
        <ul className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <li
              key={project.name}
              className="border-t pt-5"
              style={{ borderColor: 'var(--rail-strong)' }}
            >
              <SiteHeading variant="item" level={2}>
                <a href={project.href} className="link-underline">
                  {project.name}
                </a>
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
