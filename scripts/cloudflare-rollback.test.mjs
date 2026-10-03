import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import {
  buildRollbackPlan,
  checkReadinessOnce,
  parseRollbackArgs,
  runRollback,
} from './cloudflare-rollback.mjs'

test('parseRollbackArgs parses flags and values', () => {
  const args = parseRollbackArgs(['--app', 'garden', '--version', 'v1', '--dry-run'])
  assert.deepEqual(args, { app: 'garden', version: 'v1', 'dry-run': true })
})

test('parseRollbackArgs rejects unknown apps at plan time, not parse time', () => {
  const args = parseRollbackArgs(['--app', 'nope', '--version', 'v1'])
  assert.throws(() => buildRollbackPlan(args), /Unknown production app: nope/)
})

test('parseRollbackArgs rejects missing values and stray positionals', () => {
  assert.throws(() => parseRollbackArgs(['--app']), /Missing value for --app/)
  assert.throws(() => parseRollbackArgs(['garden']), /Unexpected argument/)
})

test('buildRollbackPlan requires a version and resolves config and URL', () => {
  const plan = buildRollbackPlan({ app: 'skills', version: 'abc123', sha: 'deadbee' })
  assert.equal(plan.config, 'apps/skills/wrangler.jsonc')
  assert.equal(plan.url, 'https://skills.n3wth.com/')
  assert.deepEqual(plan.commands, [
    ['wrangler', 'versions', 'view', 'abc123', '--config', 'apps/skills/wrangler.jsonc'],
    ['wrangler', 'rollback', 'abc123', '--config', 'apps/skills/wrangler.jsonc'],
  ])
  assert.throws(() => buildRollbackPlan({ app: 'garden' }), /requires a Worker --version/)
})

test('checkReadinessOnce passes on HTTP 200 and fails otherwise', async () => {
  assert.deepEqual(await checkReadinessOnce('https://x/', async () => ({ status: 200 })), { ok: true, status: 200 })
  assert.deepEqual(await checkReadinessOnce('https://x/', async () => ({ status: 500 })), { ok: false, status: 500 })
})

test('preview rollbacks select the matching Worker config and readiness URL', () => {
  const plan = buildRollbackPlan({ app: 'garden', version: 'v1', pr: 422 })
  assert.equal(plan.config, '.cloudflare/garden-pr-422/wrangler.json')
  assert.equal(plan.env, 'preview')
  assert.equal(plan.url, 'https://garden-pr-422.preview.n3wth.com/')
  assert.ok(plan.commands.every(command => command.at(-1) === plan.config))
  assert.throws(() => buildRollbackPlan({ app: 'garden', version: 'v1', pr: 0 }), /positive safe integer/)
})

test('a readiness URL or environment cannot disguise the rollback target', () => {
  assert.throws(() => buildRollbackPlan({
    app: 'garden', version: 'v1', url: 'https://garden-pr-422.preview.n3wth.com/',
  }), /does not match/)
  assert.throws(() => buildRollbackPlan({ app: 'garden', version: 'v1', env: 'preview' }), /does not match/)
  assert.throws(() => buildRollbackPlan({ app: 'garden', version: 'v1', pr: 422, env: 'production' }), /does not match/)
})

test('release evidence is preserved after deployment or readiness failure', () => {
  const workflow = readFileSync(new URL('../.github/workflows/cloudflare-production.yml', import.meta.url), 'utf8')
  for (const name of ['Write release records', 'Upload release records']) {
    const step = workflow.split(`      - name: ${name}\n`)[1]?.split('\n      - name:')[0]
    assert.ok(step, `${name} step exists`)
    assert.match(step, /^        if: always\(\)$/m, `${name} must run after an earlier step fails`)
  }
})

test('runRollback dry-run logs commands without executing', async () => {
  const plan = buildRollbackPlan({ app: 'garden', version: 'v9' })
  const logged = []
  let executed = 0
  const record = await runRollback(plan, {
    dryRun: true,
    exec: () => { executed += 1 },
    log: message => logged.push(message),
  })
  assert.equal(executed, 0)
  assert.ok(logged.some(line => line.includes('wrangler rollback v9')))
  assert.equal(record.result, 'dry-run')
  assert.equal(record.readiness, 'skipped')
})

test('runRollback executes, checks readiness, and records rolled-back', async () => {
  const plan = buildRollbackPlan({ app: 'portfolio', version: 'v3', sha: 'cafef00d' })
  const ran = []
  const record = await runRollback(plan, {
    exec: (cmd, rest) => { ran.push([cmd, ...rest].join(' ')) },
    fetchFn: async () => ({ status: 200 }),
    log: () => {},
  })
  assert.equal(ran.length, 2)
  assert.equal(record.result, 'rolled-back')
  assert.equal(record.sha, 'cafef00d')
  assert.equal(record.url, 'https://n3wth.com/')
})

test('runRollback throws when readiness fails after applying', async () => {
  const plan = buildRollbackPlan({ app: 'garden', version: 'v3' })
  await assert.rejects(
    () => runRollback(plan, {
      exec: () => {},
      fetchFn: async () => ({ status: 503 }),
      log: () => {},
    }),
    /readiness check failed/,
  )
})
