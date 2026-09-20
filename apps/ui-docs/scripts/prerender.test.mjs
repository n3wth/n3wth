import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { JSDOM } from 'jsdom'
import { createServer } from 'vite'
import { docPageMeta } from '../demo/docPages.ts'
const routes = ['/', '/components', '/docs/getting-started', '/docs/theming', '/docs/components', '/docs/hooks', '/docs/css-utilities']

test('every application route ships its own metadata and visible content without JavaScript', () => {
  const titles = new Set()
  for (const route of routes) {
    const html = readFileSync(`dist${route === '/' ? '' : route}/index.html`, 'utf8')
    const doc = new JSDOM(html).window.document
    assert.equal(doc.querySelectorAll('title').length, 1, route)
    assert.equal(doc.querySelectorAll('link[rel="canonical"]').length, 1, route)
    assert.equal(doc.querySelector('link[rel="canonical"]').href, `https://ui.n3wth.com${route}`)
    assert.ok(doc.querySelector('#root h1')?.textContent.trim(), route)
    assert.ok(doc.querySelector('meta[name="description"]')?.content, route)
    assert.equal(doc.querySelectorAll('meta[name="description"]').length, 1, route)
    titles.add(doc.title)
  }
  assert.equal(titles.size, routes.length)
  const theming = new JSDOM(readFileSync('dist/docs/theming/index.html', 'utf8')).window.document
  assert.equal(theming.title, 'Theming | @n3wth/ui')
  assert.match(theming.querySelector('article').textContent, /N3wthProvider/)
})

test('unknown docs are not silently rendered as Getting Started', () => {
  assert.match(readFileSync('dist/404.html', 'utf8'), /Page not found/)
  assert.match(readFileSync('public/_redirects', 'utf8'), /^\/docs https:\/\/docs\.n3wth\.com\/ui\/quickstart \d+$/m)
  assert.match(readFileSync('dist/404.html', 'utf8'), /noindex,nofollow/)
})

test('sitemap lists the same complete public route set', () => {
  const doc = new JSDOM(readFileSync('dist/sitemap.xml', 'utf8'), { contentType: 'text/xml' }).window.document
  assert.deepEqual([...doc.querySelectorAll('loc')].map(item => item.textContent), routes.map(route => `https://ui.n3wth.com${route}`))
})

test('published documentation keeps its catalog metadata, OG assets and navigation order', () => {
  for (const [index, page] of docPageMeta.entries()) {
    const doc = new JSDOM(readFileSync(`dist/docs/${page.slug}/index.html`, 'utf8')).window.document
    assert.equal(doc.title, `${page.title} | @n3wth/ui`)
    assert.equal(doc.querySelector('meta[name="description"]').content, page.description)
    assert.equal(doc.querySelector('meta[property="og:image"]').content, `https://ui.n3wth.com/og/${page.slug}.png`)
    const neighbors = [docPageMeta[index - 1], docPageMeta[index + 1]].filter(Boolean)
    assert.deepEqual(
      [...doc.querySelectorAll('nav[aria-label="Documentation pages"] a')].map(link => link.getAttribute('href')),
      neighbors.map(neighbor => `/docs/${neighbor.slug}`),
    )
  }
})

test('public documentation index is generated completely, with existing labels and order', () => {
  const index = readFileSync('dist/llms.txt', 'utf8')
  assert.ok(!index.includes('{{DOCUMENTATION_INDEX}}'))
  const documentation = index.split('## Documentation\n\n')[1].split('\n\n## Source ownership')[0]
  assert.equal(documentation, [
    '- System overview: https://ui.n3wth.com/',
    '- Component examples and compatibility APIs: https://ui.n3wth.com/components',
    '- Workspace setup: https://ui.n3wth.com/docs/getting-started',
    '- Component boundaries: https://ui.n3wth.com/docs/components',
    '- Theme and typography: https://ui.n3wth.com/docs/theming',
    '- Behavior and hooks: https://ui.n3wth.com/docs/hooks',
    '- CSS integration: https://ui.n3wth.com/docs/css-utilities',
  ].join('\n'))
  assert.deepEqual(
    documentation.split('\n').map(line => new URL(line.split(': ')[1]).pathname).sort(),
    [...routes].sort(),
  )
})

test('Vite dev serves the complete index and imports only published documentation', async context => {
  const server = await createServer({
    configFile: resolve('vite.config.ts'),
    server: { host: '127.0.0.1', port: 0, open: false, watch: { ignored: ['**/*'] }, preTransformRequests: false },
    optimizeDeps: { noDiscovery: true, include: [] },
  })
  context.after(() => server.close())
  await server.listen()
  const origin = server.resolvedUrls.local[0]
  for (const path of ['llms.txt', 'llms.txt?catalog=1']) {
    const response = await fetch(new URL(path, origin))
    assert.equal(response.status, 200)
    assert.match(response.headers.get('content-type'), /text\/plain/)
    assert.equal(await response.text(), readFileSync('dist/llms.txt', 'utf8'))
  }
  const response = await fetch(new URL('@id/__x00__virtual:doc-content', origin))
  assert.equal(response.status, 200)
  const content = await response.text()
  const imports = [...content.matchAll(/import Doc\d+ from "[^"\n]*\/docs\/([^/"?]+)\.md(?:\?[^"\n]*)?"/g)]
  assert.deepEqual(imports.map(match => `/docs/${match[1]}`), routes.filter(route => route.startsWith('/docs/')))
  assert.doesNotMatch(content, /site-maintenance/)
})

test('browser output excludes unpublished maintenance content', () => {
  const scripts = readdirSync('dist/assets').filter(file => file.endsWith('.js'))
  assert.ok(scripts.length > 0)
  for (const file of scripts) {
    assert.doesNotMatch(readFileSync(`dist/assets/${file}`, 'utf8'), /site-maintenance\.md|The UI website lives in apps\/ui-docs\./, file)
  }
})
