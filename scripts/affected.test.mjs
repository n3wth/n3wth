import test from 'node:test'
import assert from 'node:assert/strict'
import { affectedWorkspaces } from './affected.mjs'

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
test('deleted manifest checks all even when no longer in current graph', () => assert.equal(select(['packages/removed/package.json']).length, 4))
test('root documentation alone needs no app checks', () => assert.deepEqual(select(['docs/pilot.md', 'README.md']), []))
test('unknown configuration changes conservatively check all', () => assert.equal(select(['.github/workflows/site-check.yml']).length, 4))
test('unchanged comparison needs no checks', () => assert.deepEqual(select([]), []))
test('cycles fail instead of producing an invalid build order', () => {
  assert.throws(() => affectedWorkspaces([
    { name: 'a', path: 'packages/a', dependencies: { b: '*' } },
    { name: 'b', path: 'packages/b', dependencies: { a: '*' } },
  ], [], true), /cycle/)
})
