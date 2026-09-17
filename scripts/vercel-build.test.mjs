import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { deploymentWorkspaces, installWorkspace } from './vercel-install.mjs'
import { restoreUiBuild, saveUiBuild, uiBuildKey } from './ui-build-cache.mjs'
import { runWorkspaceBuilds } from './build.mjs'

function fixture(t) {
  const root = mkdtempSync(resolve(tmpdir(), 'n3wth-vercel-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const write = (path, value = '{}') => {
    mkdirSync(dirname(resolve(root, path)), { recursive: true })
    writeFileSync(resolve(root, path), value)
  }
  for (const path of [
    'package-lock.json', 'scripts/build.mjs', 'scripts/ui-build-cache.mjs',
    'packages/ui/src/index.ts', 'packages/ui/scripts/build.mjs', 'packages/ui/public/font.woff2',
    'packages/ui/tsconfig.json', 'packages/ui/vite.config.ts',
    'packages/ui/tailwind.preset.cjs', 'packages/ui/dist/index.js',
  ]) write(path)
  // Two apps sharing the packages, so selection can be shown to exclude the other.
  write('package.json', JSON.stringify({ workspaces: ['apps/*', 'packages/*'] }))
  write('packages/ui/package.json', JSON.stringify({ name: '@n3wth/ui' }))
  write('packages/site-config/package.json', JSON.stringify({ name: '@n3wth/site-config' }))
  for (const name of ['portfolio', 'kit']) {
    write(`apps/${name}/package.json`, JSON.stringify({
      name: `@n3wth/${name}`,
      dependencies: { '@n3wth/ui': '2.0.0', '@n3wth/site-config': '*' },
    }))
  }
  return { root, write }
}

test('install reuses dependencies with pinned npm and preserves lockfile', t => {
  const { root } = fixture(t)
  installWorkspace(root, '@n3wth/portfolio', (command, args, options) => {
    assert.equal(command, 'npx')
    assert.ok(args.includes('npm@11.19.1'))
    assert.ok(args.includes('install'))
    assert.ok(!args.includes('ci'))
    assert.ok(args.includes('--include=dev'))
    assert.ok(args.includes('--include-workspace-root=false'))
    assert.equal(options.cwd, root)
    return { status: 0 }
  })
})

test('install selects the app and its workspace packages, never another app', t => {
  const { root } = fixture(t)
  assert.deepEqual(
    deploymentWorkspaces(root, '@n3wth/portfolio', {}).sort(),
    ['@n3wth/portfolio', '@n3wth/site-config', '@n3wth/ui'],
  )
  installWorkspace(root, '@n3wth/portfolio', (command, args) => {
    assert.ok(args.includes('--workspace=@n3wth/portfolio'))
    assert.ok(args.includes('--workspace=@n3wth/ui'))
    assert.ok(args.includes('--workspace=@n3wth/site-config'))
    assert.ok(!args.includes('--workspace=@n3wth/kit'))
    return { status: 0 }
  })
  assert.throws(() => deploymentWorkspaces(root, '@n3wth/absent', {}), /Unknown workspace/)
})

test('install fails on dependency resolution drift or a failed subprocess', t => {
  const { root, write } = fixture(t)
  assert.throws(() => installWorkspace(root, '@n3wth/portfolio', () => ({ status: 1 })), /install failed/)
  assert.throws(() => installWorkspace(root, '@n3wth/portfolio', () => {
    write('package-lock.json', '{"changed":true}')
    return { status: 0 }
  }), /changed package-lock/)
})

test('install retains the exact committed lockfile when npm only records extraneous inventory', t => {
  const { root, write } = fixture(t)
  const lock = { packages: { 'node_modules/real': { version: '1.0.0' } } }
  const before = JSON.stringify(lock)
  write('package-lock.json', before)
  installWorkspace(root, '@n3wth/portfolio', () => {
    lock.packages['node_modules/bundled-extra'] = { version: '2.0.0', extraneous: true }
    write('package-lock.json', JSON.stringify(lock))
    return { status: 0 }
  })
  assert.equal(readFileSync(resolve(root, 'package-lock.json'), 'utf8'), before)
})

test('UI cache invalidates inputs and environment but survives an app-only change', t => {
  const { root, write } = fixture(t)
  const key = () => uiBuildKey(root, {}, 'node24/linux/x64')
  const initial = key()
  write('apps/portfolio/src/App.tsx', 'changed')
  assert.equal(key(), initial)
  for (const path of ['packages/ui/src/new.ts', 'packages/ui/vite.config.ts', 'package-lock.json', 'packages/ui/.env.production']) {
    const before = key()
    write(path, 'changed')
    assert.notEqual(key(), before, path)
  }
  const beforeDelete = key()
  rmSync(resolve(root, 'packages/ui/src/new.ts'))
  assert.notEqual(key(), beforeDelete)
  assert.notEqual(key(), uiBuildKey(root, {}, 'node25/linux/x64'))
  assert.notEqual(key(), uiBuildKey(root, { VITE_THEME: 'changed' }, 'node24/linux/x64'))
})

test('cache restore replaces stale output and rejects wrong keys and damaged artifacts', t => {
  const { root, write } = fixture(t)
  assert.equal(restoreUiBuild(root, 'one'), false)
  saveUiBuild(root, 'one')
  write('packages/ui/dist/stale.js', 'stale')
  write('packages/ui/dist/index.js', 'changed')
  assert.equal(restoreUiBuild(root, 'two'), false)
  assert.equal(restoreUiBuild(root, 'one'), true)
  assert.equal(readFileSync(resolve(root, 'packages/ui/dist/index.js'), 'utf8'), '{}')
  assert.throws(() => readFileSync(resolve(root, 'packages/ui/dist/stale.js')), /ENOENT/)
  write('node_modules/.cache/n3wth-ui-build/dist/index.js', 'corrupted')
  assert.equal(restoreUiBuild(root, 'one'), false)
})

test('orchestrator always builds the app and caches UI only when explicitly enabled', t => {
  const { root } = fixture(t)
  const calls = []
  const spawn = (command, args) => {
    calls.push(args.at(-1))
    return { status: 0 }
  }
  const order = ['@n3wth/ui', '@n3wth/portfolio']
  runWorkspaceBuilds(order, spawn, root, { cacheUi: true })
  runWorkspaceBuilds(order, spawn, root, { cacheUi: true })
  assert.deepEqual(calls, ['@n3wth/ui', '@n3wth/portfolio', '@n3wth/portfolio'])
  runWorkspaceBuilds(order, spawn, root)
  assert.deepEqual(calls.slice(-2), order)
})
