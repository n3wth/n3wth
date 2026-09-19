import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  cloudflareApi,
  deployPreview,
  deletePreview,
  injectPreviewHeaders,
  isMissingWorkerResult,
  parseCliArgs,
  parseJsonc,
  previewIdentity,
  runWrangler,
  stagePreviewAssets,
} from './cloudflare-preview.mjs'
import { createPreviewConfig } from './cloudflare-preview-config.mjs'
import { checkPreviewOnce, classifyFetchError, verifyPreviewReadiness } from './cloudflare-preview-verify.mjs'

const accountId = 'ac23513945eb49f73a89faf1be12384e'

test('accepts only the supported action, app, and positive PR syntax', () => {
  assert.deepEqual(parseCliArgs(['config', '--app', 'ui-docs', '--pr', '12']), { action: 'config', app: 'ui-docs', pr: 12 })
  assert.deepEqual(parseCliArgs(['deploy', '--app', 'skills', '--pr', '5', '--bindings-json', '{"d1_databases":[]}']), {
    action: 'deploy', app: 'skills', pr: 5, bindings: { d1_databases: [] },
  })
  for (const args of [
    ['deploy', '--app', 'production', '--pr', '1'],
    ['deploy', '--app', 'ui-docs', '--pr', '0'],
    ['deploy', '--app', 'ui-docs', '--pr', '-1'],
    ['deploy', '--app', 'ui-docs', '--pr', '1.5'],
    ['deploy', '--app', 'ui-docs', '--pr', '9007199254740992'],
    ['deploy', '--app', 'ui-docs', '--pr', '1', '--name', 'production'],
    ['deploy', '--app', 'garden', '--pr', '1', '--bindings-json', 'not-json'],
    ['deploy', '--app', 'garden', '--pr', '1', '--bindings-json', '[1]'],
    ['config', '--app', 'garden', '--pr', '2', '--bindings-json', '{}', '--bindings-json', '{}'],
  ]) assert.throws(() => parseCliArgs(args))
})

test('preview identity is stable and scoped to the fixed app', () => {
  assert.deepEqual(previewIdentity('ui-docs', 42), {
    workerName: 'n3wth-ui-docs-pr-42',
    host: 'ui-docs-pr-42.preview.n3wth.com',
  })
  assert.deepEqual(previewIdentity('portfolio', 9), {
    workerName: 'n3wth-portfolio-pr-9',
    host: 'portfolio-pr-9.preview.n3wth.com',
  })
  assert.throws(() => previewIdentity('ui-docs', 0))
  assert.throws(() => previewIdentity('anything', 42))
})

test('reads JSONC and generates an exact static custom-domain config without source mutation', () => {
  const sourcePath = '/repo/apps/ui-docs/wrangler.jsonc'
  const source = parseJsonc('{\n // comment\n "name": "source",\n "main": "./worker.js",\n "assets": { "directory": "./dist", },\n "routes": [{"pattern":"production.example"}]\n}')
  const generated = createPreviewConfig({
    source,
    sourcePath,
    root: '/repo',
    app: 'ui-docs',
    pr: 7,
    accountId,
  })
  assert.equal(generated.config.name, 'n3wth-ui-docs-pr-7')
  assert.equal(generated.config.main, '/repo/apps/ui-docs/worker.js')
  assert.equal(generated.config.assets.directory, '/repo/apps/ui-docs/dist')
  assert.deepEqual(generated.config.routes, [{ pattern: 'ui-docs-pr-7.preview.n3wth.com', custom_domain: true }])
  assert.equal(source.name, 'source')
  assert.deepEqual(source.routes, [{ pattern: 'production.example' }])
})

test('does not remove comma-like text inside JSON strings', () => {
  assert.deepEqual(parseJsonc('{ "text": ",}", "items": [1,], }'), { text: ',}', items: [1] })
  assert.deepEqual(parseJsonc('{ "text": ",]", "items": [1,], }'), { text: ',]', items: [1] })
})

