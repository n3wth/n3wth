const aliases = {
  introduction: 'quickstart', installation: 'quickstart',
  'api-reference': 'memory-tools', 'api/client': 'memory-tools',
  'ai-intelligence': 'knowledge-graph', integrations: 'configuration',
  'sdks/python': 'transport', 'sdks/typescript': 'transport',
  examples: 'quickstart', 'examples/chatbot-memory': 'memory-tools',
  changelog: 'quickstart', 'getting-started/introduction': 'quickstart',
  'getting-started/quickstart': 'quickstart', 'getting-started/installation': 'quickstart',
}

export default {
  fetch(request) {
    const url = new URL(request.url)
    const path = url.pathname.replace(/\/+$/, '')
    const slug = path.slice('/docs/'.length)
    const target = path === '/docs' ? 'https://docs.n3wth.com/r3/quickstart'
      : path.startsWith('/docs/') ? `https://docs.n3wth.com/r3/${Object.hasOwn(aliases, slug) ? aliases[slug] : slug}`
      : 'https://n3wth.com/projects/r3'
    return new Response(null, { status: 308, headers: { Location: target + url.search } })
  },
}
