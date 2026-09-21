import { handlePortfolioApi } from './api/runtime'

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> }
  GEMINI_API_KEY?: string
  OPENROUTER_API_KEY?: string
  GITHUB_TOKEN?: string
  RESEND_API_KEY?: string
  RESEND_SEGMENT_ID?: string
  SUBSCRIBE?: { limit(options: { key: string }): Promise<{ success: boolean }> }
}

function cacheControl(path: string): string {
  if (path.startsWith('/assets/') || path.startsWith('/fonts/')) return 'public, max-age=31536000, immutable'
  return 'public, max-age=0, must-revalidate'
}

const SECURITY_HEADERS: Array<[string, string]> = [
  ['X-Frame-Options', 'DENY'],
  ['X-Content-Type-Options', 'nosniff'],
  ['Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload'],
  ['Referrer-Policy', 'strict-origin-when-cross-origin'],
  ['Permissions-Policy', 'camera=(), microphone=(), geolocation=()'],
]

function withSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers)
  for (const [key, value] of SECURITY_HEADERS) if (!headers.has(key)) headers.set(key, value)
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
}

function withCacheHeaders(request: Request, response: Response): Response {
  if (!response.ok) return response
  const headers = new Headers(response.headers)
  headers.set('Cache-Control', cacheControl(new URL(request.url).pathname))
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const apiResponse = await handlePortfolioApi(request, env)
    if (apiResponse) return withSecurityHeaders(apiResponse)
    return withCacheHeaders(request, await env.ASSETS.fetch(request))
  },
}
