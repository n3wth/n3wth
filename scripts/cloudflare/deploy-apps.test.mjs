import assert from 'node:assert/strict'
import test from 'node:test'
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { DEPLOY_APPS, DEPLOY_APP_SLUGS, deployAppForWorkspace } from './deploy-apps.mjs'
import { readWorkspaces } from '../workspace/affected.mjs'
import { PREVIEW_APPS } from './cloudflare-preview-config.mjs'
import { deployPortfolio } from './deploy-portfolio.mjs'

const { assertCurrentMain } = createRequire(import.meta.url)('./current-main.cjs')

const root = fileURLToPath(new URL('../../', import.meta.url))
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
  assert.deepEqual([...PREVIEW_APPS], [...DEPLOY_APP_SLUGS, 'ui-docs', 'r3-web', 'skills'])
})

test('deployAppForWorkspace maps known workspaces and ignores others', () => {
  assert.equal(deployAppForWorkspace('@n3wth/garden'), 'garden')
  assert.equal(deployAppForWorkspace('@n3wth/ui'), undefined)
  assert.equal(deployAppForWorkspace('@n3wth/r3-web'), undefined)
  assert.equal(deployAppForWorkspace('@n3wth/ui-docs'), undefined)
  assert.equal(deployAppForWorkspace('@n3wth/skills'), undefined)
})

test('the CLI prints slugs and JSON for the workflows', () => {
  assert.equal(execFileSync(process.execPath, [scriptPath, '--slugs'], { encoding: 'utf8' }).trim(), DEPLOY_APP_SLUGS.join(' '))
  assert.deepEqual(JSON.parse(execFileSync(process.execPath, [scriptPath], { encoding: 'utf8' })), DEPLOY_APPS)
})

test('production deploy requires main and the full validation job', () => {
  const workflow = readFileSync(new URL('../../.github/workflows/cloudflare-production.yml', import.meta.url), 'utf8')
  assert.match(workflow, /validate:\s*\n\s*name:.*\n\s*if: github\.ref == 'refs\/heads\/main'/)
  assert.match(workflow, /ref: \$\{\{ github\.sha \}\}/)
  for (const command of ['npm run check', 'npm run check:package', 'node docs/editorial/visuals/check.mjs', 'npm run check:browser']) {
    assert.ok(workflow.includes(`run: ${command}`), `missing production check: ${command}`)
  }
  assert.ok(workflow.indexOf('npx playwright install --with-deps chromium') < workflow.indexOf('npm run check:package'))
  assert.match(workflow, /deploy:\s*\n\s*name:.*\n\s*needs: validate/)
  assert.match(workflow, /queue: max/)
  assert.match(workflow, /node scripts\/cloudflare\/deploy-apps\.mjs --slugs/)
  assert.doesNotMatch(workflow, /BEFORE_SHA|event\.before/)
  const guard = workflow.indexOf('await assertCurrentMain(github, context)')
  const deploy = workflow.indexOf('node scripts/cloudflare/deploy-portfolio.mjs')
  assert.ok(guard >= 0 && deploy > guard, 'current-main check must precede deployment')
  assert.doesNotMatch(workflow, /wrangler secret put/)
})

test('the current-main guard rejects stale targets and API failures', async () => {
  const context = { repo: { owner: 'owner', repo: 'repo' }, sha: 'target' }
  const github = { rest: { repos: { getBranch: async request => {
    assert.deepEqual(request, { owner: 'owner', repo: 'repo', branch: 'main' })
    return { data: { commit: { sha: 'target' } } }
  } } } }
  await assert.doesNotReject(assertCurrentMain(github, context))
  await assert.rejects(assertCurrentMain(github, { ...context, sha: 'stale' }), /no longer the current main/)
  github.rest.repos.getBranch = async () => { throw new Error('GitHub unavailable') }
  await assert.rejects(assertCurrentMain(github, context), /GitHub unavailable/)
})

