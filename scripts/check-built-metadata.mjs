import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
// Reuse the documentation workspace's declared HTML test parser.
const { JSDOM } = createRequire(join(root, 'apps/ui-docs/package.json'))('jsdom')
const applications = readdirSync(join(root, 'apps'), { withFileTypes: true })
  .filter(entry => entry.isDirectory()).map(entry => entry.name)
const files = directory => readdirSync(directory, { withFileTypes: true }).flatMap(entry =>
  entry.isDirectory() ? files(join(directory, entry.name)) : entry.name.endsWith('.html') ? [join(directory, entry.name)] : [])
const normalized = url => url.replace(/\/$/, '')

for (const app of applications) {
  const manifest = JSON.parse(readFileSync(join(root, 'apps', app, 'package.json'), 'utf8'))
  const output = join(root, 'apps', app, manifest.dependencies?.next ? '.next/server/app' : 'dist')
  let checked = 0
  for (const file of files(output)) {
    const label = `${app}/${relative(output, file)}`
    // Framework crash shells are not public content routes.
    if (file.endsWith('/_global-error.html')) continue
    const window = new JSDOM(readFileSync(file, 'utf8')).window
    try {
      const document = window.document
      for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
        assert.doesNotThrow(() => JSON.parse(script.textContent), `${label}: invalid structured data`)
      }
      if ([...document.querySelectorAll('meta[name="robots"]')].some(meta => /noindex/i.test(meta.content))) continue
      assert.equal(document.querySelectorAll('title').length, 1, `${label}: title count`)
      assert.ok(document.title.trim(), `${label}: empty title`)
      const canonical = document.querySelectorAll('link[rel="canonical"]')
      assert.equal(canonical.length, 1, `${label}: canonical count`)
      assert.match(canonical[0].href, /^https:\/\//, `${label}: absolute canonical`)
      for (const field of ['description', 'og:title', 'og:description', 'og:url', 'og:type', 'og:image', 'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) {
        const tags = document.querySelectorAll(`meta[name="${field}"],meta[property="${field}"]`)
        // Multiple OG images are valid; every value must still be usable.
        assert.ok(tags.length, `${label}: missing ${field}`)
        if (!field.endsWith(':image')) assert.equal(tags.length, 1, `${label}: duplicate ${field}`)
        for (const tag of tags) assert.ok(tag.content.trim(), `${label}: empty ${field}`)
      }
      assert.equal(normalized(document.querySelector('meta[property="og:url"]').content), normalized(canonical[0].href), `${label}: canonical/social URL mismatch`)
      checked++
    } finally {
      window.close()
    }
  }
  assert.ok(checked, `${app}: no public HTML checked; build the application first`)
  console.log(`${app}: ${checked} public HTML documents have complete core and social metadata`)
}
