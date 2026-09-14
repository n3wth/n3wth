import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
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
test('skills manifest plus lockfile deploys skills without portfolio', () => {
  const apps = [
    ...graph,
    { name: '@n3wth/skills', path: 'apps/skills', dependencies: { '@n3wth/site-config': '*' } },
  ]
  const files = ['apps/skills/package.json', 'package-lock.json']
  const run = () => ({ status: 0, stdout: JSON.stringify(affectedWorkspaces(apps, files, false, undefined, true)) })
  assert.equal(deploymentExitCode('@n3wth/skills', 'previous', run), 1)
  assert.equal(deploymentExitCode('@n3wth/portfolio', 'previous', run), 0)
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

function repository(t) {
  const directory = mkdtempSync(join(tmpdir(), 'vercel-ignore-'))
  t.after(() => rmSync(directory, { recursive: true, force: true }))
  const git = (...args) => {
    const result = spawnSync('git', args, { cwd: directory, encoding: 'utf8' })
    assert.equal(result.status, 0, result.stderr)
    return result.stdout.trim()
  }
  git('init', '-b', 'main')
  git('config', 'user.email', 'test@example.com')
  git('config', 'user.name', 'Test')
  mkdirSync(join(directory, 'scripts'))
  for (const script of ['affected.mjs', 'vercel-ignore.mjs']) {
    copyFileSync(new URL(script, import.meta.url), join(directory, 'scripts', script))
  }
  writeFileSync(join(directory, 'package.json'), JSON.stringify({ workspaces: ['apps/*'] }))
  writeFileSync(join(directory, 'package-lock.json'), JSON.stringify({ packages: {} }))
  for (const app of ['portfolio', 'r3-web']) {
    mkdirSync(join(directory, 'apps', app), { recursive: true })
    writeFileSync(join(directory, 'apps', app, 'package.json'), JSON.stringify({ name: `@n3wth/${app}` }))
  }
  git('add', '.')
  git('commit', '-m', 'base')
  const base = git('rev-parse', 'HEAD')
  git('checkout', '-b', 'fix/r3')
  writeFileSync(join(directory, 'apps/r3-web/page.tsx'), 'r3 change')
  git('add', '.')
  git('commit', '-m', 'r3 only')
  git('remote', 'add', 'origin', directory)
  const ignore = (app, env = {}, cwd = directory) => spawnSync(process.execPath, ['scripts/vercel-ignore.mjs', `@n3wth/${app}`], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, VERCEL: '', VERCEL_ENV: 'preview', VERCEL_GIT_COMMIT_REF: 'fix/r3', VERCEL_GIT_PREVIOUS_SHA: '', ...env },
  })
  return { directory, git, base, ignore }
}

test('first branch preview skips unrelated apps but builds the changed app', t => {
  const { ignore } = repository(t)
  assert.equal(ignore('portfolio').status, 0)
  assert.equal(ignore('r3-web').status, 1)
})

test('Vercel first preview fetches public history without an origin remote', t => {
  const { directory, git, ignore } = repository(t)
  git('remote', 'remove', 'origin')
  // Keep the test offline while exercising the exact public-URL fetch path.
  git('config', `url.file://${directory}.insteadOf`, 'https://github.com/n3wth/n3wth.git')
  assert.equal(ignore('portfolio', { VERCEL: '1' }).status, 0)
  assert.equal(ignore('r3-web', { VERCEL: '1' }).status, 1)
})

test('first production deployment still builds every app', t => {
  const { ignore } = repository(t)
  assert.equal(ignore('portfolio', { VERCEL_ENV: 'production' }).status, 1)
})

test('first preview builds conservatively when its base cannot be fetched', t => {
  const { ignore, git } = repository(t)
  git('remote', 'remove', 'origin')
  assert.equal(ignore('portfolio').status, 1)
})

test('shallow clone recovers the previous deployment commit before comparing', t => {
  const { directory, base, ignore } = repository(t)
  const clone = `${directory}-shallow`
  t.after(() => rmSync(clone, { recursive: true, force: true }))
  const result = spawnSync('git', ['clone', '--depth=1', '--branch=fix/r3', `file://${directory}`, clone], { encoding: 'utf8' })
  assert.equal(result.status, 0, result.stderr)
  assert.equal(ignore('portfolio', { VERCEL_GIT_PREVIOUS_SHA: base }, clone).status, 0)
  assert.equal(ignore('r3-web', { VERCEL_GIT_PREVIOUS_SHA: base }, clone).status, 1)
})

test('first preview finds its branch point in a shallow clone', t => {
  const { directory, ignore } = repository(t)
  const clone = `${directory}-preview`
  t.after(() => rmSync(clone, { recursive: true, force: true }))
  const result = spawnSync('git', ['clone', '--depth=1', '--branch=fix/r3', `file://${directory}`, clone], { encoding: 'utf8' })
  assert.equal(result.status, 0, result.stderr)
  assert.equal(ignore('portfolio', {}, clone).status, 0)
  assert.equal(ignore('r3-web', {}, clone).status, 1)
})

test('force-push removing a deployed change rebuilds that app', t => {
  const { directory, git, ignore } = repository(t)
  git('checkout', '-b', 'old-preview')
  writeFileSync(join(directory, 'apps/portfolio/page.tsx'), 'old deployed change')
  git('add', '.')
  git('commit', '-m', 'portfolio change')
  const previous = git('rev-parse', 'HEAD')
  git('checkout', 'fix/r3')
  assert.equal(ignore('portfolio', { VERCEL_GIT_PREVIOUS_SHA: previous }).status, 1)
})
