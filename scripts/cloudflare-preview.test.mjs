import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { createServer } from 'node:net'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  createGeneratedConfig,
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

test('accepts only the supported action, app, and positive PR syntax', () => {
  assert.deepEqual(parseCliArgs(['config', '--app', 'ui-docs', '--pr', '12']), { action: 'config', app: 'ui-docs', pr: 12 })
  for (const args of [
    ['deploy', '--app', 'portfolio', '--pr', '1'],
    ['deploy', '--app', 'ui-docs', '--pr', '0'],
    ['deploy', '--app', 'ui-docs', '--pr', '-1'],
    ['deploy', '--app', 'ui-docs', '--pr', '1.5'],
    ['deploy', '--app', 'ui-docs', '--pr', '9007199254740992'],
    ['deploy', '--app', 'ui-docs', '--pr', '1', '--name', 'production'],
  ]) assert.throws(() => parseCliArgs(args))
})

test('preview identity is stable and scoped to the fixed app', () => {
  assert.deepEqual(previewIdentity('ui-docs', 42), {
    workerName: 'n3wth-ui-docs-pr-42',
    host: 'ui-docs-pr-42.preview.n3wth.com',
  })
  assert.throws(() => previewIdentity('ui-docs', 0))
  assert.throws(() => previewIdentity('anything', 42))
})

test('reads JSONC and generates an exact custom-domain config without source mutation', () => {
  const sourcePath = '/repo/apps/ui-docs/wrangler.jsonc'
  const source = parseJsonc('{\n // comment\n "name": "source",\n "main": "./worker.js",\n "assets": { "directory": "./dist", },\n "routes": [{"pattern":"production.example"}]\n}')
  const generated = createGeneratedConfig({
    source,
    sourcePath,
    accountId: 'ac23513945eb49f73a89faf1be12384e',
    identity: previewIdentity('ui-docs', 7),
    assetsDirectory: '/repo/.cloudflare/ui-docs-pr-7/assets',
  })
  assert.equal(generated.name, 'n3wth-ui-docs-pr-7')
  assert.equal(generated.main, '/repo/apps/ui-docs/worker.js')
  assert.deepEqual(generated.routes, [{ pattern: 'ui-docs-pr-7.preview.n3wth.com', custom_domain: true }])
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
    env: { CLOUDFLARE_ACCOUNT_ID: 'ac23513945eb49f73a89faf1be12384e', CLOUDFLARE_API_TOKEN: 'test-token' },
    run: (...args) => { calls.push(args); return { status: 1, stderr: 'Worker n3wth-ui-docs-pr-3 not found' } },
    log: () => {},
    fetchFn: async (url, options) => {
      requests.push([url, options])
      return cloudflareResponse(url.includes('/domain-id') ? {} : [{ id: 'domain-id', hostname: 'ui-docs-pr-3.preview.n3wth.com', service: 'n3wth-ui-docs-pr-3', environment: 'production' }])
    },
  })
  assert.equal(result.missing, true)
  assert.equal(result.domainDetached, true)
  assert.match(requests[0][0], /workers\/domains\?hostname=ui-docs-pr-3\.preview\.n3wth\.com/)
  assert.match(requests[1][0], /workers\/domains\/domain-id$/)
  assert.equal(requests[1][1].method, 'DELETE')
  assert.match(calls[0][1].join(' '), /wrangler\.js delete n3wth-ui-docs-pr-3 --force/)
  await assert.rejects(() => deletePreview({
    root: '/repo', pr: 3,
    env: { CLOUDFLARE_ACCOUNT_ID: 'ac23513945eb49f73a89faf1be12384e', CLOUDFLARE_API_TOKEN: 'test-token' },
    run: () => ({ status: 1, stderr: 'Authentication failed: invalid API token' }), log: () => {},
    fetchFn: async () => cloudflareResponse([]),
  }), /Wrangler delete failed/)
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
    env: { CLOUDFLARE_ACCOUNT_ID: 'ac23513945eb49f73a89faf1be12384e', CLOUDFLARE_API_TOKEN: 'test-token' },
    run: () => ({ status: 1, stderr: 'Error: custom domain could not be removed\nSee request log', stdout: 'api_token=secret-value' }), log: () => {},
    fetchFn: async () => cloudflareResponse([]),
  }), error => error.message.includes('custom domain could not be removed') && !error.message.includes('secret-value'))
})

function cloudflareResponse(result, { status = 200, success = true, errors = [] } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => ({ success, result, errors }),
  }
}
