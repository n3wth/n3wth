import { handlePortfolioApi } from './api/runtime'

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> }
  GEMINI_API_KEY?: string
  OPENROUTER_API_KEY?: string
  GITHUB_TOKEN?: string
}

function cacheControl(path: string): string {
  if (path.startsWith('/assets/') || path.startsWith('/fonts/')) return 'public, max-age=31536000, immutable'
  return 'public, max-age=0, must-revalidate'
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
    if (apiResponse) return apiResponse
    return withCacheHeaders(request, await env.ASSETS.fetch(request))
  },
}
