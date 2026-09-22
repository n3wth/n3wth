import redirects from './redirects.json' with { type: 'json' }

export default {
  fetch(request, env = {}) {
    const headers = { 'X-Robots-Tag': 'noindex' }
    if (!['GET', 'HEAD'].includes(request.method)) return new Response(null, { status: 405, headers: { ...headers, Allow: 'GET, HEAD' } })
    const url = new URL(request.url)
    if (url.pathname === '/__health') return new Response(request.method === 'HEAD' ? null : 'ok', { headers })
    let path
    try { path = decodeURIComponent(url.pathname).replace(/\/+$/, '') || '/' } catch {
      return new Response(null, { status: 400, headers })
    }
    const route = Object.hasOwn(redirects, path) ? redirects[path] : undefined
    if (!route) return new Response(request.method === 'HEAD' ? null : 'Not found', { status: 404, headers })
    const target = new URL(route, env.TARGET_ORIGIN || 'https://n3wth.com')
    const reserved = new Set(target.searchParams.keys())
    for (const [key, value] of url.searchParams) {
      if (!reserved.has(key)) target.searchParams.append(key, value)
    }
    return new Response(null, { status: 308, headers: { ...headers, Location: target.href } })
  },
}
