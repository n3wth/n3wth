export function initializeSiteAnalytics<Options extends object>(
  client: { init(key: string, options?: Partial<Options>): unknown },
  options: Partial<NoInfer<Options>> & { api_host: string },
): void
export function captureEmailSignup(
  client: { setPersonProperties(properties: Record<string, unknown>): unknown; capture(event: string): unknown },
  email: string,
): void
