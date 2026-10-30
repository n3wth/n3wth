import { siteUrls } from '../data/sites'

/** AI-generated destinations must resolve to web pages before becoming links. */
export function answerLinkHref(value: string): string | null {
  const href = value.trim()
  if (!href) return null
  try {
    const url = new URL(href, siteUrls.home)
    return url.protocol === 'https:' || url.protocol === 'http:' ? href : null
  } catch {
    return null
  }
}
