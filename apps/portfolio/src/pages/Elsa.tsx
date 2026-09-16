import type { ReactNode } from 'react'
import { PageHeader, SiteSection, SiteHeading } from '@n3wth/ui/site'
import { usePageMeta, buildWebPageSchema } from '../hooks/usePageMeta'
import { RouterLink } from '../components/RouterLink'

const TITLE = 'Elsa — SMS Messaging Consent'
const DESCRIPTION =
  "SMS messaging consent for Elsa, Oliver Newth's personal AI assistant on n3wth.com at +1 (415) 360-0751."

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

export default function Elsa() {
  usePageMeta(TITLE, DESCRIPTION, {
    ogImage: '/og-image.png',
    jsonLd: buildWebPageSchema({
      url: 'https://n3wth.com/elsa',
      title: TITLE,
      description: DESCRIPTION,
      breadcrumbs: [
        { name: 'Home', url: 'https://n3wth.com/' },
        { name: 'Elsa SMS Consent', url: 'https://n3wth.com/elsa' },
      ],
    }),
  })

  return (
    <section aria-label="Elsa SMS messaging consent">
      <PageHeader
        data-reveal
        className="site-content-gutter"
        title="Elsa — SMS Messaging Consent"
        description={<>Last updated: September 2026</>}
      />

      <SiteSection data-reveal className="site-content-gutter max-w-3xl">
        <Section title="About Elsa">
          <Prose>
            Elsa is the personal AI assistant product name for messaging operated by Oliver Newth (sole proprietor) on n3wth.com. Elsa helps with email,
            scheduling, purchases, and other tasks Oliver authorizes. People text Elsa at{' '}
            <strong style={{ color: 'var(--ink)' }}>+1 (415) 360-0751</strong>.
          </Prose>
        </Section>

        <Section title="What messages you may receive">
          <Prose>
            By opting in, you consent to receive automated SMS (and MMS when needed) from{' '}
            <strong style={{ color: 'var(--ink)' }}>+1 (415) 360-0751</strong>, including:
          </Prose>
          <BulletList
            items={[
              'Two-way assistant conversations (replies to texts you send Elsa)',
              'Account and verification codes when Elsa is completing a task for Oliver that requires SMS OTP',
              'Transactional notices about tasks Elsa is running (confirmations, status, reminders Oliver has authorized)',
              'Occasional service notices about the Elsa / n3wth assistant line',
            ]}
          />
          <Prose>
            Message frequency varies. You may receive multiple messages in a day when actively texting
            Elsa or when a verification flow is in progress; otherwise expect low volume (typically under
            50 messages per month).{' '}
            <strong style={{ color: 'var(--ink)' }}>Message and data rates may apply.</strong>
          </Prose>
        </Section>

        <Section title="How to opt in">
          <Prose>
            You opt in by texting <strong style={{ color: 'var(--ink)' }}>+1 (415) 360-0751</strong>{' '}
            (for example START, HELLO, or any first message), or by giving Oliver / Elsa your mobile
            number and clearly agreeing to receive texts from this line for assistant and transactional
            purposes.
          </Prose>
          <div
            className="mt-6 rounded-lg border p-5"
            style={{ borderColor: 'var(--rail-strong)', background: 'color-mix(in srgb, var(--ink) 4%, transparent)' }}
          >
            <p className="text-base leading-relaxed" style={{ color: 'var(--ink)' }}>
              By texting +1 (415) 360-0751 or otherwise opting in, you agree to receive automated SMS
              messages from Elsa (n3wth.com / Oliver Newth). Message frequency varies. Message and data
              rates may apply. Reply STOP to opt out. Reply HELP for help. See{' '}
              <RouterLink href="/privacy" className="link-underline">Privacy Policy</RouterLink> and{' '}
              <RouterLink href="/terms" className="link-underline">Terms of Service</RouterLink>.
            </p>
          </div>
        </Section>

        <Section title="How to opt out">
          <BulletList
            items={[
              <>Replying <strong style={{ color: 'var(--ink)' }}>STOP</strong> to any message from +1 (415) 360-0751</>,
              <>Emailing <a href="mailto:hey@n3wth.com" className="link-underline">hey@n3wth.com</a> with your phone number and a request to unsubscribe</>,
            ]}
          />
          <Prose>
            After opting out you will receive a one-time confirmation and no further messages will be
            sent unless you opt in again (for example reply START).
          </Prose>
        </Section>

        <Section title="Help">
          <Prose>
            Reply <strong style={{ color: 'var(--ink)' }}>HELP</strong> to any message, or contact{' '}
            <a href="mailto:hey@n3wth.com" className="link-underline">hey@n3wth.com</a>.
          </Prose>
        </Section>

        <Section title="Privacy">
          <Prose>
            Your phone number is used only to deliver Elsa / n3wth assistant-related SMS and to operate
            conversations you start. We do <strong style={{ color: 'var(--ink)' }}>not</strong> sell or
            share mobile numbers with third parties or affiliates for their marketing. See the full{' '}
            <RouterLink href="/privacy" className="link-underline">Privacy Policy</RouterLink>.{' '}
            <RouterLink href="/terms" className="link-underline">Terms of Service</RouterLink>.
          </Prose>
        </Section>

        <Section title="Contact">
          <Prose>
            n3wth.com — Oliver Newth — <a href="mailto:hey@n3wth.com" className="link-underline">hey@n3wth.com</a>
            <br />
            Elsa SMS: +1 (415) 360-0751
          </Prose>
        </Section>
      </SiteSection>
    </section>
  )
}
