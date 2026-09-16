import type { ReactNode } from 'react'
import { MessageSquare } from 'lucide-react'
import { Button } from '@n3wth/ui/primitives'
import { Avatar, Badge } from '@n3wth/ui'
import { PageHeader, SiteSection, SiteHeading, SiteText } from '@n3wth/ui/site'
import { usePageMeta, buildWebPageSchema } from '../hooks/usePageMeta'
import { RouterLink } from '../components/RouterLink'

const TITLE = 'Elsa · SMS Messaging Consent'
const DESCRIPTION =
  "SMS messaging consent for Elsa, Oliver Newth's personal AI assistant on n3wth.com at +1 (415) 718-0992 (Telnyx) and +1 (415) 360-0751 (Twilio)."

const PRIMARY_SMS = 'sms:+14157180992'
const ALT_SMS = 'sms:+14153600751'

const FEATURES = [
  { title: 'Email', copy: 'Draft, triage, and follow up when Oliver asks.' },
  { title: 'Scheduling', copy: 'Coordinate times and reminders over SMS.' },
  { title: 'Purchases', copy: 'Run authorized buys and status updates.' },
  { title: 'Tasks', copy: 'Anything else Oliver greenlights for Elsa.' },
] as const

const NUMBERS = [
  {
    badge: 'Primary · Telnyx',
    display: '+1 (415) 718-0992',
    href: PRIMARY_SMS,
    copy: 'Tap to open Messages. Send START, HELLO, or any first message.',
    buttonLabel: 'Text Elsa',
    variant: 'primary' as const,
  },
  {
    badge: 'Alternate · Twilio',
    display: '+1 (415) 360-0751',
    href: ALT_SMS,
    copy: 'Backup line for the same Elsa assistant.',
    buttonLabel: 'Text backup line',
    variant: 'secondary' as const,
  },
] as const

function Prose({ children }: { children: ReactNode }) {
  return (
    <SiteText variant="body" className="mt-3">
      {children}
    </SiteText>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-14 first:mt-0">
      <SiteHeading variant="item" level={2}>
        {title}
      </SiteHeading>
      {children}
    </div>
  )
}

