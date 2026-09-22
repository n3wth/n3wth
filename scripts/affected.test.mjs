import test from 'node:test'
import assert from 'node:assert/strict'
import { affectedWorkspaces, affectsUiPackage } from './affected.mjs'

test('UI package validation skips app-only edits without skipping its build prerequisite', () => {
  for (const file of ['apps/portfolio/src/pages/Thinking.tsx', 'apps/portfolio/src/notes.css', 'tests/browser/portfolio.spec.ts', 'docs/workspace/deployment.md', 'design.md']) {
    assert.equal(affectsUiPackage([file]), false, file)
  }
  assert.equal(affectsUiPackage([]), false)
  assert.deepEqual(affectedWorkspaces([
    { name: '@n3wth/ui', path: 'packages/ui' },
    { name: '@n3wth/portfolio', path: 'apps/portfolio', dependencies: { '@n3wth/ui': '*' } },
  ], ['apps/portfolio/src/pages/Thinking.tsx']), ['@n3wth/ui', '@n3wth/portfolio'])
})

test('UI package validation keeps package, fixture, manifest and uncertain changes', () => {
  for (const file of ['packages/ui/src/index.ts', 'packages/ui/README.md', 'packages/site-config/src/index.ts', 'scripts/package-check/next/app/page.tsx', 'scripts/check-ui-package.mjs', 'scripts/build.mjs', 'package.json', 'package-lock.json', 'apps/portfolio/package.json', '.github/workflows/site-check.yml', 'tsconfig.json', 'unknown-config.toml']) {
    assert.equal(affectsUiPackage([file]), true, file)
  }
  assert.equal(affectsUiPackage(['apps/portfolio/src/pages/Thinking.tsx'], true), true)
  assert.equal(affectsUiPackage([], true), true)
})

