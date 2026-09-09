import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import assert from 'node:assert/strict'
import { resolve, dirname } from 'node:path'
import { render, routes } from '../.prerender/entry-server.js'

const dist = resolve('dist')
assert.match(render('/docs/not-a-page').body, /Page not found/)
const template = readFileSync(resolve(dist, 'index.html'), 'utf8')
  .replace(/<title>[\s\S]*?<\/title>/g, '')
  .replace(/<meta\s+(?:name="(?:title|description|robots|twitter:[^"]+)"|property="og:[^"]+")[^>]*>/g, '')
  .replace(/<link rel="canonical"[^>]*>/g, '')
  .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '')

for (const path of [...routes, '/404']) {
  const { body, head } = render(path)
  const html = template.replace('</head>', () => `${head}\n</head>`)
    .replace(/<div id="root">[\s\S]*?<\/div>/, () => `<div id="root">${body}</div>`)
  const file = path === '/404' ? resolve(dist, '404.html') : resolve(dist, `.${path}`, 'index.html')
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, html)
}
writeFileSync(resolve(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(path => `<url><loc>https://ui.n3wth.com${path}</loc></url>`).join('')}</urlset>\n`)
console.log(`Prerendered ${routes.length} routes and 404 from the application.`)
rmSync(resolve('.prerender'), { recursive: true, force: true })
