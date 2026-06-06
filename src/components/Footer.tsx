import { Footer as UIFooter } from '@n3wth/ui'
import { siteConfig } from '../data/content'
import { CursorMark } from './marks'

export function Footer() {
  return (
    <UIFooter
      currentSite="n3wth"
      logo={
        <span className="brand" aria-label="n3wth">
          <span className="brand-mark shrink-0" aria-hidden="true">
            <CursorMark size={20} />
          </span>
          <span>n3wth</span>
        </span>
      }
      description="I build AI products at Google and large LED art on the side. Based in San Francisco."
      sections={[
        {
          title: 'Connect',
          links: [
            { label: 'GitHub', href: siteConfig.social.github },
            { label: 'LinkedIn', href: siteConfig.social.linkedin },
            { label: 'newth.art', href: siteConfig.artSite },
            { label: 'Email', href: `mailto:${siteConfig.email}` },
          ],
        },
      ]}
      copyright="© Oliver Newth 2026"
    />
  )
}
