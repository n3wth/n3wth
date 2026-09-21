import type { NewsletterSource } from './analytics.js'

export interface NewsletterOptions {
  /** Explicit isolated API URL for previews and local development. */
  endpoint?: string
  /** Defaults to the current browser origin. */
  origin?: string
}
export function newsletterEndpoint(source: NewsletterSource, options?: NewsletterOptions): string
export function submitNewsletter(address: string, source: NewsletterSource, options?: NewsletterOptions): Promise<void>
export function newsletterErrorMessage(error: unknown): string
