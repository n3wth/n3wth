import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { appRootPath } from './cloudflare-preview.mjs'
import { createPreviewConfig, noindexWrapper, parseJsonc, previewIdentity, writePreviewConfig } from './cloudflare-preview-config.mjs'
import { siteUrls } from '../../packages/site-config/index.js'

const accountId = 'ac23513945eb49f73a89faf1be12384e'

test('active configs own domains, retired fixtures do not, and previews replace identities', () => {
  const sites = { portfolio: 'home', 'ui-docs': null, garden: 'garden', skills: 'skills', 'r3-web': null }
  for (const [app, site] of Object.entries(sites)) {
    const source = parseJsonc(readFileSync(join(appRootPath(fileURLToPath(new URL('../../', import.meta.url)), app), 'wrangler.jsonc'), 'utf8'))
    assert.equal(source.name, `n3wth-${app}`)
    assert.deepEqual(source.routes, site ? [{ pattern: new URL(siteUrls[site]).hostname, custom_domain: true }] : undefined)
    const original = structuredClone(source)
    const { config } = createPreviewConfig({
      source, sourcePath: join(appRootPath('/repo', app), 'wrangler.jsonc'), root: '/repo', app, pr: 23, accountId,
      previewBindings: { d1_databases: [{ binding: 'DB', database_id: 'preview-only' }] },
    })
    assert.equal(config.name, `n3wth-${app}-pr-23`)
    assert.notDeepEqual(config.routes, source.routes)
    if (app === 'garden') assert.equal(config.vars.TARGET_ORIGIN, 'https://portfolio-pr-23.preview.n3wth.com')
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

test('generates an built Worker config with absolute artifacts, noindex wrapper', () => {
  const sourcePath = '/repo/apps/skills/wrangler.jsonc'
  const { config, paths, originalMain } = createPreviewConfig({
    source: {
      main: 'dist/server/index.js',
      assets: { directory: 'dist/client', binding: 'ASSETS' },
      wasm_modules: { RESVG: 'dist/server/resvg.wasm' },
    },
    sourcePath,
    root: '/repo',
    app: 'skills',
    pr: 23,
    accountId,
  })
  assert.equal(originalMain, '/repo/apps/skills/dist/server/index.js')
  assert.equal(config.main, paths.wrapperPath)
  assert.equal(config.assets.directory, '/repo/apps/skills/dist/client')
  assert.equal(config.wasm_modules.RESVG, '/repo/apps/skills/dist/server/resvg.wasm')
  assert.deepEqual(config.routes, [{ pattern: 'skills-pr-23.preview.n3wth.com', custom_domain: true }])
  assert.match(noindexWrapper(originalMain), /X-Robots-Tag/)
})

test('asset-only configurations do not create a Worker wrapper', () => {
  const { config, originalMain } = createPreviewConfig({
    source: { assets: { directory: './dist' } },
    sourcePath: '/repo/apps/ui/wrangler.jsonc', root: '/repo', app: 'ui-docs', pr: 2, accountId,
  })
  assert.equal(config.main, undefined)
  assert.equal(originalMain, undefined)
  assert.equal(config.assets.directory, '/repo/apps/ui/dist')
})

test('rejects service bindings rather than inheriting production services', () => {
  assert.throws(() => createPreviewConfig({
    source: { main: './worker.js', services: [{ binding: 'SERVICE', service: 'production' }] },
    sourcePath: '/repo/apps/skills/wrangler.jsonc', root: '/repo', app: 'skills', pr: 2, accountId,
  }), /service bindings require explicit isolation/)
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
    vars: { RESEND_SEGMENT_ID: 'production-segment', RESEND_PREVIEW_SEGMENT_ID: 'preview-test-segment', RESEND_TOPIC_IDS: '{"home":"production-topic"}', RESEND_PREVIEW_TOPIC_ID: 'test-topic' },
    ratelimits: [{ name: 'SUBSCRIBE', namespace_id: 'n3wth-portfolio-subscribe', simple: { limit: 5, period: 60 } }],
  }
  const original = structuredClone(source)
  const { config } = createPreviewConfig({
    source, sourcePath: '/repo/apps/portfolio/wrangler.jsonc', root: '/repo', app: 'portfolio', pr: 8, accountId,
  })
  assert.deepEqual(source, original)
  assert.equal(config.ratelimits[0].name, 'SUBSCRIBE')
  assert.match(config.ratelimits[0].namespace_id, /^\d+$/)
  assert.notEqual(config.ratelimits[0].namespace_id, source.ratelimits[0].namespace_id)
  assert.equal(config.vars.RESEND_SEGMENT_ID, 'preview-test-segment')
  assert.equal(config.vars.RESEND_PREVIEW_SEGMENT_ID, undefined)
  assert.equal(config.vars.SUBSCRIBE_ENVIRONMENT, 'preview')
  assert.equal(config.vars.SUBSCRIBE_PREVIEW_PR, '8')
  assert.equal(JSON.parse(config.vars.RESEND_TOPIC_IDS).home, 'test-topic')
  assert.equal(config.vars.RESEND_PREVIEW_TOPIC_ID, undefined)
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
      ratelimits: [{ name: 'SUBSCRIBE', namespace_id: '92001', simple: { limit: 5, period: 60 } }],
      vars: { RESEND_SEGMENT_ID: 'explicit-test-segment' },
    },
  })
  assert.equal(config.ratelimits[0].namespace_id, '92001')
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

test('Vinext build defaults preserve isolation and bundle the preview wrapper', () => {
  const source = {
    main: './index.js', no_bundle: true,
    assets: { directory: '../client' },
    durable_objects: { bindings: [] }, queues: { producers: [], consumers: [] },
    d1_databases: [{ binding: 'DB', database_id: 'production-db' }],
  }
  const options = {
    source, sourcePath: '/repo/apps/skills/dist/server/wrangler.json',
    root: '/repo', app: 'skills', pr: 8, accountId,
  }
  assert.throws(() => createPreviewConfig(options), /d1_databases must use explicit/)
  const previewBindings = { d1_databases: [{ binding: 'DB', database_id: 'preview-db' }] }
  const { config, originalMain } = createPreviewConfig({ ...options, previewBindings })
  assert.equal(config.no_bundle, false)
  assert.equal(config.assets.directory, '/repo/apps/skills/dist/client')
  assert.equal(originalMain, '/repo/apps/skills/dist/server/index.js')
  assert.equal(config.d1_databases[0].database_id, 'preview-db')
  assert.equal(config.vars.BETTER_AUTH_URL, 'https://skills-pr-8.preview.n3wth.com')
  assert.throws(() => createPreviewConfig({
    ...options, previewBindings,
    source: { ...source, durable_objects: { bindings: [{ name: 'STATE', class_name: 'State' }] } },
  }), /durable_objects must use explicit/)
})
