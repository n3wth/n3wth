import { Button } from '@n3wth/ui/primitives'
import { SiteSection, SiteHeading, SiteText, SiteDocSection, SiteDocList } from '@n3wth/ui/site'
import { usePageMeta, buildWebPageSchema } from '../hooks/usePageMeta'
import { RouterLink } from '../components/RouterLink'

const TITLE = 'Elsa · SMS Messaging Consent'
const DESCRIPTION =
  "SMS messaging consent for Elsa, Oliver Newth's personal AI assistant on n3wth.com at +1 (415) 718-0992."

const ELSA_SMS = 'sms:+14157180992'
const ELSA_DISPLAY = '+1 (415) 718-0992'

const FEATURES = [
  { title: 'Email', copy: 'Draft, triage, and follow up when Oliver asks.' },
  { title: 'Scheduling', copy: 'Coordinate times and reminders over SMS.' },
  { title: 'Purchases', copy: 'Run authorized buys and status updates.' },
  { title: 'Tasks', copy: 'Anything else Oliver greenlights for Elsa.' },
] as const

function ElsaMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 512 512"
      width="160"
      height="160"
      role="img"
      aria-label="Elsa"
      focusable="false"
    >
      <rect width="512" height="512" rx="96" fill="#000" />
      <g className="elsa-slash">
        <rect
          x="236"
          y="96"
          width="40"
          height="320"
          rx="20"
          fill="#fff"
          transform="rotate(28 256 256)"
        />
      </g>
    </svg>
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
    <section aria-label="Elsa">
      <header
        data-reveal
        className="n3wth-site-page-header n3wth-site-page-header--center site-content-gutter mx-auto max-w-3xl"
      >
        <ElsaMark className="elsa-hero-mark" />
        <div className="n3wth-site-page-header-copy elsa-hero-copy">
          <SiteHeading variant="page" level={1}>
            Elsa
          </SiteHeading>
          <SiteText className="n3wth-site-description elsa-hero-description">
            A personal AI assistant in your texts.
          </SiteText>
          <div className="n3wth-site-actions elsa-hero-actions">
            <Button label={ELSA_DISPLAY} variant="primary" size="md" href={ELSA_SMS} />
          </div>
        </div>
      </header>

      <SiteSection data-reveal className="site-content-gutter mx-auto max-w-3xl">
        <SiteDocSection>
          <SiteText variant="lede">
            Elsa is the personal AI assistant product name for messaging operated by Oliver Newth
            (sole proprietor) on n3wth.com. She helps with email, scheduling, purchases, and other
            tasks Oliver authorizes, over a simple text thread.
          </SiteText>
          <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <li key={feature.title} className="flex flex-col gap-3">
                <SiteHeading variant="item" level={3}>
                  {feature.title}
                </SiteHeading>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-dim)' }}>
                  {feature.copy}
                </p>
              </li>
            ))}
          </ul>
        </SiteDocSection>

        <SiteDocSection title="How to text her">
          <SiteText>
            There is no website signup form, phone number field, or SMS consent checkbox on
            n3wth.com. Consumers opt in only by voluntarily texting{' '}
            <strong style={{ color: 'var(--ink)' }}>{ELSA_DISPLAY}</strong> after reading this page.
            SMS is optional and is not required to use n3wth.com.
          </SiteText>
          <div className="flex flex-col gap-3">
            <SiteHeading variant="item" level={3}>
              <a href={ELSA_SMS} className="link-underline">
                {ELSA_DISPLAY}
              </a>
            </SiteHeading>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-dim)' }}>
              Tap to open Messages and send START, HELLO, or any first message.
            </p>
            <Button label="Text Elsa" variant="primary" size="md" href={ELSA_SMS} />
          </div>
          <SiteText>
            Or give Oliver / Elsa your mobile number and clearly agree to receive texts from the Elsa
            SMS line for assistant and transactional purposes.
          </SiteText>
        </SiteDocSection>

        <SiteDocSection title="What you will get">
          <SiteText>
            By opting in, you consent to receive automated SMS (and MMS when needed) from{' '}
            <strong style={{ color: 'var(--ink)' }}>{ELSA_DISPLAY}</strong>, including:
          </SiteText>
          <SiteDocList
            items={[
              'Two-way assistant conversations (replies to texts you send Elsa)',
              'Account and verification codes when Elsa is completing a task for Oliver that requires SMS OTP',
              'Transactional notices about tasks Elsa is running (confirmations, status, reminders Oliver has authorized)',
              'Occasional service notices about the Elsa / n3wth assistant line',
            ]}
          />
          <SiteText>
            Message frequency varies. You may receive multiple messages in a day when actively
            texting Elsa or when a verification flow is in progress; otherwise expect low volume
            (typically under 50 messages per month).{' '}
            <strong style={{ color: 'var(--ink)' }}>Message and data rates may apply.</strong>
          </SiteText>
        </SiteDocSection>

        <SiteDocSection>
          <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
            <li className="flex flex-col gap-5">
              <SiteHeading variant="item" level={3}>
                Opt in
              </SiteHeading>
              <SiteDocList
                items={[
                  <>
                    Text{' '}
                    <a href={ELSA_SMS} className="link-underline">
                      {ELSA_DISPLAY}
                    </a>
                  </>,
                  'Or clearly agree with Oliver / Elsa to receive assistant texts',
                  'Consent is voluntary and is not a condition of purchase',
                ]}
              />
            </li>
            <li className="flex flex-col gap-5">
              <SiteHeading variant="item" level={3}>
                Opt out / help
              </SiteHeading>
              <SiteDocList
                items={[
                  <>
                    Reply <strong style={{ color: 'var(--ink)' }}>STOP</strong> to any message from
                    the Elsa number
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
          <SiteText>
            After opting out you will receive a one-time confirmation and no further messages will
            be sent unless you opt in again (for example reply START). SMS is optional. You can use
            n3wth.com without texting Elsa. Consent to receive messages is voluntary and is not
            required to browse the site, contact Oliver, or use other n3wth.com services.
          </SiteText>
          <SiteText>
            By texting {ELSA_DISPLAY} or otherwise opting in, you agree to receive automated SMS
            messages from Elsa (n3wth.com / Oliver Newth). Message frequency varies. Message and data
            rates may apply. Reply STOP to opt out. Consent is not a condition of purchase. Reply HELP
            for help. See{' '}
            <RouterLink href="/privacy" className="link-underline">
              Privacy Policy
            </RouterLink>{' '}
            and{' '}
            <RouterLink href="/terms" className="link-underline">
              Terms of Service
            </RouterLink>
            .
          </SiteText>
        </SiteDocSection>

        <SiteDocSection title="Privacy">
          <SiteText>
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
          </SiteText>
        </SiteDocSection>

        <SiteText variant="supporting" as="p" className="n3wth-site-doc-meta">
          Last updated September 2026
        </SiteText>
      </SiteSection>
    </section>
  )
}
