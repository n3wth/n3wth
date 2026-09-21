import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createPreviewConfig, noindexWrapper, parseJsonc, previewIdentity, writePreviewConfig } from './cloudflare-preview-config.mjs'
import { siteUrls } from '../packages/site-config/index.js'

const accountId = 'ac23513945eb49f73a89faf1be12384e'

test('each production config has its canonical domain and preview replaces its identity', () => {
  const sites = { portfolio: 'home', 'ui-docs': 'ui', garden: 'garden', skills: 'skills', 'r3-web': 'r3' }
  for (const [app, site] of Object.entries(sites)) {
    const source = parseJsonc(readFileSync(new URL(`../apps/${app}/wrangler.jsonc`, import.meta.url), 'utf8'))
    assert.equal(source.name, `n3wth-${app}`)
    assert.deepEqual(source.routes, [{ pattern: new URL(siteUrls[site]).hostname, custom_domain: true }])
    if (source.services) assert.equal(source.services[0].service, source.name)
    const original = structuredClone(source)
    const { config } = createPreviewConfig({
      source, sourcePath: `/repo/apps/${app}/wrangler.jsonc`, root: '/repo', app, pr: 23, accountId,
      previewBindings: { d1_databases: [{ binding: 'DB', database_id: 'preview-only' }] },
    })
    assert.equal(config.name, `n3wth-${app}-pr-23`)
    assert.notDeepEqual(config.routes, source.routes)
    if (app === 'skills') {
      assert.equal(config.vars.BETTER_AUTH_URL, 'https://skills-pr-23.preview.n3wth.com')
      assert.equal(config.d1_databases[0].database_id, 'preview-only')
    }
    assert.deepEqual(source, original)
  }
})

test('supports only fixed app slugs and deterministic identities', () => {
  assert.deepEqual(previewIdentity('skills', 23), { workerName: 'n3wth-skills-pr-23', host: 'skills-pr-23.preview.n3wth.com' })
  assert.throws(() => previewIdentity('production', 23))
  assert.throws(() => previewIdentity('skills', 0))
})

test('parses JSONC without changing comment-like or comma-like string content', () => {
  assert.deepEqual(parseJsonc('{ /* comment */ "url": "https://example.test/,}", "items": [1,], }'), {
    url: 'https://example.test/,}', items: [1],
  })
})

test('generates an OpenNext config with absolute artifacts, PR self binding, and noindex wrapper', () => {
  const sourcePath = '/repo/apps/skills/wrangler.jsonc'
  const { config, paths, originalMain } = createPreviewConfig({
    source: {
      main: '.open-next/worker.js',
      assets: { directory: '.open-next/assets', binding: 'ASSETS' },
      wasm_modules: { RESVG: '.open-next/resvg.wasm' },
      services: [{ binding: 'WORKER_SELF_REFERENCE', service: 'n3wth-skills-preview' }],
    },
    sourcePath,
    root: '/repo',
    app: 'skills',
    pr: 23,
    accountId,
  })
  assert.equal(originalMain, '/repo/apps/skills/.open-next/worker.js')
  assert.equal(config.main, paths.wrapperPath)
  assert.equal(config.assets.directory, '/repo/apps/skills/.open-next/assets')
  assert.equal(config.wasm_modules.RESVG, '/repo/apps/skills/.open-next/resvg.wasm')
  assert.equal(config.services[0].service, 'n3wth-skills-pr-23')
  assert.deepEqual(config.routes, [{ pattern: 'skills-pr-23.preview.n3wth.com', custom_domain: true }])
  assert.match(noindexWrapper(originalMain), /X-Robots-Tag/)
})

test('keeps ui-docs static and does not create a Worker wrapper', () => {
  const { config, originalMain } = createPreviewConfig({
    source: { assets: { directory: './dist' } },
    sourcePath: '/repo/apps/ui-docs/wrangler.jsonc', root: '/repo', app: 'ui-docs', pr: 2, accountId,
  })
  assert.equal(config.main, undefined)
  assert.equal(originalMain, undefined)
  assert.equal(config.assets.directory, '/repo/apps/ui-docs/dist')
})

