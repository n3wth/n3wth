export const notePath = slug => slug === '' ? '/' : slug === 'notes' ? '/thinking#notes' : `/thinking/${slug}`
export const topicPath = tag => `/thinking?topic=${encodeURIComponent(tag)}#notes`

export function createRedirects(notes, tags) {
  const routes = { '/': '/', '/world': '/', '/graph': '/', '/notes': '/thinking#notes', '/tags': '/thinking#notes', '/feed.xml': '/feed.xml', '/sitemap.xml': '/sitemap.xml', '/llms.txt': '/llms.txt' }
  for (const note of notes) routes[`/${note.slug}`] = notePath(note.slug)
  for (const tag of tags) routes[`/tags/${tag}`] = topicPath(tag)
  if (routes['/atomic-notes']) routes['/atomic-notess'] = routes['/atomic-notes']
  return routes
}
