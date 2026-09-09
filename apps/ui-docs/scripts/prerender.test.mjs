import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { JSDOM } from 'jsdom'
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
  const config = JSON.parse(readFileSync('vercel.json', 'utf8'))
  assert.equal(config.rewrites, undefined)
  assert.equal(config.redirects.find(item => item.source === '/docs').destination, '/docs/getting-started')
  assert.match(readFileSync('dist/404.html', 'utf8'), /noindex,nofollow/)
})

test('sitemap lists the same complete public route set', () => {
  const doc = new JSDOM(readFileSync('dist/sitemap.xml', 'utf8'), { contentType: 'text/xml' }).window.document
  assert.deepEqual([...doc.querySelectorAll('loc')].map(item => item.textContent), routes.map(route => `https://ui.n3wth.com${route}`))
})
