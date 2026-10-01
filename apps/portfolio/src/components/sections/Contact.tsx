import { ArrowUpRight } from 'lucide-react'
import { Button } from '@n3wth/ui/primitives'
import { siteConfig, sections } from '../../data/content'
import { SectionHeader } from '../Frame'
import { StoryScene } from '../StoryScene'
import './contact.css'
import { track } from '../../lib/analytics'

const contactEventProps = { source_page: '/contact' } as const

export function Contact() {
  return (
    <section id="contact" aria-label="Contact">
      <SectionHeader
        as="h1"
        story="contact"
        title={sections.contact.name}
        lede={sections.contact.description}
      />
      <div className="site-content-gutter contact-invitation">
        <div className="contact-invitation-actions">
          <Button
            label={siteConfig.email}
            variant="primary"
            size="md"
            href={`mailto:${siteConfig.email}`}
            clickAction={() => track('contact_intent', { ...contactEventProps, method: 'email' })}
            endContent={<ArrowUpRight size={16} strokeWidth={1.5} aria-hidden="true" />}
          />
          <Button
            label="LinkedIn"
            variant="secondary"
            size="md"
            href={siteConfig.social.linkedin}
            rel="me noopener"
            clickAction={() => track('contact_intent', { ...contactEventProps, method: 'linkedin' })}
          />
        </div>
        <StoryScene kind="contact" />
      </div>
    </section>
  )
}
