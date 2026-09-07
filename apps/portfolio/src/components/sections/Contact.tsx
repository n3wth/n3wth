import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Button } from '@astryxdesign/core/Button'
import { ConvergeLight } from '../ConvergeLight'
import { siteConfig } from '../../data/content'

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
      <div className="bleed" aria-hidden>
        <div data-reveal className="w-full" style={{ height: 'clamp(200px, 34svh, 380px)' }}>
          <ConvergeLight />
        </div>
      </div>

      <div className="frame w-full">
        <div className="section-pad w-full">
          <div className="max-w-3xl">
            <h1 className="display page-title">Let's talk</h1>

            <p className="mt-6 text-base md:text-xl leading-relaxed max-w-lg" style={{ color: 'var(--ink-dim)' }}>
              Product, AI safety, or LED art. Coffee if you're in San Francisco.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Button
                label={siteConfig.email}
                variant="primary"
                href={`mailto:${siteConfig.email}`}
                endContent={<ArrowUpRight size={16} strokeWidth={1.5} aria-hidden="true" />}
              />
              <button type="button" className="btn min-h-11" onClick={copyEmail}>
                Copy email
              </button>
              <a className="btn min-h-11" href={siteConfig.social.linkedin} rel="me noopener">
                LinkedIn
              </a>
            </div>
            <p role="status" aria-live="polite" aria-atomic="true" className="mt-3 min-h-6 text-sm" style={{ color: 'var(--ink-dim)' }}>
              {copyStatus}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