test('rejects production stateful bindings unless explicit per-preview replacements exist', () => {
  const input = {
    source: { main: './worker.js', d1_databases: [{ binding: 'DB', database_id: 'production' }], r2_buckets: [{ binding: 'FILES', bucket_name: 'production-files' }], kv_namespaces: [{ binding: 'CACHE', id: 'production-kv' }] },
    sourcePath: '/repo/apps/skills/wrangler.jsonc', root: '/repo', app: 'skills', pr: 3, accountId,
  }
  assert.throws(() => createPreviewConfig(input), /d1_databases must use explicit per-preview bindings/)
  const { config } = createPreviewConfig({ ...input, previewBindings: {
    d1_databases: [{ binding: 'DB', database_id: 'preview' }],
    r2_buckets: [{ binding: 'FILES', bucket_name: 'preview-files' }],
    kv_namespaces: [{ binding: 'CACHE', id: 'preview-kv' }],
  } })
  assert.equal(config.d1_databases[0].database_id, 'preview')
  assert.equal(config.r2_buckets[0].bucket_name, 'preview-files')
  assert.equal(config.kv_namespaces[0].id, 'preview-kv')
})

test('isolates portfolio subscribe rate limits and uses the preview test segment', () => {
  const source = {
    main: './worker.ts',
    vars: { RESEND_SEGMENT_ID: 'production-segment', RESEND_PREVIEW_SEGMENT_ID: 'preview-test-segment' },
    ratelimits: [{ name: 'SUBSCRIBE', namespace_id: 'n3wth-portfolio-subscribe', simple: { limit: 5, period: 60 } }],
  }
  const original = structuredClone(source)
  const { config } = createPreviewConfig({
    source, sourcePath: '/repo/apps/portfolio/wrangler.jsonc', root: '/repo', app: 'portfolio', pr: 8, accountId,
  })
  assert.deepEqual(source, original)
  assert.equal(config.ratelimits[0].name, 'SUBSCRIBE')
  assert.equal(config.ratelimits[0].namespace_id, 'n3wth-portfolio-pr-8-SUBSCRIBE')
  assert.notEqual(config.ratelimits[0].namespace_id, source.ratelimits[0].namespace_id)
  assert.equal(config.vars.RESEND_SEGMENT_ID, 'preview-test-segment')
  assert.equal(config.vars.RESEND_PREVIEW_SEGMENT_ID, undefined)
})

test('explicit preview subscribe bindings win over production values', () => {
  const { config } = createPreviewConfig({
    source: {
      main: './worker.ts',
      vars: { RESEND_SEGMENT_ID: 'production-segment' },
      ratelimits: [{ name: 'SUBSCRIBE', namespace_id: 'production', simple: { limit: 5, period: 60 } }],
    },
    sourcePath: '/repo/apps/portfolio/wrangler.jsonc', root: '/repo', app: 'portfolio', pr: 9, accountId,
    previewBindings: {
      ratelimits: [{ name: 'SUBSCRIBE', namespace_id: 'explicit-preview', simple: { limit: 5, period: 60 } }],
      vars: { RESEND_SEGMENT_ID: 'explicit-test-segment' },
    },
  })
  assert.equal(config.ratelimits[0].namespace_id, 'explicit-preview')
  assert.equal(config.vars.RESEND_SEGMENT_ID, 'explicit-test-segment')
})

test('writes only generated config and wrapper artifacts', t => {
  const root = mkdtempSync(join(tmpdir(), 'cloudflare-preview-config-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const sourcePath = join(root, 'apps', 'portfolio', 'wrangler.jsonc')
  const sourceDirectory = join(root, 'apps', 'portfolio')
  mkdirSync(sourceDirectory, { recursive: true })
  writeFileSync(sourcePath, '{ "main": "./worker.ts", "assets": { "directory": "./dist" } }')
  const output = writePreviewConfig({ root, app: 'portfolio', pr: 4, sourcePath, accountId })
  assert.equal(JSON.parse(readFileSync(output.paths.configPath, 'utf8')).main, output.paths.wrapperPath)
  assert.match(readFileSync(output.paths.wrapperPath, 'utf8'), /worker\.ts/)
  assert.equal(readFileSync(sourcePath, 'utf8'), '{ "main": "./worker.ts", "assets": { "directory": "./dist" } }')
})
