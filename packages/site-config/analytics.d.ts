export function initializeSiteAnalytics<Options extends object>(
  client: { init(key: string, options?: Partial<Options>): unknown },
  options: Partial<NoInfer<Options>> & { api_host: string },
): void
