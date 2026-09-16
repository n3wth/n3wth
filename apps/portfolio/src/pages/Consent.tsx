import type { ReactNode } from 'react'
import { PageHeader, SiteSection, SiteHeading } from '@n3wth/ui/site'
import { usePageMeta, buildWebPageSchema } from '../hooks/usePageMeta'
import { RouterLink } from '../components/RouterLink'

const TITLE = "SMS Consent — They Won't Shut Up"
const DESCRIPTION =
  "Opt in to receive SMS messages from They Won't Shut Up, an AI voice hotline by n3wth.com."

function Prose({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 text-base leading-relaxed" style={{ color: 'var(--ink-dim)' }}>
      {children}
    </p>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-10 first:mt-0">
      <SiteHeading variant="item" level={2}>{title}</SiteHeading>
      {children}
    </div>
  )
}

function BulletList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed" style={{ color: 'var(--ink-dim)' }}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  )
}

export default function Consent() {
  usePageMeta(TITLE, DESCRIPTION, {
    ogImage: '/og-image.png',
    jsonLd: buildWebPageSchema({
      url: 'https://n3wth.com/consent',
      title: TITLE,
      description: DESCRIPTION,
      breadcrumbs: [
        { name: 'Home', url: 'https://n3wth.com/' },
        { name: 'SMS Consent', url: 'https://n3wth.com/consent' },
      ],
    }),
  })

  return (
    <section aria-label="SMS messaging consent">
      <PageHeader
        data-reveal
        className="site-content-gutter"
        title="SMS Messaging Consent"
        description={<>Last updated: February 2026</>}
      />

      <SiteSection data-reveal className="site-content-gutter max-w-3xl">
        <Section title="About They Won't Shut Up">
          <Prose>
            <a
              href="https://theywontshutup.com"
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline"
            >
              They Won&apos;t Shut Up
            </a>{' '}
            is an AI voice hotline operated by n3wth.com. Users call{' '}
            <strong style={{ color: 'var(--ink)' }}>+1 (855) 580-0508</strong> to have conversations
            with AI characters powered by ElevenLabs Conversational AI.
          </Prose>
        </Section>

        <Section title="What Messages You May Receive">
          <Prose>
            By opting in, you consent to receive the following types of SMS messages from{' '}
            <strong style={{ color: 'var(--ink)' }}>+1 (855) 580-0508</strong>:
          </Prose>
          <BulletList
            items={[
              'Call follow-up messages (e.g., a summary or check-in after your call)',
              'Service notifications (e.g., updates about the hotline or new characters)',
            ]}
          />
          <Prose>
            Messages are sent at a frequency of no more than{' '}
            <strong style={{ color: 'var(--ink)' }}>5 messages per month</strong>. Message and data
            rates may apply.
          </Prose>
        </Section>

        <Section title="How to Opt In">
          <Prose>
            You opt in to receive SMS messages by calling the hotline at{' '}
            <strong style={{ color: 'var(--ink)' }}>+1 (855) 580-0508</strong>. By placing a call,
            you consent to receive follow-up text messages at the phone number you called from.
          </Prose>
          <div
            className="mt-6 rounded-lg border p-5"
            style={{ borderColor: 'var(--rail-strong)', background: 'color-mix(in srgb, var(--ink) 4%, transparent)' }}
          >
            <p className="text-base leading-relaxed" style={{ color: 'var(--ink)' }}>
              By calling +1 (855) 580-0508, you agree to receive automated SMS messages from They
              Won&apos;t Shut Up (n3wth.com). You can opt out at any time by replying STOP. Message
              frequency varies, up to 5 msgs/month. Msg &amp; data rates may apply.
            </p>
          </div>
        </Section>

        <Section title="How to Opt Out">
          <Prose>You can stop receiving messages at any time by:</Prose>
          <BulletList
            items={[
              <>Replying <strong style={{ color: 'var(--ink)' }}>STOP</strong> to any message from +1 (855) 580-0508</>,
              <>Emailing <a href="mailto:hey@n3wth.com" className="link-underline">hey@n3wth.com</a> with your phone number and a request to unsubscribe</>,
            ]}
          />
          <Prose>
            After opting out, you will receive a one-time confirmation message and no further
            messages will be sent.
          </Prose>
        </Section>

        <Section title="Help">
          <Prose>
            Reply <strong style={{ color: 'var(--ink)' }}>HELP</strong> to any message for
            assistance, or contact{' '}
            <a href="mailto:hey@n3wth.com" className="link-underline">hey@n3wth.com</a>.
          </Prose>
        </Section>

        <Section title="Privacy">
          <Prose>
            Your phone number is used solely for delivering SMS messages related to the hotline. We
            do not sell, share, or use your number for any other purpose. See our full{' '}
            <RouterLink href="/privacy" className="link-underline">Privacy Policy</RouterLink> for
            more information.
          </Prose>
          <Prose>
            For the Elsa personal assistant SMS line (+1 415 360-0751), see{' '}
            <RouterLink href="/elsa" className="link-underline">/elsa</RouterLink>.
          </Prose>
        </Section>

        <Section title="Contact">
          <Prose>
            n3wth.com - Oliver Newth
            <br />
            <a href="mailto:hey@n3wth.com" className="link-underline">hey@n3wth.com</a>
          </Prose>
        </Section>
      </SiteSection>
    </section>
  )
}