test('portfolio deploy supplies both secrets in one private temporary file and removes it', () => {
  const directory = mkdtempSync(join(tmpdir(), 'portfolio-deploy-test-'))
  let path
  try {
    const env = { RUNNER_TEMP: directory, RESEND_API_KEY: 'test-key', RESEND_UNSUBSCRIBE_SECRET: `  ${'s'.repeat(32)}  ` }
    deployPortfolio(env, (command, args) => {
      assert.equal(command, 'npm')
      assert.deepEqual(args.slice(0, -1), ['exec', '--', 'wrangler', 'deploy', '--config', 'apps/portfolio/wrangler.jsonc', '--secrets-file'])
      path = args.at(-1)
      assert.equal(statSync(path).mode & 0o777, 0o600)
      assert.deepEqual(JSON.parse(readFileSync(path, 'utf8')), { RESEND_API_KEY: env.RESEND_API_KEY, RESEND_UNSUBSCRIBE_SECRET: env.RESEND_UNSUBSCRIBE_SECRET })
      return { status: 0 }
    })
    assert.equal(existsSync(path), false)
    assert.throws(() => deployPortfolio({ ...env, RESEND_UNSUBSCRIBE_SECRET: '' }, () => assert.fail('must not deploy')), /Both Resend secrets/)
    for (const invalid of [{ RESEND_API_KEY: '  ' }, { RESEND_UNSUBSCRIBE_SECRET: 'short' }, { RESEND_UNSUBSCRIBE_SECRET: `  ${'s'.repeat(31)}  ` }]) {
      assert.throws(() => deployPortfolio({ ...env, ...invalid }, () => assert.fail('must not deploy')), /Both Resend secrets/)
    }
    assert.throws(() => deployPortfolio(env, (_command, args) => { path = args.at(-1); return { status: 1 } }), /Portfolio deploy failed/)
    assert.equal(existsSync(path), false)
    assert.throws(() => deployPortfolio(env, (_command, args) => { path = args.at(-1); return { error: new Error('cannot start') } }), /cannot start/)
    assert.equal(existsSync(path), false)
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('portfolio deploy entrypoint invokes Wrangler without exposing secrets and cleans up', () => {
  const directory = mkdtempSync(join(tmpdir(), 'portfolio-deploy-process-'))
  try {
    const stub = join(directory, 'npm')
    writeFileSync(stub, `#!/usr/bin/env node
const fs = require('node:fs')
const args = process.argv.slice(2)
const path = args.at(-1)
const secrets = JSON.parse(fs.readFileSync(path, 'utf8'))
fs.writeFileSync(process.env.TEST_REPORT, JSON.stringify({ args, path, mode: fs.statSync(path).mode & 0o777, valid: secrets.RESEND_API_KEY === process.env.RESEND_API_KEY && secrets.RESEND_UNSUBSCRIBE_SECRET === process.env.RESEND_UNSUBSCRIBE_SECRET }))
process.exit(Number(process.env.TEST_EXIT))
`, { mode: 0o755 })
    const report = join(directory, 'report.json')
    const env = { ...process.env, PATH: `${directory}:${process.env.PATH}`, RUNNER_TEMP: directory, TEST_REPORT: report, RESEND_API_KEY: 'private-test-key', RESEND_UNSUBSCRIBE_SECRET: 's'.repeat(32) }
    for (const exit of ['0', '1']) {
      const result = spawnSync(process.execPath, [fileURLToPath(new URL('./deploy-portfolio.mjs', import.meta.url))], { env: { ...env, TEST_EXIT: exit }, encoding: 'utf8' })
      assert.equal(result.status, Number(exit))
      assert.ok(!`${result.stdout}${result.stderr}`.includes(env.RESEND_API_KEY))
      assert.ok(!`${result.stdout}${result.stderr}`.includes(env.RESEND_UNSUBSCRIBE_SECRET))
      const actual = JSON.parse(readFileSync(report, 'utf8'))
      assert.deepEqual(actual.args.slice(0, -1), ['exec', '--', 'wrangler', 'deploy', '--config', 'apps/portfolio/wrangler.jsonc', '--secrets-file'])
      assert.equal(actual.valid, true)
      assert.equal(actual.mode, 0o600)
      assert.equal(existsSync(actual.path), false)
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