function BulletList({ items }: { items: ReactNode[] }) {
  return (
    <ul
      className="mt-4 list-disc space-y-2.5 pl-5 text-base leading-relaxed"
      style={{ color: 'var(--ink-dim)' }}
    >
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
      <div data-reveal className="elsa-hero site-content-gutter mx-auto max-w-3xl">
        <Avatar
          src="https://r2.n3wth.com/email/marks/elsa-mark.png?v=3"
          alt=""
          size="xl"
          className="elsa-hero-mark"
        />
        <Badge variant="outline" size="md" className="elsa-hero-pill">
          SMS assistant
        </Badge>
        <PageHeader
          align="center"
          className="elsa-hero-header"
          title="Elsa"
          description={
            <>
              Personal AI assistant over SMS for Oliver Newth on n3wth.com. Text for help with
              email, scheduling, purchases, and other tasks Oliver authorizes.
              <SiteText variant="supporting" as="span" className="elsa-hero-meta mt-3 block">
                SMS messaging consent · Last updated September 2026
              </SiteText>
            </>
          }
          actions={
            <div className="elsa-hero-actions">
              <Button
                label="+1 (415) 718-0992"
                variant="primary"
                href={PRIMARY_SMS}
                endContent={<MessageSquare size={16} strokeWidth={1.5} aria-hidden="true" />}
              />
              <Button label="+1 (415) 360-0751" variant="secondary" href={ALT_SMS} />
            </div>
          }
        />
      </div>

      <SiteSection data-reveal className="site-content-gutter mx-auto max-w-3xl">
        <Section title="What Elsa does">
          <Prose>
            Elsa is the personal AI assistant product name for messaging operated by Oliver Newth
            (sole proprietor) on n3wth.com. She helps with email, scheduling, purchases, and other
            tasks Oliver authorizes, over a simple text thread.
          </Prose>
          <ul className="mt-6 grid gap-x-10 gap-y-10 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <li
                key={feature.title}
                className="border-t pt-5"
                style={{ borderColor: 'var(--rail-strong)' }}
              >
                <SiteHeading variant="item" level={3}>
                  {feature.title}
                </SiteHeading>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--ink-dim)' }}>
                  {feature.copy}
                </p>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="How to text her">
          <Prose>
            There is no website signup form, phone number field, or SMS consent checkbox on
            n3wth.com. Consumers opt in only by voluntarily texting{' '}
            <strong style={{ color: 'var(--ink)' }}>+1 (415) 718-0992</strong> or{' '}
            <strong style={{ color: 'var(--ink)' }}>+1 (415) 360-0751</strong> after reading this
            page. SMS is optional and is not required to use n3wth.com.
          </Prose>
          <ul className="mt-6 grid gap-x-10 gap-y-10 sm:grid-cols-2">
            {NUMBERS.map((number) => (
              <li
                key={number.display}
                className="border-t pt-5"
                style={{ borderColor: 'var(--rail-strong)' }}
              >
                <Badge variant="outline" size="sm">
                  {number.badge}
                </Badge>
                <SiteHeading variant="item" level={3} className="mt-3">
                  <a href={number.href} className="link-underline">
                    {number.display}
                  </a>
                </SiteHeading>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--ink-dim)' }}>
                  {number.copy}
                </p>
                <Button
                  label={number.buttonLabel}
                  variant={number.variant}
                  href={number.href}
                  className="mt-4"
                  endContent={
                    number.variant === 'primary' ? (
                      <MessageSquare size={16} strokeWidth={1.5} aria-hidden="true" />
                    ) : undefined
                  }
                />
              </li>
            ))}
          </ul>
          <Prose>
            Or give Oliver / Elsa your mobile number and clearly agree to receive texts from either
            Elsa SMS line for assistant and transactional purposes.
          </Prose>
        </Section>

        <Section title="What you will get">
          <Prose>
            By opting in, you consent to receive automated SMS (and MMS when needed) from{' '}
            <strong style={{ color: 'var(--ink)' }}>+1 (415) 718-0992</strong> or{' '}
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
            Message frequency varies. You may receive multiple messages in a day when actively
            texting Elsa or when a verification flow is in progress; otherwise expect low volume
            (typically under 50 messages per month).{' '}
            <strong style={{ color: 'var(--ink)' }}>Message and data rates may apply.</strong>
          </Prose>
        </Section>

        <Section title="Opt in and opt out">
          <ul className="mt-4 grid gap-x-10 gap-y-10 sm:grid-cols-2">
            <li className="border-t pt-5" style={{ borderColor: 'var(--rail-strong)' }}>
              <SiteHeading variant="item" level={3}>
                Opt in
              </SiteHeading>
              <BulletList
                items={[
                  <>
                    Text{' '}
                    <a href={PRIMARY_SMS} className="link-underline">
                      +1 (415) 718-0992
                    </a>{' '}
                    or{' '}
                    <a href={ALT_SMS} className="link-underline">
                      +1 (415) 360-0751
                    </a>
                  </>,
                  'Or clearly agree with Oliver / Elsa to receive assistant texts',
                  'Consent is voluntary and is not a condition of purchase',
                ]}
              />
            </li>
            <li className="border-t pt-5" style={{ borderColor: 'var(--rail-strong)' }}>
              <SiteHeading variant="item" level={3}>
                Opt out / help
              </SiteHeading>
              <BulletList
                items={[
                  <>
                    Reply <strong style={{ color: 'var(--ink)' }}>STOP</strong> to any message from
                    either Elsa number
                  </>,
                  <>
                    Or email{' '}
                    <a href="mailto:hey@n3wth.com" className="link-underline">
                      hey@n3wth.com
                    </a>{' '}
                    with your number
                  </>,
                  <>
                    Reply <strong style={{ color: 'var(--ink)' }}>HELP</strong> for help anytime
                  </>,
                ]}
              />
            </li>
          </ul>
          <Prose>
            After opting out you will receive a one-time confirmation and no further messages will
            be sent unless you opt in again (for example reply START). SMS is optional. You can use
            n3wth.com without texting Elsa. Consent to receive messages is voluntary and is not
            required to browse the site, contact Oliver, or use other n3wth.com services.
          </Prose>
          <div
            className="mt-6 rounded-lg border p-5"
            style={{
              borderColor: 'var(--rail-strong)',
              background: 'color-mix(in srgb, var(--ink) 4%, transparent)',
            }}
          >
            <SiteText variant="body" style={{ color: 'var(--ink)' }}>
              By texting +1 (415) 718-0992 or +1 (415) 360-0751 or otherwise opting in, you agree to
              receive automated SMS messages from Elsa (n3wth.com / Oliver Newth). Message frequency
              varies. Message and data rates may apply. Reply STOP to opt out. Consent is not a
              condition of purchase. Reply HELP for help. See{' '}
              <RouterLink href="/privacy" className="link-underline">
                Privacy Policy
              </RouterLink>{' '}
              and{' '}
              <RouterLink href="/terms" className="link-underline">
                Terms of Service
              </RouterLink>
              .
            </SiteText>
          </div>
        </Section>

        <Section title="Privacy">
          <Prose>
            Your phone number is used only to deliver Elsa / n3wth assistant-related SMS and to
            operate conversations you start. We do{' '}
            <strong style={{ color: 'var(--ink)' }}>not</strong> sell or share mobile numbers with
            third parties or affiliates for their marketing. See the full{' '}
            <RouterLink href="/privacy" className="link-underline">
              Privacy Policy
            </RouterLink>
            .{' '}
            <RouterLink href="/terms" className="link-underline">
              Terms of Service
            </RouterLink>
            .
          </Prose>
        </Section>

        <Section title="Contact">
          <ul className="mt-4 grid gap-x-10 gap-y-10 sm:grid-cols-1">
            <li className="border-t pt-5" style={{ borderColor: 'var(--rail-strong)' }}>
              <SiteText variant="body">
                n3wth.com · Oliver Newth ·{' '}
                <a href="mailto:hey@n3wth.com" className="link-underline">
                  hey@n3wth.com
                </a>
              </SiteText>
              <div className="mt-4 grid gap-3">
                <SiteText variant="supporting" as="div">
                  <span className="elsa-contact-label">Primary (Telnyx)</span>{' '}
                  <a href={PRIMARY_SMS} className="link-underline">
                    +1 (415) 718-0992
                  </a>
                </SiteText>
                <SiteText variant="supporting" as="div">
                  <span className="elsa-contact-label">Alternate (Twilio)</span>{' '}
                  <a href={ALT_SMS} className="link-underline">
                    +1 (415) 360-0751
                  </a>
                </SiteText>
              </div>
            </li>
          </ul>
        </Section>
      </SiteSection>
    </section>
  )
}
