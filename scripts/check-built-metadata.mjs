import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const normalized = url => url.replace(/\/$/, '')

export function parseApplicationScope(args = process.argv.slice(2), env = process.env) {
  const workspacesIndex = args.indexOf('--workspaces')
  if (workspacesIndex >= 0) {
    const value = args[workspacesIndex + 1]
    return !value || value.startsWith('--') ? [] : JSON.parse(value)
  }
  const appsIndex = args.indexOf('--apps')
  if (appsIndex >= 0) {
    const value = args[appsIndex + 1]
    if (!value || value.startsWith('--')) return []
    return value.split(',').flatMap(part => {
      const name = part.trim()
      if (!name) return []
      return [name.startsWith('@') ? name : `@n3wth/${name}`]
    })
  }
  if (env.AFFECTED_WORKSPACES) return JSON.parse(env.AFFECTED_WORKSPACES)
  return undefined
}

export function listApplications(root) {
  return readdirSync(join(root, 'apps'), { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => {
      const manifest = JSON.parse(readFileSync(join(root, 'apps', entry.name, 'package.json'), 'utf8'))
      return { directory: entry.name, name: manifest.name, next: Boolean(manifest.dependencies?.next) }
    })
}

export function selectApplications(applications, scope) {
  if (scope === undefined) return applications
  const wanted = new Set(scope)
  return applications.filter(app => wanted.has(app.name) || wanted.has(app.directory))
}

function htmlFiles(directory) {
  if (!existsSync(directory)) return []
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? htmlFiles(path) : entry.name.endsWith('.html') ? [path] : []
  })
}

function loadJsdom(root) {
  // Reuse the documentation workspace's declared HTML test parser.
  const { JSDOM } = createRequire(join(root, 'apps/ui-docs/package.json'))('jsdom')
  return JSDOM
}

export function checkPublicDocument(document, label) {
  for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
    assert.doesNotThrow(() => JSON.parse(script.textContent), `${label}: invalid structured data`)
  }
  if ([...document.querySelectorAll('meta[name="robots"]')].some(meta => /noindex/i.test(meta.content))) return false
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
  return true
}

export function checkBuiltMetadata(root, options = {}) {
  const scope = Object.hasOwn(options, 'scope') ? options.scope : parseApplicationScope()
  const log = options.log ?? (message => console.log(message))
  const applications = selectApplications(listApplications(root), scope)
  if (!applications.length) {
    log('no built applications in scope')
    return []
  }
  let JSDOM
  const results = []
  for (const app of applications) {
    if (app.directory === 'garden') {
      log('garden: redirect Worker has no public HTML')
      continue
    }
    const output = join(root, 'apps', app.directory, app.next ? '.next/server/app' : 'dist')
    let checked = 0
    for (const file of htmlFiles(output)) {
      const label = `${app.directory}/${relative(output, file)}`
      // Framework crash shells are not public content routes.
      if (file.endsWith('/_global-error.html')) continue
      JSDOM ??= loadJsdom(root)
      const window = new JSDOM(readFileSync(file, 'utf8')).window
      try {
        if (checkPublicDocument(window.document, label)) checked++
      } finally {
        window.close()
      }
    }
    assert.ok(checked, `${app.directory}: no public HTML checked; build the application first`)
    log(`${app.directory}: ${checked} public HTML documents have complete core and social metadata`)
    results.push({ directory: app.directory, checked })
  }
  return results
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  checkBuiltMetadata(fileURLToPath(new URL('../', import.meta.url)))
}