test('stages assets and injects preview noindex without changing source files', t => {
  const root = mkdtempSync(join(tmpdir(), 'cloudflare-preview-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const source = join(root, 'dist')
  const stage = join(root, '.cloudflare', 'assets')
  mkdirSync(source, { recursive: true })
  writeFileSync(join(source, 'index.html'), '<html></html>')
  writeFileSync(join(source, '_headers'), '/*\n  Cache-Control: public, max-age=0\n  X-Frame-Options: DENY\n')
  const original = readFileSync(join(source, '_headers'), 'utf8')
  stagePreviewAssets({ sourceDirectory: source, stageDirectory: stage })
  assert.equal(readFileSync(join(source, '_headers'), 'utf8'), original)
  assert.match(readFileSync(join(stage, '_headers'), 'utf8'), /Cache-Control: public, max-age=0/)
  assert.match(readFileSync(join(stage, '_headers'), 'utf8'), /X-Robots-Tag: noindex, nofollow/)
  assert.equal(injectPreviewHeaders(stage), join(stage, '_headers'))
  assert.equal((readFileSync(join(stage, '_headers'), 'utf8').match(/X-Robots-Tag/g) || []).length, 1)
  const headers = readFileSync(join(stage, '_headers'), 'utf8')
  assert.equal((headers.match(/^\/\*$/gm) || []).length, 1)
  assert.match(headers, /X-Frame-Options: DENY/)
})

test('local workerd preserves security headers, preview noindex, cache, redirect, and 404', async t => {
  const builtDist = join(fileURLToPath(new URL('../apps/ui-docs/dist/', import.meta.url)))
  const builtHeaders = join(builtDist, '_headers')
  const builtRedirects = join(builtDist, '_redirects')
  if (!existsSync(builtDist) || !existsSync(builtHeaders) || !existsSync(builtRedirects)) {
    t.skip('apps/ui-docs/dist is not built; run npm run build:ui-docs first')
    return
  }
  const root = mkdtempSync(join(tmpdir(), 'cloudflare-workerd-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const assets = join(root, 'assets')
  stagePreviewAssets({ sourceDirectory: builtDist, stageDirectory: assets })
  const configPath = join(root, 'wrangler.json')
  writeFileSync(configPath, JSON.stringify({
    name: 'n3wth-ui-docs-local-test',
    compatibility_date: '2026-09-18',
    assets: { directory: assets, html_handling: 'drop-trailing-slash', not_found_handling: '404-page' },
  }))
  const port = await freePort()
  const wrangler = spawn(process.execPath, [
    fileURLToPath(new URL('../node_modules/wrangler/bin/wrangler.js', import.meta.url)),
    'dev', '--local', '--config', configPath, '--port', String(port), '--show-interactive-dev-session', 'false',
  ], { cwd: fileURLToPath(new URL('..', import.meta.url)), stdio: 'ignore' })
  t.after(() => wrangler.kill('SIGTERM'))
  await waitForHttp(port)
  const response = await fetch(`http://127.0.0.1:${port}/`)
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('x-frame-options'), 'DENY')
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff')
  assert.match(response.headers.get('strict-transport-security') || '', /max-age=63072000/)
  assert.equal(response.headers.get('referrer-policy'), 'strict-origin-when-cross-origin')
  assert.equal(response.headers.get('permissions-policy'), 'camera=\(\), microphone=\(\), geolocation=\(\)')
  assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow')
  assert.match(response.headers.get('cache-control') || '', /max-age=0/)

  const redirect = await fetch(`http://127.0.0.1:${port}/docs`, { redirect: 'manual' })
  assert.equal(redirect.status, 301)
  assert.equal(redirect.headers.get('location'), '/docs/getting-started')
  const missing = await fetch(`http://127.0.0.1:${port}/does-not-exist`)
  assert.equal(missing.status, 404)
})

function freePort() {
  return new Promise((resolve, reject) => {
    const server = createServer()
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address()
      server.close(error => error ? reject(error) : resolve(port))
    })
  })
}

async function waitForHttp(port) {
  const deadline = Date.now() + 15000
  while (Date.now() < deadline) {
    try {
      await fetch(`http://127.0.0.1:${port}/`)
      return
    } catch {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  throw new Error('Timed out waiting for local Wrangler server.')
}

test('Wrangler invocation uses the pinned local entrypoint and no shell', () => {
  let call
  runWrangler(['delete', 'n3wth-ui-docs-pr-2', '--force'], { run: (...args) => { call = args; return { status: 0 } } })
  assert.equal(call[0], process.execPath)
  assert.match(call[1][0], /node_modules\/wrangler\/bin\/wrangler\.js$/)
  assert.deepEqual(call[1].slice(1), ['delete', 'n3wth-ui-docs-pr-2', '--force'])
  assert.equal(call[2].shell, undefined)
})

test('deploy permits an unclaimed exact hostname and checks DNS before Wrangler', async t => {
  const root = mkdtempSync(join(tmpdir(), 'cloudflare-deploy-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const appRoot = join(root, 'apps', 'ui-docs')
  mkdirSync(join(appRoot, 'dist'), { recursive: true })
  writeFileSync(join(appRoot, 'dist', 'index.html'), '<html></html>')
  writeFileSync(join(appRoot, 'wrangler.jsonc'), '{ "assets": { "directory": "./dist" } }')
  const calls = []
  const requests = []
  const result = await deployPreview({
    appRoot,
    root,
    pr: 8,
    verifyDeployment: null,
    env: {
      CLOUDFLARE_ACCOUNT_ID: 'ac23513945eb49f73a89faf1be12384e',
      CLOUDFLARE_ZONE_ID: '5e3780e8b6272182ea60a146ede42577',
      CLOUDFLARE_API_TOKEN: 'test-token',
    },
    run: (...args) => { calls.push(args); return { status: 0, stdout: 'deployed' } },
    log: () => {},
    fetchFn: async (url, options) => {
      requests.push([url, options])
      return cloudflareResponse([])
    },
  })
  assert.equal(result.command[0], process.execPath)
  assert.match(result.command[1], /node_modules\/wrangler\/bin\/wrangler\.js$/)
  assert.deepEqual(result.command.slice(2), ['deploy', '--config', result.configPath])
  assert.deepEqual(calls[0][1].slice(1), ['deploy', '--config', result.configPath])
  assert.match(requests[0][0], /workers\/domains\?hostname=ui-docs-pr-8\.preview\.n3wth\.com/)
  assert.match(requests[1][0], /dns_records\?name=ui-docs-pr-8\.preview\.n3wth\.com/)
  assert.equal(requests[0][1].headers.Authorization, 'Bearer test-token')
  assert.equal(result.config.assets.directory, join(root, '.cloudflare', 'ui-docs-pr-8', 'assets'))
})

test('deploy refuses a custom domain owned by another Worker before Wrangler runs', async t => {
  const root = mkdtempSync(join(tmpdir(), 'cloudflare-domain-collision-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const appRoot = join(root, 'apps', 'ui-docs')
  mkdirSync(join(appRoot, 'dist'), { recursive: true })
  writeFileSync(join(appRoot, 'dist', 'index.html'), '<html></html>')
  writeFileSync(join(appRoot, 'wrangler.jsonc'), '{ "assets": { "directory": "./dist" } }')
  let ranWrangler = false
  await assert.rejects(() => deployPreview({
    appRoot,
    root,
    pr: 8,
    env: {
      CLOUDFLARE_ACCOUNT_ID: 'ac23513945eb49f73a89faf1be12384e',
      CLOUDFLARE_ZONE_ID: '5e3780e8b6272182ea60a146ede42577',
      CLOUDFLARE_API_TOKEN: 'test-token',
    },
    run: () => { ranWrangler = true; return { status: 0 } },
    log: () => {},
    fetchFn: async () => cloudflareResponse([{ id: 'domain-id', hostname: 'ui-docs-pr-8.preview.n3wth.com', service: 'unrelated-worker', environment: 'production' }]),
  }), /not owned by n3wth-ui-docs-pr-8/)
  assert.equal(ranWrangler, false)
})

test('deploy refuses an exact DNS collision when no Worker Domain owns the hostname', async t => {
  const root = mkdtempSync(join(tmpdir(), 'cloudflare-dns-collision-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const appRoot = join(root, 'apps', 'ui-docs')
  mkdirSync(join(appRoot, 'dist'), { recursive: true })
  writeFileSync(join(appRoot, 'dist', 'index.html'), '<html></html>')
  writeFileSync(join(appRoot, 'wrangler.jsonc'), '{ "assets": { "directory": "./dist" } }')
  let ranWrangler = false
  await assert.rejects(() => deployPreview({
    appRoot,
    root,
    pr: 9,
    env: {
      CLOUDFLARE_ACCOUNT_ID: 'ac23513945eb49f73a89faf1be12384e',
      CLOUDFLARE_ZONE_ID: '5e3780e8b6272182ea60a146ede42577',
      CLOUDFLARE_API_TOKEN: 'test-token',
    },
    run: () => { ranWrangler = true; return { status: 0 } },
    log: () => {},
    fetchFn: async url => cloudflareResponse(url.includes('/dns_records') ? [{ id: 'dns-record-id', name: 'ui-docs-pr-9.preview.n3wth.com' }] : []),
  }), /existing DNS record/)
  assert.equal(ranWrangler, false)
})

test('delete detaches only the exact Worker Domain before deleting the Worker', async () => {
  assert.equal(isMissingWorkerResult({ status: 1, stderr: 'Worker n3wth-ui-docs-pr-3 not found' }), true)
  assert.equal(isMissingWorkerResult({ status: 1, stderr: 'Authentication failed: invalid API token' }), false)
  assert.equal(isMissingWorkerResult({ status: 1, stderr: 'network request failed' }), false)
  const calls = []
  const requests = []
  const result = await deletePreview({
    root: '/repo',
    pr: 3,
    env: { CLOUDFLARE_ACCOUNT_ID: 'ac23513945eb49f73a89faf1be12384e', CLOUDFLARE_ZONE_ID: '5e3780e8b6272182ea60a146ede42577', CLOUDFLARE_API_TOKEN: 'test-token' },
    run: (...args) => { calls.push(args); return { status: 1, stderr: 'Worker n3wth-ui-docs-pr-3 not found' } },
    log: () => {},
    fetchFn: async (url, options) => {
      requests.push([url, options])
      if (url.includes('/workers/scripts/') && options?.method === 'DELETE') {
        return { ok: false, status: 404, text: async () => '' }
      }
      return cloudflareResponse(url.includes('/domain-id') ? {} : [{ id: 'domain-id', hostname: 'ui-docs-pr-3.preview.n3wth.com', service: 'n3wth-ui-docs-pr-3', environment: 'production' }])
    },
  })
  assert.equal(result.missing, true)
  assert.equal(result.domainDetached, true)
  assert.match(requests[0][0], /workers\/domains\?hostname=ui-docs-pr-3\.preview\.n3wth\.com/)
  assert.match(requests[1][0], /workers\/domains\/domain-id$/)
  assert.equal(requests[1][1].method, 'DELETE')
  assert.equal(calls.length, 0, 'worker deletion uses the scoped API, not wrangler (wrangler delete requires KV list permission)')
  const scriptDelete = requests.find(([url, options]) => url.includes('/workers/scripts/') && options?.method === 'DELETE')
  assert.match(scriptDelete[0], /workers\/scripts\/n3wth-ui-docs-pr-3$/)
  await assert.rejects(() => deletePreview({
    root: '/repo', pr: 3,
    env: { CLOUDFLARE_ACCOUNT_ID: 'ac23513945eb49f73a89faf1be12384e', CLOUDFLARE_ZONE_ID: '5e3780e8b6272182ea60a146ede42577', CLOUDFLARE_API_TOKEN: 'test-token' },
    log: () => {},
    fetchFn: async url => {
      if (url.includes('/workers/scripts/')) {
        return cloudflareResponse(null, { status: 500, success: false, errors: [{ message: 'internal error, api_token=secret-value' }] })
      }
      return cloudflareResponse([])
    },
  }), error => error.message.includes('internal error') && !error.message.includes('secret-value'))
})

test('Cloudflare API accepts successful empty response bodies', async () => {
  await assert.doesNotReject(() => cloudflareApi('/accounts/account/workers/domains/domain-id', {
    method: 'DELETE',
    env: { CLOUDFLARE_API_TOKEN: 'test-token' },
    fetchFn: async () => ({ ok: true, status: 200, json: async () => { throw new Error('empty body') }, text: async () => '' }),
  }))
  await assert.rejects(() => cloudflareApi('/accounts/account/workers/domains/domain-id', {
    method: 'DELETE',
    env: { CLOUDFLARE_API_TOKEN: 'test-token' },
    fetchFn: async () => ({ ok: false, status: 500, json: async () => { throw new Error('empty body') }, text: async () => '' }),
  }), /HTTP 500/)
})

test('delete rejects mismatched ownership and does not detach or delete', async () => {
  let ranWrangler = false
  await assert.rejects(() => deletePreview({
    root: '/repo', pr: 4,
    env: { CLOUDFLARE_ACCOUNT_ID: 'ac23513945eb49f73a89faf1be12384e', CLOUDFLARE_API_TOKEN: 'test-token' },
    run: () => { ranWrangler = true; return { status: 0 } }, log: () => {},
    fetchFn: async () => cloudflareResponse([{ id: 'other-domain', hostname: 'ui-docs-pr-4.preview.n3wth.com', service: 'other-worker', environment: 'production' }]),
  }), /not owned by n3wth-ui-docs-pr-4/)
  assert.equal(ranWrangler, false)
})

test('command errors preserve relevant context and redact token-shaped values', async () => {
  await assert.rejects(() => deletePreview({
    root: '/repo', pr: 4,
    env: { CLOUDFLARE_ACCOUNT_ID: 'ac23513945eb49f73a89faf1be12384e', CLOUDFLARE_ZONE_ID: '5e3780e8b6272182ea60a146ede42577', CLOUDFLARE_API_TOKEN: 'test-token' },
    log: () => {},
    fetchFn: async url => {
      if (url.includes('/workers/scripts/')) {
        return cloudflareResponse(null, { status: 500, success: false, errors: [{ message: 'custom domain could not be removed, see api_token=secret-value' }] })
      }
      return cloudflareResponse([])
    },
  }), error => error.message.includes('custom domain could not be removed') && !error.message.includes('secret-value'))
})

test('OpenNext deploy generates a noindex wrapper, rebinds self service, and skips staging', async t => {
  const root = mkdtempSync(join(tmpdir(), 'cloudflare-opennext-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const appRoot = join(root, 'apps', 'skills')
  mkdirSync(join(appRoot, '.open-next', 'assets'), { recursive: true })
  writeFileSync(join(appRoot, 'wrangler.jsonc'), JSON.stringify({
    main: '.open-next/worker.js',
    assets: { directory: '.open-next/assets', binding: 'ASSETS' },
    services: [{ binding: 'WORKER_SELF_REFERENCE', service: 'n3wth-skills-preview' }],
  }))
  const calls = []
  const result = await deployPreview({
    appRoot,
    root,
    app: 'skills',
    pr: 11,
    verifyDeployment: null,
    env: {
      CLOUDFLARE_ACCOUNT_ID: 'ac23513945eb49f73a89faf1be12384e',
      CLOUDFLARE_ZONE_ID: '5e3780e8b6272182ea60a146ede42577',
      CLOUDFLARE_API_TOKEN: 'test-token',
    },
    run: (...args) => { calls.push(args); return { status: 0, stdout: 'deployed' } },
    log: () => {},
    fetchFn: async () => cloudflareResponse([]),
  })
  assert.equal(result.workerName, 'n3wth-skills-pr-11')
  assert.equal(result.host, 'skills-pr-11.preview.n3wth.com')
  assert.equal(result.assetsDirectory, undefined)
  assert.deepEqual(calls[0][1].slice(1), ['deploy', '--config', result.configPath])
  assert.equal(result.config.main, join(result.directory, 'preview-noindex-worker.mjs'))
  assert.equal(result.config.services[0].service, 'n3wth-skills-pr-11')
  assert.equal(result.config.assets.directory, join(appRoot, '.open-next', 'assets'))
  const wrapper = readFileSync(result.config.main, 'utf8')
  assert.match(wrapper, /from ".*\.open-next\/worker\.js"/)
  assert.match(wrapper, /X-Robots-Tag.*noindex, nofollow/)
})

test('OpenNext deploy fails without explicit per-preview stateful bindings', async t => {
  const root = mkdtempSync(join(tmpdir(), 'cloudflare-bindings-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const appRoot = join(root, 'apps', 'garden')
  mkdirSync(join(appRoot, '.open-next', 'assets'), { recursive: true })
  writeFileSync(join(appRoot, 'wrangler.jsonc'), JSON.stringify({
    main: '.open-next/worker.js',
    assets: { directory: '.open-next/assets', binding: 'ASSETS' },
    d1_databases: [{ binding: 'DB', database_id: 'production-db' }],
  }))
  let ranWrangler = false
  await assert.rejects(() => deployPreview({
    appRoot,
    root,
    app: 'garden',
    pr: 12,
    env: {
      CLOUDFLARE_ACCOUNT_ID: 'ac23513945eb49f73a89faf1be12384e',
      CLOUDFLARE_ZONE_ID: '5e3780e8b6272182ea60a146ede42577',
      CLOUDFLARE_API_TOKEN: 'test-token',
    },
    run: () => { ranWrangler = true; return { status: 0 } },
    log: () => {},
    fetchFn: async () => cloudflareResponse([]),
  }), /d1_databases must use explicit per-preview bindings/)
  assert.equal(ranWrangler, false)
})

test('portfolio stages dist with public headers and redirects under the noindex wrapper', async t => {
  const root = mkdtempSync(join(tmpdir(), 'cloudflare-portfolio-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const appRoot = join(root, 'apps', 'portfolio')
  mkdirSync(join(appRoot, 'dist'), { recursive: true })
  mkdirSync(join(appRoot, 'public'), { recursive: true })
  writeFileSync(join(appRoot, 'dist', 'index.html'), '<html></html>')
  writeFileSync(join(appRoot, 'public', '_headers'), '/*\n  X-Frame-Options: DENY\n')
  writeFileSync(join(appRoot, 'public', '_redirects'), '/old /new 301\n')
  writeFileSync(join(appRoot, 'wrangler.jsonc'), JSON.stringify({
    main: './worker.ts',
    assets: { directory: './dist', binding: 'ASSETS' },
  }))
  const result = await deployPreview({
    appRoot,
    root,
    app: 'portfolio',
    pr: 5,
    verifyDeployment: null,
    env: {
      CLOUDFLARE_ACCOUNT_ID: 'ac23513945eb49f73a89faf1be12384e',
      CLOUDFLARE_ZONE_ID: '5e3780e8b6272182ea60a146ede42577',
      CLOUDFLARE_API_TOKEN: 'test-token',
    },
    run: () => ({ status: 0, stdout: 'deployed' }),
    log: () => {},
    fetchFn: async () => cloudflareResponse([]),
  })
  const staged = readFileSync(join(result.assetsDirectory, '_headers'), 'utf8')
  assert.match(staged, /X-Frame-Options: DENY/)
  assert.match(staged, /X-Robots-Tag: noindex, nofollow/)
  assert.equal(readFileSync(join(result.assetsDirectory, '_redirects'), 'utf8'), '/old /new 301\n')
  assert.equal(readFileSync(join(appRoot, 'dist', 'index.html'), 'utf8'), '<html></html>')
  assert.equal(readFileSync(join(appRoot, 'public', '_headers'), 'utf8'), '/*\n  X-Frame-Options: DENY\n')
  assert.equal(result.config.main, join(result.directory, 'preview-noindex-worker.mjs'))
  assert.match(readFileSync(result.config.main, 'utf8'), /worker\.ts/)
  assert.equal(result.config.assets.directory, result.assetsDirectory)
})

test('push, synchronize, close, and reopen recycle one preview cleanly', async t => {
  const root = mkdtempSync(join(tmpdir(), 'cloudflare-lifecycle-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const appRoot = join(root, 'apps', 'ui-docs')
  mkdirSync(join(appRoot, 'dist'), { recursive: true })
  writeFileSync(join(appRoot, 'dist', 'index.html'), '<html></html>')
  writeFileSync(join(appRoot, 'wrangler.jsonc'), '{ "assets": { "directory": "./dist" } }')
  const env = {
    CLOUDFLARE_ACCOUNT_ID: accountId,
    CLOUDFLARE_ZONE_ID: '5e3780e8b6272182ea60a146ede42577',
    CLOUDFLARE_API_TOKEN: 'test-token',
  }
  const cloudflare = fakeCloudflareAccount()
  const deploy = () => deployPreview({ appRoot, root, pr: 8, verifyDeployment: null, env, run: cloudflare.run, log: () => {}, fetchFn: cloudflare.fetchFn })
  const close = () => deletePreview({ root, pr: 8, env, run: cloudflare.run, log: () => {}, fetchFn: cloudflare.fetchFn })
  const workerName = 'n3wth-ui-docs-pr-8'

  // opened: first deploy claims the hostname, attaches the custom domain, and creates the proxied DNS record.
  const first = await deploy()
  assert.equal(cloudflare.calls.dnsQueries, 2, 'first deploy runs the collision check and the DNS ensure lookup')
  assert.deepEqual(cloudflare.calls.dnsCreates, ['ui-docs-pr-8.preview.n3wth.com'], 'deploy creates the AAAA 100:: record wrangler does not manage')
  assert.deepEqual(cloudflare.state.domains.map(domain => domain.service), [workerName])
  assert.equal(cloudflare.state.workers.has(workerName), true)

  // synchronize: the PR's own Worker Domain short-circuits the collision check; the existing DNS record is reused.
  assert.equal(cloudflare.state.dns.length, 1)
  const second = await deploy()
  assert.equal(second.host, first.host)
  assert.equal(second.workerName, first.workerName)
  assert.equal(cloudflare.calls.dnsQueries, 3, 'redeploy short-circuits the collision check and finds its own DNS record')
  assert.equal(cloudflare.calls.dnsCreates.length, 1, 'redeploy does not duplicate the DNS record')
  assert.equal(cloudflare.state.domains.length, 1, 'redeploy leaves no duplicate Worker Domain')

  // closed: the custom domain is detached, the DNS record and the Worker are deleted via the scoped API.
  const deleted = await close()
  assert.equal(deleted.domainDetached, true)
  assert.equal(deleted.missing, false)
  assert.equal(deleted.dnsRecordsDeleted, 1)
  assert.deepEqual(cloudflare.calls.domainDeletes, ['ui-docs-pr-8.preview.n3wth.com'])
  assert.deepEqual(cloudflare.calls.dnsDeletes, ['ui-docs-pr-8.preview.n3wth.com'])
  assert.deepEqual(cloudflare.calls.scriptDeletes, [workerName])
  assert.equal(cloudflare.state.domains.length, 0)
  assert.equal(cloudflare.state.dns.length, 0)
  assert.equal(cloudflare.state.workers.has(workerName), false)

  // reopened: no stale domain ownership or DNS record blocks a clean recreate.
  const third = await deploy()
  assert.equal(third.host, first.host)
  assert.equal(cloudflare.calls.dnsCreates.length, 2, 'reopen recreates the DNS record')
  assert.deepEqual(cloudflare.state.domains.map(domain => domain.service), [workerName])
  assert.equal(cloudflare.state.dns.length, 1)
  assert.equal(cloudflare.state.workers.has(workerName), true)
})

test('close cleanup succeeds when the worker and domain are already absent', async () => {
  const requests = []
  const result = await deletePreview({
    root: '/repo',
    pr: 6,
    env: { CLOUDFLARE_ACCOUNT_ID: accountId, CLOUDFLARE_ZONE_ID: '5e3780e8b6272182ea60a146ede42577', CLOUDFLARE_API_TOKEN: 'test-token' },
    run: () => { throw new Error('wrangler must not run during delete') },
    log: () => {},
    fetchFn: async (url, options) => {
      requests.push([url, options])
      if (url.includes('/workers/scripts/') && options?.method === 'DELETE') {
        return { ok: false, status: 404, text: async () => '' }
      }
      return cloudflareResponse([])
    },
  })
  assert.equal(result.missing, true)
  assert.equal(result.domainDetached, false)
  assert.equal(result.dnsRecordsDeleted, 0)
  assert.equal(requests.filter(([url, options]) => /workers\/domains\/[^?]/.test(url) && options?.method === 'DELETE').length, 0, 'no detach request when no Worker Domain exists')
  assert.match(requests[0][0], /workers\/domains\?hostname=ui-docs-pr-6\.preview\.n3wth\.com/)
})

test('deploy adopts a stale preview-shaped DNS record left by a crashed cleanup', async t => {
  const root = mkdtempSync(join(tmpdir(), 'cloudflare-stale-dns-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const appRoot = join(root, 'apps', 'ui-docs')
  mkdirSync(join(appRoot, 'dist'), { recursive: true })
  writeFileSync(join(appRoot, 'dist', 'index.html'), '<html></html>')
  writeFileSync(join(appRoot, 'wrangler.jsonc'), '{ "assets": { "directory": "./dist" } }')
  const requests = []
  const result = await deployPreview({
    appRoot,
    root,
    pr: 12,
    verifyDeployment: null,
    env: {
      CLOUDFLARE_ACCOUNT_ID: 'ac23513945eb49f73a89faf1be12384e',
      CLOUDFLARE_ZONE_ID: '5e3780e8b6272182ea60a146ede42577',
      CLOUDFLARE_API_TOKEN: 'test-token',
    },
    run: () => ({ status: 0, stdout: 'Deployed' }),
    log: () => {},
    fetchFn: async (url, options) => {
      requests.push([url, options])
      if (url.includes('/dns_records')) {
        return cloudflareResponse([{ id: 'dns-stale', type: 'AAAA', name: 'ui-docs-pr-12.preview.n3wth.com', content: '100::', proxied: true }])
      }
      return cloudflareResponse([])
    },
  })
  assert.equal(result.host, 'ui-docs-pr-12.preview.n3wth.com')
  assert.equal(requests.filter(([, options]) => options?.method === 'POST').length, 0, 'existing preview-shaped record is reused, not recreated')
})

test('delete refuses to remove a foreign DNS record and leaves the Worker untouched', async () => {
  const calls = { scriptDeletes: 0 }
  await assert.rejects(() => deletePreview({
    root: '/repo', pr: 13,
    env: { CLOUDFLARE_ACCOUNT_ID: 'ac23513945eb49f73a89faf1be12384e', CLOUDFLARE_ZONE_ID: '5e3780e8b6272182ea60a146ede42577', CLOUDFLARE_API_TOKEN: 'test-token' },
    log: () => {},
    fetchFn: async (url, options) => {
      if (url.includes('/workers/scripts/') && options?.method === 'DELETE') calls.scriptDeletes += 1
      if (url.includes('/dns_records')) {
        return cloudflareResponse([{ id: 'dns-foreign', type: 'CNAME', name: 'ui-docs-pr-13.preview.n3wth.com', content: 'elsewhere.example.com', proxied: true }])
      }
      return cloudflareResponse([])
    },
  }), /expected AAAA 100::, got CNAME elsewhere\.example\.com/)
  assert.equal(calls.scriptDeletes, 0)
})

test('the workflow queues lifecycle events per PR and gates reopen deploys on current state', () => {
  const workflow = readFileSync(fileURLToPath(new URL('../.github/workflows/cloudflare-preview.yml', import.meta.url)), 'utf8')
  assert.match(workflow, /types:\s*\[opened, synchronize, reopened, closed\]/, 'close and reopen are workflow triggers')
  assert.match(workflow, /group:\s*cloudflare-preview-\$\{\{ github\.event\.pull_request\.number \}\}[\s\S]*?cancel-in-progress:\s*false/, 'deploys and cleanup serialize per PR')
  assert.match(workflow, /if \[ "\$EVENT_ACTION" = closed \][\s\S]*?apps=ui-docs portfolio garden skills r3-web/, 'close cleans up every preview app')
  assert.match(workflow, /pr\.state === 'open' && pr\.head\.sha === context\.payload\.pull_request\.head\.sha/, 'deploy requires the PR to still be open at the queued SHA')
  assert.match(workflow, /if:\s*steps\.affected\.outputs\.apps != '' && steps\.current\.outputs\.deploy == 'true'/, 'deploy is gated on the current-state check')
  assert.match(workflow, /if:\s*steps\.affected\.outputs\.apps != '' && github\.event\.action == 'closed'/, 'delete only runs on close')
})

test('readiness classifies DNS, TLS, and other network failures apart', () => {
  assert.equal(classifyFetchError(Object.assign(new Error('fetch failed'), { cause: { code: 'ENOTFOUND' } })), 'dns')
  assert.equal(classifyFetchError(Object.assign(new Error('fetch failed'), { cause: { code: 'EAI_AGAIN' } })), 'dns')
  assert.equal(classifyFetchError(Object.assign(new Error('fetch failed'), { cause: { code: 'ERR_TLS_CERT_ALTNAME_INVALID' } })), 'tls')
  assert.equal(classifyFetchError(Object.assign(new Error('fetch failed'), { cause: new Error('unable to verify the first certificate') })), 'tls')
  assert.equal(classifyFetchError(Object.assign(new Error('fetch failed'), { cause: { code: 'ECONNREFUSED' } })), 'network')
})

test('a single readiness check separates status, header, DNS, and TLS outcomes', async () => {
  const pass = await checkPreviewOnce({ host: 'ui-docs-pr-1.preview.n3wth.com', fetchFn: async () => pageResponse(200, { 'x-robots-tag': 'noindex, nofollow' }) })
  assert.deepEqual(pass, { ok: true, status: 200 })
  const wrongStatus = await checkPreviewOnce({ host: 'ui-docs-pr-1.preview.n3wth.com', fetchFn: async () => pageResponse(502) })
  assert.equal(wrongStatus.failure, 'http')
  const missingHeader = await checkPreviewOnce({ host: 'ui-docs-pr-1.preview.n3wth.com', fetchFn: async () => pageResponse(200) })
  assert.equal(missingHeader.failure, 'header')
  const dnsDown = await checkPreviewOnce({ host: 'ui-docs-pr-1.preview.n3wth.com', fetchFn: async () => { throw Object.assign(new Error('fetch failed'), { cause: { code: 'ENOTFOUND' } }) } })
  assert.equal(dnsDown.failure, 'dns')
  const tlsBad = await checkPreviewOnce({ host: 'ui-docs-pr-1.preview.n3wth.com', fetchFn: async () => { throw Object.assign(new Error('fetch failed'), { cause: { code: 'ERR_TLS_CERT_ALTNAME_INVALID' } }) } })
  assert.equal(tlsBad.failure, 'tls')
})

test('readiness retries while the host provisions, then succeeds without disabling TLS', async () => {
  let attempt = 0
  const slept = []
  const result = await verifyPreviewReadiness({
    host: 'ui-docs-pr-1.preview.n3wth.com',
    attempts: 5,
    delayMs: 100,
    sleep: async ms => { slept.push(ms) },
    fetchFn: async url => {
      assert.match(url, /^https:\/\/ui-docs-pr-1\.preview\.n3wth\.com\//, 'checks the exact host over HTTPS')
      attempt += 1
      if (attempt < 3) throw Object.assign(new Error('fetch failed'), { cause: { code: 'ENOTFOUND' } })
      return pageResponse(200, { 'x-robots-tag': 'noindex, nofollow' })
    },
  })
  assert.deepEqual(result, { ok: true, status: 200, attempts: 3 })
  assert.deepEqual(slept, [100, 100])
})

test('readiness fails after bounded retries and reports the last failure class', async () => {
  const error = await verifyPreviewReadiness({
    host: 'ui-docs-pr-1.preview.n3wth.com',
    attempts: 3,
    delayMs: 0,
    sleep: async () => {},
    fetchFn: async () => pageResponse(200),
  }).then(() => null, error => error)
  assert.equal(error.failure, 'header')
  assert.match(error.message, /after 3 attempts \(header:/)
})

test('deploy verifies the live preview before reporting success', async t => {
  const root = mkdtempSync(join(tmpdir(), 'cloudflare-verify-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const appRoot = join(root, 'apps', 'ui-docs')
  mkdirSync(join(appRoot, 'dist'), { recursive: true })
  writeFileSync(join(appRoot, 'dist', 'index.html'), '<html></html>')
  writeFileSync(join(appRoot, 'wrangler.jsonc'), '{ "assets": { "directory": "./dist" } }')
  const env = { CLOUDFLARE_ACCOUNT_ID: accountId, CLOUDFLARE_ZONE_ID: '5e3780e8b6272182ea60a146ede42577', CLOUDFLARE_API_TOKEN: 'test-token' }
  const pages = []
  const result = await deployPreview({
    appRoot, root, pr: 20, env,
    run: () => ({ status: 0, stdout: 'deployed' }),
    log: () => {},
    fetchFn: async (url, options) => {
      if (url.startsWith('https://ui-docs-pr-20.preview.n3wth.com')) {
        pages.push(url)
        return pageResponse(200, { 'x-robots-tag': 'noindex, nofollow' })
      }
      return cloudflareResponse([])
    },
  })
  assert.equal(result.host, 'ui-docs-pr-20.preview.n3wth.com')
  assert.deepEqual(pages, ['https://ui-docs-pr-20.preview.n3wth.com/'], 'default deploy checks the live host once')
})

test('deploy fails when the deployed preview does not serve the expected page', async t => {
  const root = mkdtempSync(join(tmpdir(), 'cloudflare-verify-fail-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const appRoot = join(root, 'apps', 'ui-docs')
  mkdirSync(join(appRoot, 'dist'), { recursive: true })
  writeFileSync(join(appRoot, 'dist', 'index.html'), '<html></html>')
  writeFileSync(join(appRoot, 'wrangler.jsonc'), '{ "assets": { "directory": "./dist" } }')
  const env = { CLOUDFLARE_ACCOUNT_ID: accountId, CLOUDFLARE_ZONE_ID: '5e3780e8b6272182ea60a146ede42577', CLOUDFLARE_API_TOKEN: 'test-token' }
  await assert.rejects(() => deployPreview({
    appRoot, root, pr: 21, env,
    run: () => ({ status: 0, stdout: 'deployed' }),
    log: () => {},
    verifyDeployment: options => verifyPreviewReadiness({ ...options, attempts: 2, delayMs: 0, sleep: async () => {} }),
    fetchFn: async (url, options) => {
      if (url.startsWith('https://ui-docs-pr-21.preview.n3wth.com')) return pageResponse(503)
      return cloudflareResponse([])
    },
  }), /Readiness check failed for https:\/\/ui-docs-pr-21\.preview\.n3wth\.com/)
})

function pageResponse(status, headers = {}) {
  const lower = Object.fromEntries(Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value]))
  return { status, headers: { get: name => (name.toLowerCase() in lower ? lower[name.toLowerCase()] : null) } }
}

function fakeCloudflareAccount() {
  const state = { domains: [], dns: [], workers: new Set() }
  const calls = { dnsQueries: 0, domainDeletes: [], dnsCreates: [], dnsDeletes: [], scriptDeletes: [] }
  const fetchFn = async (url, options = {}) => {
    const parsed = new URL(url)
    if (parsed.pathname.endsWith('/workers/domains')) {
      const hostname = parsed.searchParams.get('hostname')
      return cloudflareResponse(state.domains.filter(domain => !hostname || domain.hostname === hostname))
    }
    if (parsed.pathname.includes('/workers/domains/') && options.method === 'DELETE') {
      const id = parsed.pathname.split('/').pop()
      const index = state.domains.findIndex(domain => domain.id === id)
      if (index === -1) return cloudflareResponse(null, { status: 404, success: false, errors: [{ message: 'Worker Domain not found' }] })
      const [removed] = state.domains.splice(index, 1)
      calls.domainDeletes.push(removed.hostname)
      return cloudflareResponse({ id })
    }
    if (parsed.pathname.endsWith('/dns_records') && options.method === 'POST') {
      const body = JSON.parse(options.body)
      const record = { id: `dns-${state.dns.length}-${body.name}`, type: body.type, name: body.name, content: body.content, proxied: body.proxied }
      state.dns.push(record)
      calls.dnsCreates.push(record.name)
      return cloudflareResponse(record)
    }
    if (parsed.pathname.includes('/dns_records/') && options.method === 'DELETE') {
      const id = parsed.pathname.split('/').pop()
      const index = state.dns.findIndex(record => record.id === id)
      if (index === -1) return cloudflareResponse(null, { status: 404, success: false, errors: [{ message: 'DNS record not found' }] })
      const [removed] = state.dns.splice(index, 1)
      calls.dnsDeletes.push(removed.name)
      return cloudflareResponse({ id })
    }
    if (parsed.pathname.endsWith('/dns_records')) {
      calls.dnsQueries += 1
      const name = parsed.searchParams.get('name')
      return cloudflareResponse(state.dns.filter(record => !name || record.name === name))
    }
    if (parsed.pathname.includes('/workers/scripts/') && options.method === 'DELETE') {
      const name = parsed.pathname.split('/').pop()
      if (!state.workers.has(name)) return cloudflareResponse(null, { status: 404, success: false, errors: [{ message: 'Worker not found' }] })
      state.workers.delete(name)
      calls.scriptDeletes.push(name)
      // DELETE script returns 200 with a body when the script has bindings/routes
      return { ok: true, status: 200, json: async () => ({}), text: async () => '{}' }
    }
    throw new Error(`Unexpected Cloudflare API call: ${options.method || 'GET'} ${url}`)
  }
  const run = (...args) => {
    const argv = args[1].slice(1)
    if (argv[0] === 'deploy') {
      const configPath = argv[argv.indexOf('--config') + 1]
      const config = JSON.parse(readFileSync(configPath, 'utf8'))
      state.workers.add(config.name)
      for (const route of config.routes || []) {
        if (!route.custom_domain || state.domains.some(domain => domain.hostname === route.pattern)) continue
        state.domains.push({ id: `domain-${config.name}`, hostname: route.pattern, service: config.name, environment: 'production' })
      }
      return { status: 0, stdout: `Deployed ${config.name}` }
    }
    if (argv[0] === 'delete') {
      if (!state.workers.has(argv[1])) return { status: 1, stderr: `Worker ${argv[1]} not found. [code: 10007]` }
      state.workers.delete(argv[1])
      return { status: 0, stdout: `Deleted ${argv[1]}` }
    }
    throw new Error(`Unexpected Wrangler command: ${argv.join(' ')}`)
  }
  return { state, calls, fetchFn, run }
}

function cloudflareResponse(result, { status = 200, success = true, errors = [] } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify({ success, result, errors }),
    json: async () => ({ success, result, errors }),
  }
}
