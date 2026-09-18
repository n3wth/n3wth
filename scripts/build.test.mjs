import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { affectedWorkspaces, readWorkspaces } from './affected.mjs'
import { buildOrder, checkCloudflareToolchain, parseBuildArgs, runWorkspaceBuilds, workspaceBuildArgs } from './build.mjs'

const repo = fileURLToPath(new URL('../', import.meta.url))

test('Cloudflare builds reject unsupported Node and npm versions before building', () => {
  assert.doesNotThrow(() => checkCloudflareToolchain('24.21.0', '11.19.1'))
  assert.throws(() => checkCloudflareToolchain('22.22.3', '11.19.1'), /require Node 24/)
  assert.throws(() => checkCloudflareToolchain('24.21.0', '10.9.8'), /require Node 24/)
})
const apps = ['@n3wth/garden', '@n3wth/kit', '@n3wth/portfolio', '@n3wth/r3-web', '@n3wth/skills', '@n3wth/ui-docs']
const graph = [
  { name: '@n3wth/site-config', path: 'packages/site-config' },
  { name: '@n3wth/ui', path: 'packages/ui', scripts: { build: 'vite build' }, dependencies: { '@n3wth/site-config': '*' } },
  { name: '@n3wth/garden', path: 'apps/garden', scripts: { build: 'next build' }, dependencies: { '@n3wth/ui': '0.9.2' } },
  { name: '@n3wth/kit', path: 'apps/kit', scripts: { build: 'next build' }, dependencies: { '@n3wth/ui': '0.9.2' } },
  { name: '@n3wth/portfolio', path: 'apps/portfolio', scripts: { build: 'vite build' }, dependencies: { '@n3wth/ui': '0.9.2' } },
  { name: '@n3wth/r3-web', path: 'apps/r3-web', scripts: { build: 'next build' }, dependencies: { '@n3wth/ui': '0.9.2' } },
  { name: '@n3wth/skills', path: 'apps/skills', scripts: { build: 'next build' }, dependencies: { '@n3wth/ui': '0.9.2' } },
  { name: '@n3wth/ui-docs', path: 'apps/ui-docs', scripts: { build: 'vite build' }, dependencies: { '@n3wth/ui': '*' } },
]
const lock = {
  packages: {
    ...Object.fromEntries(graph.map(workspace => [workspace.path, {}])),
    'node_modules/@n3wth/ui': { link: true, resolved: 'packages/ui' },
    'node_modules/@n3wth/site-config': { link: true, resolved: 'packages/site-config' },
  },
}

test('Cloudflare uses the same dependency graph and builds each package only once', () => {
  assert.equal(parseBuildArgs(['--cloudflare']).cloudflare, true)
  const calls = []
  const order = buildOrder(graph, apps, lock)
  runWorkspaceBuilds(order, (command, args) => {
    calls.push({ command, args })
    return { status: 0 }
  }, repo, { cloudflare: true })
  assert.equal(calls.length, order.length)
  assert.deepEqual(calls[0].args, ['run', 'build', '--workspace', '@n3wth/ui'])
  for (const app of ['garden', 'kit', 'skills', 'r3-web']) {
    assert.deepEqual(workspaceBuildArgs(`@n3wth/${app}`, true), ['exec', '--workspace', `@n3wth/${app}`, '--', 'opennextjs-cloudflare', 'build'])
    assert.deepEqual(workspaceBuildArgs(`@n3wth/${app}`), ['run', 'build', '--workspace', `@n3wth/${app}`])
  }
  for (const app of ['portfolio', 'ui-docs']) {
    assert.deepEqual(workspaceBuildArgs(`@n3wth/${app}`, true), ['run', 'build', '--workspace', `@n3wth/${app}`])
  }
})

test('root build covers all six apps and the UI package once, in dependency order', () => {
  const order = buildOrder(graph, [], lock)
  assert.deepEqual(new Set(order), new Set(['@n3wth/ui', ...apps]))
  assert.equal(order.filter(name => name === '@n3wth/ui').length, 1)
  for (const app of apps) assert.ok(order.indexOf('@n3wth/ui') < order.indexOf(app), `${app} must follow @n3wth/ui`)
  assert.ok(!order.includes('@n3wth/site-config'))
})

