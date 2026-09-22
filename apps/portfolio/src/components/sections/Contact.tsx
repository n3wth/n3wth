import { ArrowUpRight } from 'lucide-react'
import { Button } from '@n3wth/ui/primitives'
import { ConvergeLight, VisualBand } from '@n3wth/ui/visuals'
import { siteConfig } from '../../data/content'
import { SectionHeader } from '../Frame'
import { track } from '../../lib/analytics'

const contactEventProps = { source_page: '/contact' } as const

export function Contact() {
  return (
    <section id="contact" aria-label="Contact" className="min-h-[85vh] flex flex-col justify-center">
      {/* The bookend to /thinking's fork: two lines of light — one cool,
          one warm — converge and carry on as one. A conversation. */}
      <VisualBand height="clamp(200px, 34svh, 380px)">
        <ConvergeLight />
      </VisualBand>

      <div className="frame w-full">
        <SectionHeader
          as="h1"
          title="Let's talk"
          lede="Product, AI safety, or LED art. Coffee if you're in San Francisco."
          action={
            <>
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
            </>
          }
        />
      </div>
    </section>
  )
}
