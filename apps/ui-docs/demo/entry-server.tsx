import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { HelmetProvider } from 'react-helmet-async'
import { App } from './App'
import { docPages } from './DocsLayout'

export const routes = ['/', '/components', ...docPages.map(page => `/docs/${page.slug}`)]

export function render(path: string) {
  const markup = renderToString(<HelmetProvider><StaticRouter location={path}><App /></StaticRouter></HelmetProvider>)
  // Helmet 3 delegates metadata to React 19's native hoisting. Extract those
  // rendered tags rather than the legacy (React 18) Helmet context API.
  const head: string[] = []
  const body = markup.replace(/<title[^>]*>[\s\S]*?<\/title>|<meta\b[^>]*>|<link\b[^>]*>/g, tag => {
    head.push(tag)
    return ''
  })
  return { body, head: head.join('\n') }
}
