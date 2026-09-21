import assert from 'node:assert/strict'
import test from 'node:test'
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
