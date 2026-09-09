import { site } from '@/lib/site'
import { SiteFooter as SharedSiteFooter } from '@n3wth/ui/site'

export function SiteFooter() {
  return <SharedSiteFooter sourceHref={site.githubUrl} />
}