const graph = [
  { name: '@n3wth/portfolio', path: 'apps/portfolio', dependencies: { '@n3wth/site-config': '*' } },
  { name: '@n3wth/ui-docs', path: 'apps/ui-docs', dependencies: { '@n3wth/ui': '*' } },
  { name: '@n3wth/ui', path: 'packages/ui', dependencies: { '@n3wth/site-config': '*' } },
  { name: '@n3wth/site-config', path: 'packages/site-config' },
]
const select = files => affectedWorkspaces(graph, files)
const lockedGraph = [
  ...graph,
  { name: '@n3wth/kit', path: 'apps/kit', dependencies: { '@n3wth/ui': '0.9.1' } },
]
const lock = {
  packages: {
    ...Object.fromEntries(lockedGraph.map(workspace => [workspace.path, {}])),
    'node_modules/@n3wth/ui': { link: true, resolved: 'packages/ui' },
    'node_modules/@n3wth/site-config': { link: true, resolved: 'packages/site-config' },
    'apps/kit/node_modules/@n3wth/ui': { version: '0.9.1' },
  },
}
test('registry consumer is excluded when a nested package shadows the workspace', () => {
  assert.deepEqual(affectedWorkspaces(lockedGraph, ['packages/ui/src/Button.tsx'], false, lock),
    ['@n3wth/site-config', '@n3wth/ui', '@n3wth/ui-docs'])
})
test('registry consumer does not build unrelated workspace prerequisites', () => {
  assert.deepEqual(affectedWorkspaces(lockedGraph, ['apps/kit/app/page.tsx'], false, lock), ['@n3wth/kit'])
})
test('linked consumer is included once npm resolves it to the workspace', () => {
  const linkedLock = structuredClone(lock)
  delete linkedLock.packages['apps/kit/node_modules/@n3wth/ui']
  assert.ok(affectedWorkspaces(lockedGraph, ['packages/ui/src/Button.tsx'], false, linkedLock).includes('@n3wth/kit'))
})
test('lock-aware graph preserves transitive config propagation', () => {
  const result = affectedWorkspaces(lockedGraph, ['packages/site-config/index.js'], false, lock)
  assert.equal(result.length, 4)
  assert.ok(result.indexOf('@n3wth/ui') < result.indexOf('@n3wth/ui-docs'))
  assert.ok(!result.includes('@n3wth/kit'))
})
test('incomplete lock data falls back conservatively', () => {
  assert.ok(affectedWorkspaces(lockedGraph, ['packages/ui/src/Button.tsx'], false, { packages: {} }).includes('@n3wth/kit'))
})
test('optional workspace dependencies and aliased links are followed', () => {
  const apps = [
    { name: 'library', path: 'packages/library' },
    { name: 'app', path: 'apps/app', optionalDependencies: { alias: '*' } },
  ]
  const aliasLock = { packages: {
    'apps/app': {}, 'packages/library': {},
    'node_modules/alias': { link: true, resolved: 'packages/library' },
  } }
  assert.deepEqual(affectedWorkspaces(apps, ['packages/library/index.js'], false, aliasLock), ['library', 'app'])
})
test('shared config reaches transitive consumers in dependency order', () => {
  const result = select(['packages/site-config/src/index.ts'])
  assert.equal(result.length, 4)
  assert.ok(result.indexOf('@n3wth/site-config') < result.indexOf('@n3wth/ui'))
  assert.ok(result.indexOf('@n3wth/ui') < result.indexOf('@n3wth/ui-docs'))
})
test('UI changes check docs and prerequisites without unrelated portfolio', () => {
  assert.deepEqual(select(['packages/ui/src/Button.tsx']), ['@n3wth/site-config', '@n3wth/ui', '@n3wth/ui-docs'])
})
test('app-only changes include its prerequisites without siblings', () => {
  assert.deepEqual(select(['apps/portfolio/src/App.tsx']), ['@n3wth/site-config', '@n3wth/portfolio'])
})
test('root lock changes check every workspace', () => assert.equal(select(['package-lock.json']).length, 4))
test('CI still treats a lockfile-only change as rebuild-all', () => {
  assert.equal(affectedWorkspaces(graph, ['package-lock.json']).length, 4)
  assert.equal(affectedWorkspaces(graph, ['apps/skills/package.json', 'package-lock.json']).length, 4)
})
test('deleted manifest checks all even when no longer in current graph', () => assert.equal(select(['packages/removed/package.json']).length, 4))
test('root documentation alone needs no app checks', () => assert.deepEqual(select(['docs/pilot.md', 'README.md']), []))
test('unknown configuration changes conservatively check all', () => assert.equal(select(['.github/workflows/site-check.yml']).length, 4))
test('unchanged comparison needs no checks', () => assert.deepEqual(select([]), []))
test('browser-only changes validate only their app and prerequisites', () => {
  assert.deepEqual(select(['tests/browser/portfolio.spec.ts']), ['@n3wth/site-config', '@n3wth/portfolio'])
})
test('validation-only changes do not deploy applications', () => {
  assert.deepEqual(affectedWorkspaces(graph, ['.github/workflows/site-check.yml', 'tests/browser/portfolio.spec.ts', 'playwright.config.ts', 'scripts/affected.test.mjs'], false, undefined, true), [])
})
test('deployment filtering preserves mixed source changes and unknown root scripts', () => {
  assert.deepEqual(affectedWorkspaces(graph, ['tests/browser/portfolio.spec.ts', 'apps/portfolio/src/App.tsx'], false, undefined, true), ['@n3wth/site-config', '@n3wth/portfolio'])
  assert.deepEqual(affectedWorkspaces(graph, ['package-lock.json'], false, undefined, true), [])
  assert.equal(affectedWorkspaces(graph, ['scripts/affected.mjs'], false, undefined, true).length, 4)
})
test('deployment mode selects an app manifest plus lockfile without siblings', () => {
  const apps = [
    ...graph,
    { name: '@n3wth/skills', path: 'apps/skills', dependencies: { '@n3wth/site-config': '*' } },
  ]
  const result = affectedWorkspaces(apps, ['apps/skills/package.json', 'package-lock.json'], false, undefined, true)
  assert.ok(result.includes('@n3wth/skills'))
  assert.ok(!result.includes('@n3wth/portfolio'))
  assert.ok(!result.includes('@n3wth/ui-docs'))
})
test('deployment mode still rebuilds consumers of a shared package manifest', () => {
  const result = affectedWorkspaces(graph, ['packages/ui/package.json'], false, undefined, true)
  assert.ok(result.includes('@n3wth/ui'))
  assert.ok(result.includes('@n3wth/ui-docs'))
  assert.ok(!result.includes('@n3wth/portfolio'))
})
test('cycles fail instead of producing an invalid build order', () => {
  assert.throws(() => affectedWorkspaces([
    { name: 'a', path: 'packages/a', dependencies: { b: '*' } },
    { name: 'b', path: 'packages/b', dependencies: { a: '*' } },
  ], [], true), /cycle/)
})
