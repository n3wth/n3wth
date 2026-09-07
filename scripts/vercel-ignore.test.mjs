import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { affectedWorkspaces } from './affected.mjs'
import { deploymentExitCode } from './vercel-ignore.mjs'

const graph = [
  { name: '@n3wth/portfolio', path: 'apps/portfolio', dependencies: { '@n3wth/site-config': '*' } },
  { name: '@n3wth/ui-docs', path: 'apps/ui-docs', dependencies: { '@n3wth/ui': '*', '@n3wth/site-config': '*' } },
  { name: '@n3wth/ui', path: 'packages/ui' },
  { name: '@n3wth/site-config', path: 'packages/site-config' },
]
const runFor = files => () => ({ status: 0, stdout: JSON.stringify(affectedWorkspaces(graph, files)) })

test('missing previous deployment builds without invoking comparison', () => {
  assert.equal(deploymentExitCode('@n3wth/portfolio', undefined, () => assert.fail('must not compare')), 1)
})
test('deployment selection excludes validation-only changes', () => {
  assert.equal(deploymentExitCode('@n3wth/portfolio', 'previous', (_command, args) => {
    assert.ok(args.includes('--deployment'))
    return { status: 0, stdout: '[]' }
  }), 0)
})
test('shared configuration deploys both consumers', () => {
  for (const app of ['@n3wth/portfolio', '@n3wth/ui-docs']) {
    assert.equal(deploymentExitCode(app, 'previous', runFor(['packages/site-config/index.ts'])), 1)
  }
})
test('portfolio-only change skips UI docs despite shared prerequisite', () => {
  assert.equal(deploymentExitCode('@n3wth/ui-docs', 'previous', runFor(['apps/portfolio/src/App.tsx'])), 0)
  assert.equal(deploymentExitCode('@n3wth/portfolio', 'previous', runFor(['apps/portfolio/src/App.tsx'])), 1)
})
test('UI-only change deploys docs without deploying portfolio', () => {
  assert.equal(deploymentExitCode('@n3wth/portfolio', 'previous', runFor(['packages/ui/src/Button.tsx'])), 0)
  assert.equal(deploymentExitCode('@n3wth/ui-docs', 'previous', runFor(['packages/ui/src/Button.tsx'])), 1)
})
test('invalid output and failed comparison always build', () => {
  for (const result of [
    { status: 0, stdout: 'not json' },
    { status: 0, stdout: '{}' },
    { status: 0, stdout: '[null]' },
    { status: 1, stdout: '[]' },
    { status: null, error: new Error('timeout'), stdout: '' },
  ]) assert.equal(deploymentExitCode('@n3wth/portfolio', 'previous', () => result), 1)
})
test('unresolvable previous SHA builds using the real affected CLI', () => {
  assert.equal(deploymentExitCode('@n3wth/portfolio', 'missing-vercel-deployment-ref'), 1)
})
test('ignore command works from the app root and builds without previous SHA', () => {
  const result = spawnSync(process.execPath, ['../../scripts/vercel-ignore.mjs', '@n3wth/portfolio'], {
    cwd: fileURLToPath(new URL('../apps/portfolio/', import.meta.url)),
    env: { ...process.env, VERCEL_GIT_PREVIOUS_SHA: '' },
    encoding: 'utf8',
  })
  assert.equal(result.status, 1)
  assert.match(result.stdout, /Building deployment/)
})
