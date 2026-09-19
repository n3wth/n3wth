import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  parseApplicationScope,
  listApplications,
  selectApplications,
  checkPublicDocument,
  checkBuiltMetadata,
} from './check-built-metadata.mjs'

const repo = fileURLToPath(new URL('../', import.meta.url))

function fixture(setup) {
  const root = mkdtempSync(join(tmpdir(), 'n3wth-metadata-'))
  mkdirSync(join(root, 'apps'))
  setup(root)
  return root
}

function writeApp(root, directory, name, extra = {}) {
  mkdirSync(join(root, 'apps', directory), { recursive: true })
  writeFileSync(join(root, 'apps', directory, 'package.json'), JSON.stringify({
    name,
    dependencies: extra.next ? { next: '16.2.9' } : {},
  }))
}

function fakeDocument({ title = 'Page', canonical = 'https://n3wth.com/', robots, jsonLd = ['{}'], meta = {} } = {}) {
  const fields = {
    description: ['A page'],
    'og:title': [title],
    'og:description': ['A page'],
    'og:url': [canonical],
    'og:type': ['website'],
    'og:image': ['https://n3wth.com/og.png'],
    'twitter:card': ['summary_large_image'],
    'twitter:title': [title],
    'twitter:description': ['A page'],
    'twitter:image': ['https://n3wth.com/og.png'],
    ...meta,
  }
  return {
    title,
    querySelectorAll(selector) {
      if (selector === 'script[type="application/ld+json"]') {
        return jsonLd.map(textContent => ({ textContent }))
      }
      if (selector === 'meta[name="robots"]') return robots ? [{ content: robots }] : []
      if (selector === 'title') return title == null ? [] : [{ textContent: title }]
      if (selector === 'link[rel="canonical"]') return canonical ? [{ href: canonical }] : []
      const field = /meta\[(?:name|property)="([^"]+)"\]/.exec(selector)?.[1]
      return (fields[field] ?? []).map(content => ({ content }))
    },
    querySelector(selector) {
      return this.querySelectorAll(selector)[0] ?? null
    },
  }
}

test('CLI --workspaces JSON selects the named packages including non-apps', () => {
  assert.deepEqual(
    parseApplicationScope(['--workspaces', JSON.stringify(['@n3wth/kit', '@n3wth/ui'])]),
    ['@n3wth/kit', '@n3wth/ui'],
  )
})

test('CLI --apps accepts directory names and workspace names', () => {
  assert.deepEqual(
    parseApplicationScope(['--apps', 'kit,@n3wth/portfolio']),
    ['@n3wth/kit', '@n3wth/portfolio'],
  )
})

test('AFFECTED_WORKSPACES env is used when no CLI scope is given', () => {
  assert.deepEqual(
    parseApplicationScope([], { AFFECTED_WORKSPACES: JSON.stringify(['@n3wth/garden']) }),
    ['@n3wth/garden'],
  )
})

test('CLI scope wins over AFFECTED_WORKSPACES', () => {
  assert.deepEqual(
    parseApplicationScope(['--apps', 'kit'], { AFFECTED_WORKSPACES: JSON.stringify(['@n3wth/garden']) }),
    ['@n3wth/kit'],
  )
})

test('missing scope means every application, empty JSON means none', () => {
  assert.equal(parseApplicationScope([], {}), undefined)
  assert.deepEqual(parseApplicationScope(['--workspaces', '[]'], {}), [])
  assert.deepEqual(parseApplicationScope([], { AFFECTED_WORKSPACES: '[]' }), [])
})

test('selectApplications ignores packages and unknown names', () => {
  const apps = [
    { directory: 'kit', name: '@n3wth/kit' },
    { directory: 'garden', name: '@n3wth/garden' },
  ]
  assert.deepEqual(
    selectApplications(apps, ['@n3wth/ui', '@n3wth/kit', 'unrelated']),
    [{ directory: 'kit', name: '@n3wth/kit' }],
  )
})

test('selectApplications keeps every app when scope is omitted', () => {
  const apps = [
    { directory: 'kit', name: '@n3wth/kit' },
    { directory: 'garden', name: '@n3wth/garden' },
  ]
  assert.equal(selectApplications(apps, undefined).length, 2)
})

test('listApplications reads workspace names from app manifests', () => {
  const root = fixture(root => {
    writeApp(root, 'kit', '@n3wth/kit', { next: true })
    writeApp(root, 'portfolio', '@n3wth/portfolio')
  })
  try {
    assert.deepEqual(
      listApplications(root).toSorted((left, right) => left.directory.localeCompare(right.directory)),
      [
        { directory: 'kit', name: '@n3wth/kit', next: true },
        { directory: 'portfolio', name: '@n3wth/portfolio', next: false },
      ],
    )
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('package-only affected scope does not require HTML output', () => {
  const root = fixture(root => writeApp(root, 'kit', '@n3wth/kit', { next: true }))
  try {
    const messages = []
    assert.deepEqual(checkBuiltMetadata(root, { scope: ['@n3wth/ui'], log: message => messages.push(message) }), [])
    assert.match(messages.join('\n'), /no built applications in scope/)
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('scoped app without a build fails with a build-first message', () => {
  const root = fixture(root => writeApp(root, 'kit', '@n3wth/kit', { next: true }))
  try {
    assert.throws(
      () => checkBuiltMetadata(root, { scope: ['@n3wth/kit'] }),
      /kit: no public HTML checked; build the application first/,
    )
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('checkPublicDocument skips noindex pages and accepts complete metadata', () => {
  assert.equal(checkPublicDocument(fakeDocument({ robots: 'noindex' }), 'kit/hidden.html'), false)
  assert.equal(checkPublicDocument(fakeDocument(), 'kit/index.html'), true)
})

test('checkPublicDocument rejects missing canonical or mismatched social URL', () => {
  assert.throws(
    () => checkPublicDocument(fakeDocument({ canonical: '' }), 'kit/index.html'),
    /canonical count/,
  )
  assert.throws(
    () => checkPublicDocument(fakeDocument({ canonical: 'https://n3wth.com/page', meta: { 'og:url': ['https://n3wth.com/other'] } }), 'kit/index.html'),
    /canonical\/social URL mismatch/,
  )
})

test('current repository still lists every site application', () => {
  const names = listApplications(repo).map(app => app.directory).toSorted()
  assert.deepEqual(names, ['garden', 'portfolio', 'r3-web', 'skills', 'ui-docs'])
})
