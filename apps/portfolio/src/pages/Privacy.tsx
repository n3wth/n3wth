import type { ReactNode } from 'react'
import { PageHeader, SiteSection, SiteHeading } from '@n3wth/ui/site'
import { usePageMeta, buildWebPageSchema } from '../hooks/usePageMeta'
import { RouterLink } from '../components/RouterLink'

const TITLE = 'Privacy Policy — Oliver Newth'
const DESCRIPTION =
  "Privacy policy for n3wth.com - Oliver Newth's personal website."

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

export default function Privacy() {
  usePageMeta(TITLE, DESCRIPTION, {
    ogImage: '/og-image.png',
    jsonLd: buildWebPageSchema({
      url: 'https://n3wth.com/privacy',
      title: TITLE,
      description: DESCRIPTION,
      breadcrumbs: [
        { name: 'Home', url: 'https://n3wth.com/' },
        { name: 'Privacy Policy', url: 'https://n3wth.com/privacy' },
      ],
    }),
  })

  return (
    <section aria-label="Privacy Policy">
      <PageHeader
        data-reveal
        className="site-content-gutter"
        title="Privacy Policy"
        description={<>Last updated: September 2026</>}
      />

      <SiteSection data-reveal className="site-content-gutter max-w-3xl">
        <Section title="Overview">
          <Prose>
            n3wth.com is Oliver Newth&apos;s personal portfolio website. The following policy
            describes how the site collects and uses information.
          </Prose>
        </Section>

        <Section title="Information Collection">
          <Prose>
            The portfolio pages on n3wth.com do not require accounts or tracking cookies for
            browsing. When you use the SMS or voice lines described below, we collect the personal
            information needed to operate those services (for example your phone number and message
            content). Server hosting and analytics may also process limited technical data as
            described in this policy.
          </Prose>
        </Section>

        <Section title="They Won't Shut Up Hotline">
          <Prose>
            When you call the They Won&apos;t Shut Up hotline at{' '}
            <strong style={{ color: 'var(--ink)' }}>+1 (855) 580-0508</strong>, your phone number
            may be collected for the purpose of delivering follow-up SMS messages. Your phone number
            is not sold or shared with third parties or affiliates for their marketing, and is not
            used for cross-context behavioral advertising. Twilio acts as our SMS processor to send
            and receive those messages. You can opt out of SMS at any time by replying STOP. Message frequency varies. Message and data rates may apply. See our{' '}
            <RouterLink href="/consent" className="link-underline">SMS Consent page</RouterLink> for
            full details.
          </Prose>
        </Section>

        <Section title="Elsa assistant SMS">
          <Prose>
            When you text or otherwise opt in to Elsa at{' '}
            <strong style={{ color: 'var(--ink)' }}>+1 (415) 360-0751</strong>, your phone number
            and related SMS content/metadata may be collected to send and receive assistant-related
            SMS (conversations, verification codes, transactional notices). Your phone number is not
            sold or shared with third parties or affiliates for their marketing, and is not used for
            cross-context behavioral advertising. Twilio acts as our SMS processor. Reply STOP to
            opt out. See{' '}
            <RouterLink href="/elsa" className="link-underline">https://n3wth.com/elsa</RouterLink>{' '}
            for full SMS consent details. Message frequency varies. Message and data rates may apply. The messaging program is operated by Oliver Newth (sole proprietor); Elsa is the assistant product name.
          </Prose>
        </Section>

        <Section title="Analytics">
          <Prose>
            The site may use privacy-focused analytics to understand general traffic patterns. Any
            analytics in use do not track individual users, do not use cookies, and do not collect
            personally identifiable information.
          </Prose>
        </Section>

        <Section title="Third-Party Services">
          <Prose>
            Vercel hosts n3wth.com. Vercel may collect standard server logs, including IP addresses,
            for security and performance purposes. Refer to{' '}
            <a
              href="https://vercel.com/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline"
            >
              Vercel&apos;s Privacy Policy
            </a>{' '}
            for more information.
          </Prose>
          <Prose>
            Twilio processes SMS (and related telephony metadata) for the Elsa assistant line
            (+1 415 360-0751) and the They Won&apos;t Shut Up hotline (+1 855 580-0508) as a service
            provider / processor on our behalf. Twilio may retain data under its own policies. See{' '}
            <a
              href="https://www.twilio.com/legal/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline"
            >
              Twilio&apos;s Privacy Policy
            </a>
            .
          </Prose>
        </Section>

        <Section title="External Links">
          <Prose>
            The site contains links to external websites (GitHub, LinkedIn, etc.). Each external
            site maintains its own privacy policies and practices, which are not covered here.
          </Prose>
        </Section>

        <Section title="SMS data retention">
          <Prose>
            Phone numbers and SMS conversation content or metadata related to Elsa (+1 415 360-0751)
            and the They Won&apos;t Shut Up hotline (+1 855 580-0508) are retained for up to 24
            months, unless a longer period is needed for security, disputes, or legal obligations.
            On a verified STOP or deletion request, we delete or anonymize that data sooner when
            feasible. Twilio may retain copies under its own processor policies.
          </Prose>
        </Section>

        <Section title="California privacy rights (CCPA/CPRA)">
          <Prose>
            If you are a California resident, you have the right to know/access, delete, and
            correct personal information we hold about you. n3wth.com does not sell personal
            information or share it for cross-context behavioral advertising as those terms are used
            under the CCPA/CPRA. To exercise these rights, email{' '}
            <a href="mailto:hey@n3wth.com" className="link-underline">hey@n3wth.com</a>. We will not
            discriminate against you for exercising your privacy rights. See also{' '}
            <RouterLink href="/terms" className="link-underline">Terms of Service</RouterLink> and
            the SMS consent pages at{' '}
            <RouterLink href="/elsa" className="link-underline">/elsa</RouterLink> and{' '}
            <RouterLink href="/consent" className="link-underline">/consent</RouterLink>.
          </Prose>
        </Section>

        <Section title="Contact">
          <Prose>
            For questions about this privacy policy, please contact Oliver Newth at{' '}
            <a href="mailto:hey@n3wth.com" className="link-underline">hey@n3wth.com</a>.
          </Prose>
        </Section>

        <Section title="Changes">
          <Prose>
            The privacy policy may be updated periodically. Any changes will appear on this page
            with an updated revision date.
          </Prose>
        </Section>
      </SiteSection>
    </section>
  )
}
