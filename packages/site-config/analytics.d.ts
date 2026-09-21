export const GA_MEASUREMENT_ID: string
export const NEWSLETTER_SUBSCRIBED_EVENT: 'newsletter_subscribed'
export const NEWSLETTER_SOURCES: readonly ['home', 'skills', 'garden', 'r3', 'ui']
export const googleAnalyticsScript: string
export type NewsletterSource = (typeof NEWSLETTER_SOURCES)[number]
export function shouldExcludeTraffic(location?: Location, userAgent?: string): boolean
export function initializeGoogleAnalytics(): void
export function sanitizeAnalyticsEvent<Event extends object>(event: Event): Event
export function createSiteAnalyticsBeforeSend(
  appBeforeSend?: (event: object) => object | null,
): (event: object) => object | null
export function withSiteAnalyticsPrivacy<Options extends object>(
  options?: Options,
): NoInfer<Options> & {
  session_recording: { maskAllInputs: true }
  before_send: (event: object) => object | null
}
export function initializeSiteAnalytics<Options extends object>(
  client: { init(key: string, options?: Partial<Options>): unknown },
  options: Partial<NoInfer<Options>> & { api_host: string },
): void
export function captureSiteEvent(
  client: { capture(event: string, properties?: Record<string, unknown>): unknown },
  event: string,
  properties?: Record<string, unknown>,
): void
export function captureNewsletterSubscribed(
  client: { capture(event: string, properties?: Record<string, unknown>): unknown } | null | undefined,
  source: NewsletterSource,
): void
