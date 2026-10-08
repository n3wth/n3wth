const aliases = {
  'getting-started': 'quickstart', theming: 'theme-provider',
  components: 'primitives', hooks: 'scroll-reset', 'css-utilities': 'tailwind',
}

export default {
  fetch(request) {
    const url = new URL(request.url)
    const path = url.pathname.replace(/\/+$/, '')
    const slug = path.slice('/docs/'.length)
    const target = path === '/docs' ? 'https://docs.n3wth.com/ui/quickstart'
      : path.startsWith('/docs/') ? `https://docs.n3wth.com/ui/${Object.hasOwn(aliases, slug) ? aliases[slug] : slug}`
      : 'https://n3wth.com/projects/ui'
    return new Response(null, { status: 301, headers: { Location: target + url.search } })
  },
}