test('app-targeted builds include shared UI without sibling apps', () => {
  assert.deepEqual(buildOrder(graph, ['@n3wth/garden'], lock), ['@n3wth/ui', '@n3wth/garden'])
  assert.deepEqual(buildOrder(graph, ['@n3wth/portfolio'], lock), ['@n3wth/ui', '@n3wth/portfolio'])
  assert.deepEqual(buildOrder(graph, ['@n3wth/ui-docs'], lock), ['@n3wth/ui', '@n3wth/ui-docs'])
})

test('one run builds a shared prerequisite once for multiple app targets', () => {
  const order = buildOrder(graph, ['@n3wth/garden', '@n3wth/r3-web'], lock)
  assert.equal(order.filter(name => name === '@n3wth/ui').length, 1)
  assert.ok(order.indexOf('@n3wth/ui') < order.indexOf('@n3wth/garden'))
  assert.ok(order.indexOf('@n3wth/ui') < order.indexOf('@n3wth/r3-web'))
  assert.ok(!order.includes('@n3wth/portfolio'))
})

test('UI-targeted build stays on the package while a UI source change still selects consumers for checks', () => {
  assert.deepEqual(buildOrder(graph, ['@n3wth/ui'], lock), ['@n3wth/ui'])
  const checked = affectedWorkspaces(graph, ['packages/ui/src/Button.tsx'], false, lock)
  for (const app of apps) assert.ok(checked.includes(app), `UI change must check ${app}`)
  assert.ok(!checked.includes('@n3wth/missing'))
})

test('registry-pinned apps do not rebuild workspace UI they do not link', () => {
  const locked = {
    packages: {
      ...lock.packages,
      'apps/kit/node_modules/@n3wth/ui': { version: '0.9.1' },
    },
  }
  assert.deepEqual(buildOrder(graph, ['@n3wth/kit'], locked), ['@n3wth/kit'])
})

test('unknown workspace targets fail before any build runs', () => {
  assert.throws(() => buildOrder(graph, ['@n3wth/missing'], lock), /Unknown workspace @n3wth\/missing/)
})

test('parseBuildArgs accepts repeated workspace flags and list mode', () => {
  assert.deepEqual(parseBuildArgs(['--list', '--workspace', '@n3wth/garden', '-w', '@n3wth/kit']), {
    list: true,
    cacheUi: false,
    workspaces: ['@n3wth/garden', '@n3wth/kit'],
  })
  assert.throws(() => parseBuildArgs(['--turbo']), /Unknown build argument/)
  assert.equal(parseBuildArgs(['--cache-ui']).cacheUi, true)
})

test('repository root build lists every site after UI and omits site-config', () => {
  const order = buildOrder(readWorkspaces(repo), [], JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url))))
  assert.ok(order.includes('@n3wth/ui'))
  assert.equal(order.filter(name => name === '@n3wth/ui').length, 1)
  for (const app of apps) {
    assert.ok(order.includes(app), `root build omits ${app}`)
    assert.ok(order.indexOf('@n3wth/ui') < order.indexOf(app))
  }
  assert.ok(!order.includes('@n3wth/site-config'))
})

test('root scripts and Vercel app builds go through the orchestrator with git deploys enabled', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)))
  assert.equal(pkg.scripts.build, 'node scripts/build.mjs')
  for (const script of ['build:garden', 'build:kit', 'build:portfolio', 'build:r3', 'build:skills', 'build:ui', 'build:ui-docs']) {
    assert.match(pkg.scripts[script], /scripts\/build\.mjs/, script)
  }
  for (const app of ['garden', 'kit', 'portfolio', 'r3-web', 'skills', 'ui-docs']) {
    const vercel = JSON.parse(readFileSync(new URL(`../apps/${app}/vercel.json`, import.meta.url)))
    assert.equal(vercel.git.deploymentEnabled, true)
    const script = app === 'r3-web' ? 'build:r3' : `build:${app}`
    assert.match(vercel.buildCommand, new RegExp(script.replace(':', '\\:')))
  }
})

test('CLI list mode reports garden plus UI without siblings', () => {
  const result = spawnSync(process.execPath, [fileURLToPath(new URL('./build.mjs', import.meta.url)), '--workspace', '@n3wth/garden', '--list'], {
    cwd: repo,
    encoding: 'utf8',
  })
  assert.equal(result.status, 0, result.stderr)
  const order = JSON.parse(result.stdout)
  assert.ok(order.includes('@n3wth/ui'))
  assert.ok(order.includes('@n3wth/garden'))
  assert.ok(!order.includes('@n3wth/portfolio'))
  assert.equal(order.filter(name => name === '@n3wth/ui').length, 1)
})
