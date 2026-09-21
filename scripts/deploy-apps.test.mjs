import assert from 'node:assert/strict'
import test from 'node:test'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { DEPLOY_APPS, DEPLOY_APP_SLUGS, PRODUCTION_HOSTS, buildReleaseRecord, deployAppForWorkspace, formatReleaseSummary, productionUrlForApp } from './deploy-apps.mjs'
import { readWorkspaces } from './affected.mjs'
import { PREVIEW_APPS } from './cloudflare-preview-config.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const scriptPath = fileURLToPath(new URL('./deploy-apps.mjs', import.meta.url))

test('the deploy list excludes the retired r3 and UI sites', () => {
  const apps = readWorkspaces(root)
    .filter(workspace => workspace.path.startsWith('apps/') && !workspace.path.includes('/', 5))
    .map(workspace => workspace.name)
    .filter(name => !['@n3wth/r3-web', '@n3wth/ui-docs'].includes(name))
    .sort()
  assert.deepEqual(DEPLOY_APPS.map(entry => entry.workspace).sort(), apps)
})

test('each app slug equals its directory so wrangler config paths resolve', () => {
  for (const { workspace, app } of DEPLOY_APPS) {
    assert.equal(workspace, `@n3wth/${app}`)
  }
})

test('preview apps read the same source list', () => {
  assert.deepEqual([...PREVIEW_APPS], [...DEPLOY_APP_SLUGS, 'ui-docs', 'r3-web'])
})

test('deployAppForWorkspace maps known workspaces and ignores others', () => {
  assert.equal(deployAppForWorkspace('@n3wth/garden'), 'garden')
  assert.equal(deployAppForWorkspace('@n3wth/ui'), undefined)
  assert.equal(deployAppForWorkspace('@n3wth/r3-web'), undefined)
  assert.equal(deployAppForWorkspace('@n3wth/ui-docs'), undefined)
})

test('production URLs cover every deploy app', () => {
  assert.deepEqual(Object.keys(PRODUCTION_HOSTS).sort(), [...DEPLOY_APP_SLUGS].sort())
  assert.equal(productionUrlForApp('garden'), 'https://garden.n3wth.com/')
  assert.equal(productionUrlForApp('unknown'), undefined)
})

test('buildReleaseRecord captures commit, version, env, URL and readiness', () => {
  const record = buildReleaseRecord({ app: 'portfolio', sha: 'abcdef1234567890', version: 'v1', readiness: 'pass (HTTP 200)' })
  assert.equal(record.url, 'https://n3wth.com/')
  assert.equal(record.env, 'production')
  assert.ok(Date.parse(record.recordedAt))
  assert.throws(() => buildReleaseRecord({ app: 'nope', sha: 'abc' }), /Unknown production app/)
  assert.throws(() => buildReleaseRecord({ app: 'garden' }), /requires a commit SHA/)
})

test('formatReleaseSummary renders one markdown row per record', () => {
  const summary = formatReleaseSummary([buildReleaseRecord({ app: 'garden', sha: 'abcdef1234567890', version: 'v2', readiness: 'pass (HTTP 200)' })])
  assert.match(summary, /\| garden \| `abcdef123456` \| v2 \| production \| https:\/\/garden\.n3wth\.com\/ \| pass \(HTTP 200\) \|/)
})

test('the CLI prints slugs and JSON for the workflows', () => {
  assert.equal(execFileSync(process.execPath, [scriptPath, '--slugs'], { encoding: 'utf8' }).trim(), DEPLOY_APP_SLUGS.join(' '))
  assert.deepEqual(JSON.parse(execFileSync(process.execPath, [scriptPath], { encoding: 'utf8' })), DEPLOY_APPS)
})
