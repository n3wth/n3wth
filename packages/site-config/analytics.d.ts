export const GA_MEASUREMENT_ID: string
export const googleAnalyticsScript: string
export function shouldExcludeTraffic(location?: Location, userAgent?: string): boolean
export function initializeGoogleAnalytics(): void
export function initializeSiteAnalytics<Options extends object>(
  client: { init(key: string, options?: Partial<Options>): unknown },
  options: Partial<NoInfer<Options>> & { api_host: string },
): void
export function captureSiteEvent(
  client: { capture(event: string, properties?: Record<string, unknown>): unknown },
  event: string,
  properties?: Record<string, unknown>,
): void
export function captureEmailSignup(
  client: { setPersonProperties(properties: Record<string, unknown>): unknown; capture(event: string): unknown },
  email: string,
): void
