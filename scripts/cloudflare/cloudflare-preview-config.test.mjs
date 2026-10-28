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
  const sites = { portfolio: ['home', 'skills'], 'ui-docs': null, garden: ['garden'], 'r3-web': null }
  for (const [app, domains] of Object.entries(sites)) {
    const source = parseJsonc(readFileSync(join(appRootPath(fileURLToPath(new URL('../../', import.meta.url)), app), 'wrangler.jsonc'), 'utf8'))
    assert.equal(source.name, `n3wth-${app}`)
    assert.deepEqual(source.routes, domains?.map(site => ({ pattern: new URL(siteUrls[site]).hostname, custom_domain: true })))
    const original = structuredClone(source)
    const { config } = createPreviewConfig({
      source, sourcePath: join(appRootPath('/repo', app), 'wrangler.jsonc'), root: '/repo', app, pr: 23, accountId,
      previewBindings: { d1_databases: [{ binding: 'DB', database_id: 'preview-only' }] },
    })
    assert.equal(config.name, `n3wth-${app}-pr-23`)
    assert.notDeepEqual(config.routes, source.routes)
    assert.deepEqual(config.routes, [{ pattern: `${app}-pr-23.preview.n3wth.com`, custom_domain: true }])
    if (app === 'portfolio') {
      assert.ok(source.compatibility_flags.includes('enable_request_signal'))
      assert.ok(config.compatibility_flags.includes('enable_request_signal'))
    }
    if (app === 'garden') assert.equal(config.vars.TARGET_ORIGIN, 'https://portfolio-pr-23.preview.n3wth.com')
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

test('rejects production resource collisions, cross-binding aliases and missing identities', () => {
  for (const [type, field] of Object.entries({ d1_databases: 'database_id', r2_buckets: 'bucket_name', kv_namespaces: 'id', vectorize: 'index_name' })) {
    const source = { main: './worker.js', [type]: [{ binding: 'A', [field]: 'production-a' }, { binding: 'B', [field]: 'production-b' }] }
    const options = { source, sourcePath: '/repo/apps/portfolio/wrangler.jsonc', root: '/repo', app: 'portfolio', pr: 3, accountId }
    const overrides = replacements => ({ [type]: replacements })
    assert.throws(() => createPreviewConfig({ ...options, previewBindings: overrides([{ binding: 'A', [field]: 'PRODUCTION-B' }, { binding: 'B', [field]: 'preview-b' }]) }), /distinct explicit preview resource identities/)
    assert.throws(() => createPreviewConfig({ ...options, previewBindings: overrides([{ binding: 'A' }, { binding: 'B', [field]: 'preview-b' }]) }), /distinct explicit preview resource identities/)
    assert.throws(() => createPreviewConfig({ ...options, previewBindings: overrides([{ binding: 'A', [field]: 'preview-a' }, { binding: 'A', [field]: 'preview-b' }]) }), /matching unique binding names/)
    const { config } = createPreviewConfig({ ...options, previewBindings: overrides([{ binding: 'A', [field]: 'preview-a', preview_id: 'production-a' }, { binding: 'B', [field]: 'preview-b' }]) })
    assert.equal(config[type][0][field], 'preview-a')
    assert.equal(config[type][0].preview_id, undefined)
  }
})

test('rejects AI Search and unsupported stateful capabilities even with overrides', () => {
  for (const [type, value] of Object.entries({
    ai_search: [{ binding: 'SEARCH', instance_name: 'n3wth-com' }],
    ai_search_namespaces: [{ binding: 'SEARCH', namespace: 'default' }],
    hyperdrive: [{ binding: 'DB', id: 'production' }],
    mtls_certificates: [{ binding: 'CERT', certificate_id: 'production' }],
    durable_objects: { bindings: [{ name: 'STATE', class_name: 'State' }] },
    queues: { producers: [{ binding: 'QUEUE', queue: 'production' }] },
  })) {
    const options = { source: { main: './worker.js', [type]: value }, sourcePath: '/repo/apps/portfolio/wrangler.jsonc', root: '/repo', app: 'portfolio', pr: 3, accountId }
    assert.throws(() => createPreviewConfig({ ...options, previewBindings: { [type]: value } }), /verified isolation and are not supported/)
  }
  assert.throws(() => createPreviewConfig({ source: { main: './worker.js', ai_search: null }, sourcePath: '/repo/apps/portfolio/wrangler.jsonc', root: '/repo', app: 'portfolio', pr: 3, accountId }), /verified isolation/)
})

test('rejects unsupported capabilities while accepting empty generated defaults', () => {
  const arrays = ['analytics_engine_datasets', 'pipelines', 'workflows', 'secrets_store_secrets', 'dispatch_namespaces', 'vpc_services', 'send_email', 'containers', 'tail_consumers', 'agent_memory', 'artifacts', 'flagship', 'worker_loaders', 'vpc_networks', 'connect', 'streaming_tail_consumers', 'k2', 'migrations']
  const objects = ['ai', 'browser', 'images', 'unsafe', 'logfwdr', 'media', 'stream', 'analytics', 'cloudchamber', 'exports']
  const options = { sourcePath: '/repo/apps/portfolio/wrangler.jsonc', root: '/repo', app: 'portfolio', pr: 3, accountId }
  for (const type of arrays) {
    assert.throws(() => createPreviewConfig({ ...options, source: { main: './worker.js', [type]: [{ binding: 'PRODUCTION' }] } }), /verified isolation/)
  }
  for (const type of objects) {
    assert.throws(() => createPreviewConfig({ ...options, source: { main: './worker.js', [type]: { binding: 'PRODUCTION' } } }), /verified isolation/)
  }
  const source = { main: './worker.js', ...Object.fromEntries(arrays.map(type => [type, []])), ...Object.fromEntries(objects.map(type => [type, {}])), logfwdr: { bindings: [] } }
  assert.doesNotThrow(() => createPreviewConfig({ ...options, source }))
})

test('rejects nonempty object-shaped stateful bindings even with a misleading length', () => {
  const options = { sourcePath: '/repo/apps/portfolio/wrangler.jsonc', root: '/repo', app: 'portfolio', pr: 3, accountId }
  for (const [type, value] of Object.entries({ durable_objects: { length: 0, bindings: [{ name: 'DB', class_name: 'State' }] }, queues: { length: 0, producers: [{ binding: 'QUEUE', queue: 'production' }] } })) {
    assert.throws(() => createPreviewConfig({ ...options, source: { main: './worker.js', [type]: value } }), /verified isolation/)
  }
})

test('removes production event triggers from previews', () => {
  const source = { main: './worker.js', triggers: { crons: ['* * * * *'] } }
  const { config } = createPreviewConfig({ source, sourcePath: '/repo/apps/portfolio/wrangler.jsonc', root: '/repo', app: 'portfolio', pr: 3, accountId })
  assert.equal(config.triggers, undefined)
  assert.deepEqual(source.triggers, { crons: ['* * * * *'] })
})

test('rejects missing production identity and matching production D1 names', () => {
  const options = { sourcePath: '/repo/apps/portfolio/wrangler.jsonc', root: '/repo', app: 'portfolio', pr: 3, accountId }
  assert.throws(() => createPreviewConfig({ ...options, source: { main: './worker.js', d1_databases: [{ binding: 'DB', database_name: 'production' }] }, previewBindings: { d1_databases: [{ binding: 'DB', database_id: 'preview' }] } }), /distinct explicit preview resource identities/)
  assert.throws(() => createPreviewConfig({ ...options, source: { main: './worker.js', d1_databases: [{ binding: 'DB', database_id: 'production-id', database_name: 'production' }] }, previewBindings: { d1_databases: [{ binding: 'DB', database_id: 'preview-id', database_name: 'PRODUCTION' }] } }), /distinct preview database names/)
})

test('omits the portfolio newsletter rate limiter and disables newsletter configuration', () => {
  const source = {
    main: './worker.ts',
    vars: { RESEND_SEGMENT_ID: 'production-segment', RESEND_PREVIEW_SEGMENT_ID: 'preview-test-segment', RESEND_TOPIC_IDS: '{"home":"production-topic"}', RESEND_PREVIEW_TOPIC_ID: 'test-topic' },
    ratelimits: [{ name: 'SUBSCRIBE', namespace_id: '100', simple: { limit: 5, period: 60 } }],
  }
  const original = structuredClone(source)
  const { config } = createPreviewConfig({
    source, sourcePath: '/repo/apps/portfolio/wrangler.jsonc', root: '/repo', app: 'portfolio', pr: 8, accountId,
  })
  assert.deepEqual(source, original)
  assert.deepEqual(config.ratelimits, [])
  assert.equal(config.vars.RESEND_SEGMENT_ID, undefined)
  assert.equal(config.vars.RESEND_PREVIEW_SEGMENT_ID, undefined)
  assert.equal(config.vars.SUBSCRIBE_ENVIRONMENT, 'preview')
  assert.equal(config.vars.SUBSCRIBE_PREVIEW_PR, '8')
  assert.equal(config.vars.RESEND_TOPIC_IDS, undefined)
  assert.equal(config.vars.RESEND_PREVIEW_TOPIC_ID, undefined)
})

test('portfolio previews disable newsletter without relying on a rate-limit binding', () => {
  const { config } = createPreviewConfig({
    source: {
      main: './worker.ts',
      vars: { RESEND_SEGMENT_ID: 'production-segment' },
    },
    sourcePath: '/repo/apps/portfolio/wrangler.jsonc', root: '/repo', app: 'portfolio', pr: 9, accountId,
    previewBindings: {
      vars: { RESEND_SEGMENT_ID: 'explicit-test-segment' },
    },
  })
  assert.equal(config.vars.RESEND_SEGMENT_ID, undefined)
  assert.equal(config.vars.SUBSCRIBE_ENVIRONMENT, 'preview')
  assert.equal(config.vars.SUBSCRIBE_PREVIEW_PR, '9')
})

test('rejects preview rate-limit identifiers shared across bindings or production', () => {
  const source = { main: './worker.ts', ratelimits: [{ name: 'A', namespace_id: '1', simple: { limit: 10, period: 60 } }, { name: 'B', namespace_id: '2', simple: { limit: 10, period: 60 } }] }
  const options = { source, sourcePath: '/repo/apps/garden/wrangler.jsonc', root: '/repo', app: 'garden', pr: 9, accountId }
  for (const ids of [['10', '010'], ['001', '11'], ['0', '11']]) {
    const ratelimits = ids.map((namespace_id, index) => ({ name: index ? 'B' : 'A', namespace_id, simple: { limit: 10, period: 60 } }))
    assert.throws(() => createPreviewConfig({ ...options, previewBindings: { ratelimits } }), /isolated numeric namespace IDs/)
  }
})

test('requires explicit rate-limit bindings and cannot restore the omitted newsletter limiter', () => {
  const limiter = { name: 'SUBSCRIBE', namespace_id: '100', simple: { limit: 5, period: 60 } }
  const options = { source: { main: './worker.ts', ratelimits: [limiter] }, sourcePath: '/repo/apps/portfolio/wrangler.jsonc', root: '/repo', app: 'portfolio', pr: 64036, accountId }
  for (const pr of [64036, 65765]) assert.deepEqual(createPreviewConfig({ ...options, pr }).config.ratelimits, [])
  assert.throws(() => createPreviewConfig({ ...options, previewBindings: { ratelimits: [{ ...limiter, namespace_id: '101' }] } }), /matching unique binding names/)
  const other = { ...options, app: 'garden', source: { main: './worker.ts', ratelimits: [{ ...limiter, name: 'OTHER' }] } }
  assert.throws(() => createPreviewConfig(other), /explicit isolated bindings/)
  assert.equal(createPreviewConfig({ ...other, previewBindings: { ratelimits: [{ ...limiter, name: 'OTHER', namespace_id: '101' }] } }).config.ratelimits[0].namespace_id, '101')
  assert.throws(() => createPreviewConfig({ ...other, previewBindings: { ratelimits: [{ ...limiter, binding: 'OTHER', namespace_id: '101' }] } }), /valid binding objects/)
  assert.throws(() => createPreviewConfig({ ...options, source: { main: './worker.ts', ratelimits: [{ ...limiter, binding: 'OTHER' }] } }), /valid binding objects/)
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

test('Worker build defaults preserve isolation and bundle the preview wrapper', () => {
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
  assert.throws(() => createPreviewConfig({
    ...options, previewBindings,
    source: { ...source, durable_objects: { bindings: [{ name: 'STATE', class_name: 'State' }] } },
  }), /durable_objects preview bindings require verified isolation/)
})
