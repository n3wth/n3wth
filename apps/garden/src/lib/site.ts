/** Canonical public addresses shared by metadata and navigation. */
import { siteUrls } from '@n3wth/site-config'

export const site = {
  url: siteUrls.garden,
  parentUrl: siteUrls.home,
  githubUrl: 'https://github.com/n3wth/n3wth/tree/main/apps/garden',
} as const
