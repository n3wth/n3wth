import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Button } from '@n3wth/ui/primitives'
import { ConvergeLight, VisualBand } from '@n3wth/ui/visuals'
import { siteConfig } from '../../data/content'
import { PageHeader } from '@n3wth/ui/site'

export function Contact() {
  const [copyStatus, setCopyStatus] = useState('')

  const copyEmail = async () => {
    setCopyStatus('')
    try {
      await navigator.clipboard.writeText(siteConfig.email)
      setCopyStatus('Email copied.')
    } catch {
      setCopyStatus(`Could not copy. Select the address above: ${siteConfig.email}`)
    }
  }

  return (
    <section id="contact" aria-label="Contact" className="min-h-[85vh] flex flex-col justify-center">
      {/* The bookend to /thinking's fork: two lines of light — one cool,
          one warm — converge and carry on as one. A conversation. */}
      <VisualBand height="clamp(200px, 34svh, 380px)">
        <ConvergeLight />
      </VisualBand>

      <div className="frame w-full">
        <PageHeader
          className="site-content-gutter"
          title="Let's talk"
          description="Product, AI safety, or LED art. Coffee if you're in San Francisco."
          actions={
            <>
              <Button
                label={siteConfig.email}
                variant="primary"
                size="md"
                href={`mailto:${siteConfig.email}`}
                endContent={<ArrowUpRight size={16} strokeWidth={1.5} aria-hidden="true" />}
              />
              <Button label="Copy email" variant="secondary" size="md" clickAction={copyEmail} />
              <Button
                label="LinkedIn"
                variant="secondary"
                size="md"
                href={siteConfig.social.linkedin}
                rel="me noopener"
              />
            </>
          }
        />
        <p
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="site-content-gutter min-h-6 text-sm"
          style={{ color: 'var(--ink-dim)' }}
        >
          {copyStatus}
        </p>
      </div>
    </section>
  )
}
