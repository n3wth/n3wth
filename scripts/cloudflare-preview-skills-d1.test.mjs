import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  SKILLS_PROD_DB_ID,
  SKILLS_PROD_DB_NAME,
  applySkillsPreviewMigrations,
  assertPreviewSkillsTarget,
  checkAuthOrigin,
  checkSecretNames,
  checkSkillsPreview,
  deleteSkillsPreviewDatabase,
  diffMigrationHistory,
  ensureSkillsPreviewDatabase,
  isPreviewSkillsDbName,
  listCommittedMigrations,
  parsePr,
  parseSkillsCliArgs,
  previewSkillsBinding,
  previewSkillsDbName,
  recoveryStepsForDrift,
  setupSkillsPreview,
} from './cloudflare-preview-skills-d1.mjs'
import { createPreviewConfig } from './cloudflare-preview-config.mjs'

const accountId = 'ac23513945eb49f73a89faf1be12384e'
const env = { CLOUDFLARE_ACCOUNT_ID: accountId, CLOUDFLARE_API_TOKEN: 'test-token' }

test('per-PR database names validate and only preview shapes are manageable', () => {
  assert.equal(previewSkillsDbName(42), 'n3wth-skills-pr-42')
  assert.equal(isPreviewSkillsDbName('n3wth-skills-pr-42'), true)
  assert.equal(isPreviewSkillsDbName('n3wth-skills-preview'), false)
  assert.equal(isPreviewSkillsDbName('n3wth-skills'), false)
  assert.equal(isPreviewSkillsDbName('n3wth-skills-pr-0'), false)
  assert.doesNotThrow(() => assertPreviewSkillsTarget({ databaseName: 'n3wth-skills-pr-42', databaseId: 'some-uuid' }))
  assert.throws(() => assertPreviewSkillsTarget({ databaseName: SKILLS_PROD_DB_NAME, databaseId: 'other' }), /production/)
  assert.throws(() => assertPreviewSkillsTarget({ databaseName: 'n3wth-skills-pr-42', databaseId: SKILLS_PROD_DB_ID }), /production/)
  assert.throws(() => assertPreviewSkillsTarget({ databaseName: 'n3wth-skills-preview', databaseId: 'x' }), /per-PR preview name/)
  assert.throws(() => parseSkillsCliArgs(['setup', '--pr', '0']))
  assert.throws(() => parseSkillsCliArgs(['migrate', '--pr', '1']))
  assert.deepEqual(parseSkillsCliArgs(['setup', '--pr', '7']), { action: 'setup', pr: 7 })
  assert.equal(parsePr('9'), 9)
  assert.throws(() => parsePr('x'))
})

test('committed migrations list in order and history diff separates missing from extra', () => {
  const dir = mkdtempSync(join(tmpdir(), 'skills-migrations-'))
  try {
    writeFileSync(join(dir, '0002_app.sql'), 'select 2')
    writeFileSync(join(dir, '0001_better_auth.sql'), 'select 1')
    writeFileSync(join(dir, 'notes.txt'), 'ignore me')
    assert.deepEqual(listCommittedMigrations(dir), ['0001_better_auth.sql', '0002_app.sql'])
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
  assert.ok(listCommittedMigrations(fileURLToPath(new URL('../apps/skills/migrations/', import.meta.url))).length >= 2)
  const diff = diffMigrationHistory({ committed: ['0001_better_auth.sql', '0002_app.sql'], applied: ['0001_better_auth'] })
  assert.deepEqual(diff, { missing: ['0002_app.sql'], extra: [] })
  const drifted = diffMigrationHistory({ committed: ['0001_better_auth.sql'], applied: ['0001_better_auth', '0003_future'] })
  assert.deepEqual(drifted.extra, ['0003_future'])
  const recovery = recoveryStepsForDrift({ databaseName: 'n3wth-skills-pr-1', missing: drifted.missing, extra: drifted.extra })
  assert.match(recovery, /No data was deleted/)
  assert.match(recovery, /left untouched/)
  assert.match(recovery, /Never delete the database/)
})

test('secret check uses names only and never echoes values', () => {
  assert.deepEqual(checkSecretNames({ present: ['BETTER_AUTH_SECRET', 'OTHER'] }), { checked: ['BETTER_AUTH_SECRET'] })
  try {
    checkSecretNames({ present: ['SOME_VALUE_WITH_SECRET_VALUE=s3cr3t-payload'] })
    assert.fail('should throw for missing secret')
  } catch (error) {
    assert.match(error.message, /BETTER_AUTH_SECRET/)
    assert.doesNotMatch(error.message, /s3cr3t-payload/)
    assert.match(error.message, /never overwrite/)
  }
})

test('auth origin must equal the preview host and never production', () => {
  assert.deepEqual(checkAuthOrigin({ betterAuthUrl: 'https://skills-pr-42.preview.n3wth.com', host: 'skills-pr-42.preview.n3wth.com' }), {
    origin: 'https://skills-pr-42.preview.n3wth.com',
  })
  assert.throws(() => checkAuthOrigin({ betterAuthUrl: 'https://skills.n3wth.com', host: 'skills-pr-42.preview.n3wth.com' }), /does not match/)
  assert.throws(() => checkAuthOrigin({ betterAuthUrl: 'not-a-url', host: 'skills-pr-42.preview.n3wth.com' }), /not a valid URL/)
})

test('preview binding carries the per-PR database and refuses production', () => {
  assert.deepEqual(previewSkillsBinding({ databaseName: 'n3wth-skills-pr-5', databaseId: 'db-uuid' }), {
    d1_databases: [{ binding: 'DB', database_name: 'n3wth-skills-pr-5', database_id: 'db-uuid' }],
  })
  assert.throws(() => previewSkillsBinding({ databaseName: SKILLS_PROD_DB_NAME, databaseId: 'x' }), /production/)
})

test('setup reuses an existing per-PR database and applies only pending migrations', () => {
  const calls = []
  const migrationsDir = mkdtempSync(join(tmpdir(), 'skills-setup-'))
  writeFileSync(join(migrationsDir, '0001_better_auth.sql'), 'select 1')
  const run = (...args) => {
    calls.push(args[1])
    const argv = args[1].slice(1)
    if (argv[0] === 'd1' && argv[1] === 'list') {
      return { status: 0, stdout: JSON.stringify([{ name: 'n3wth-skills-pr-11', uuid: 'preview-uuid-11' }]) }
    }
    if (argv[0] === 'd1' && argv[1] === 'execute') {
      return { status: 0, stdout: JSON.stringify([{ results: [{ name: '0001_better_auth' }] }]) }
    }
    if (argv[0] === 'd1' && argv[1] === 'migrations') {
      assert.equal(argv[2], 'apply')
      assert.equal(argv[3], 'DB')
      assert.ok(argv.includes('--remote'), 'migrations apply targets the remote preview database')
      return { status: 0, stdout: 'No migrations to apply' }
    }
    throw new Error(`Unexpected wrangler call: ${argv.join(' ')}`)
  }
  const logged = []
  const result = setupSkillsPreview({ pr: 11, run, env, log: message => logged.push(message), migrationsDir })
  assert.equal(result.databaseName, 'n3wth-skills-pr-11')
  assert.equal(result.databaseId, 'preview-uuid-11')
  assert.equal(result.created, false)
  assert.ok(!calls.some(argv => argv.includes('create')), 'existing database is reused, never recreated')
  assert.ok(!calls.some(argv => argv.includes('delete')), 'setup never deletes')
  assert.deepEqual(result.binding.d1_databases[0].database_id, 'preview-uuid-11')
  rmSync(migrationsDir, { recursive: true, force: true })
})

test('setup creates a missing per-PR database, then migrates idempotently on rerun', () => {
  const state = { databases: [] }
  const run = (...args) => {
    const argv = args[1].slice(1)
    if (argv[0] === 'd1' && argv[1] === 'list') return { status: 0, stdout: JSON.stringify(state.databases) }
    if (argv[0] === 'd1' && argv[1] === 'create') {
      state.databases.push({ name: argv[2], uuid: 'new-preview-uuid' })
      return { status: 0, stdout: `Created ${argv[2]}` }
    }
    if (argv[0] === 'd1' && argv[1] === 'execute') return { status: 0, stdout: JSON.stringify([{ results: [] }]) }
    if (argv[0] === 'd1' && argv[1] === 'migrations') return { status: 0, stdout: 'Applied 2 migrations' }
    throw new Error(`Unexpected wrangler call: ${argv.join(' ')}`)
  }
  const migrationsDir = mkdtempSync(join(tmpdir(), 'skills-create-'))
  writeFileSync(join(migrationsDir, '0001_better_auth.sql'), 'select 1')
  const logs = []
  const first = setupSkillsPreview({ pr: 12, run, env, log: message => logs.push(message), migrationsDir })
  assert.equal(first.created, true)
  assert.equal(first.databaseId, 'new-preview-uuid')
  const second = setupSkillsPreview({ pr: 12, run, env, log: () => {}, migrationsDir })
  assert.equal(second.created, false, 'rerun reuses the database: setup is idempotent')
  rmSync(migrationsDir, { recursive: true, force: true })
})

test('setup refuses to create anything when the account already maps the name to production', () => {
  let created = false
  const run = (...args) => {
    const argv = args[1].slice(1)
    if (argv[0] === 'd1' && argv[1] === 'list') {
      return { status: 0, stdout: JSON.stringify([{ name: 'n3wth-skills-pr-13', uuid: SKILLS_PROD_DB_ID }]) }
    }
    if (argv[1] === 'create') {
      created = true
      return { status: 0, stdout: 'created' }
    }
    throw new Error(`Unexpected wrangler call: ${argv.join(' ')}`)
  }
  assert.throws(() => ensureSkillsPreviewDatabase({ pr: 13, run, env, log: () => {} }), /production/)
  assert.equal(created, false)
})

test('failed migration apply reports recovery without destructive advice', () => {
  const run = () => ({ status: 1, stderr: 'D1_ERROR: table already exists' })
  try {
    applySkillsPreviewMigrations({ databaseName: 'n3wth-skills-pr-3', databaseId: 'uuid-3', configPath: '/tmp/x.json', run, env, log: () => {} })
    assert.fail('should throw')
  } catch (error) {
    assert.match(error.message, /Apply Skills preview migrations/)
    assert.doesNotMatch(error.message, /delete/i)
  }
  const migrationsDir = mkdtempSync(join(tmpdir(), 'skills-fail-'))
  writeFileSync(join(migrationsDir, '0001_better_auth.sql'), 'select 1')
  const state = { databases: [] }
  const listing = (...args) => {
    const argv = args[1].slice(1)
    if (argv[1] === 'list') return { status: 0, stdout: JSON.stringify(state.databases) }
    if (argv[1] === 'create') {
      state.databases.push({ name: argv[2], uuid: 'uuid-14' })
      return { status: 0, stdout: 'created' }
    }
    if (argv[1] === 'execute') return { status: 0, stdout: JSON.stringify([{ results: [] }]) }
    return { status: 1, stderr: 'D1_ERROR: table already exists' }
  }
  assert.throws(() => setupSkillsPreview({ pr: 14, run: listing, env, log: () => {}, migrationsDir }), /resume|journal|backup/i)
  rmSync(migrationsDir, { recursive: true, force: true })
})

test('post-deploy check requires secret names, matching origin, and no dev outbox', () => {
  const root = mkdtempSync(join(tmpdir(), 'skills-check-'))
  try {
    const dir = join(root, '.cloudflare', 'skills-pr-21')
    mkdirSync(dir, { recursive: true })
    const writeConfig = vars => writeFileSync(join(dir, 'wrangler.json'), JSON.stringify({ name: 'n3wth-skills-pr-21', vars }))
    const run = (...args) => {
      const argv = args[1].slice(1)
      assert.equal(argv[0], 'secret')
      return { status: 0, stdout: JSON.stringify([{ name: 'BETTER_AUTH_SECRET', type: 'secret_text' }]) }
    }
    writeConfig({ BETTER_AUTH_URL: 'https://skills-pr-21.preview.n3wth.com' })
    const ok = checkSkillsPreview({ pr: 21, root, run, env, log: () => {} })
    assert.equal(ok.origin, 'https://skills-pr-21.preview.n3wth.com')

    writeConfig({ BETTER_AUTH_URL: 'https://skills-pr-21.preview.n3wth.com', MAGIC_LINK_OUTBOX: '1' })
    assert.throws(() => checkSkillsPreview({ pr: 21, root, run, env, log: () => {} }), /outbox.*local-only/i)

    writeConfig({ BETTER_AUTH_URL: 'https://skills.n3wth.com' })
    assert.throws(() => checkSkillsPreview({ pr: 21, root, run, env, log: () => {} }), /does not match/)

    writeConfig({ BETTER_AUTH_URL: 'https://skills-pr-21.preview.n3wth.com' })
    const withoutSecret = (...args) => ({ status: 0, stdout: JSON.stringify([{ name: 'SOMETHING_ELSE' }]) })
    assert.throws(() => checkSkillsPreview({ pr: 21, root, run: withoutSecret, env, log: () => {} }), /missing required secrets.*BETTER_AUTH_SECRET/)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('preview configs never carry the development email outbox', () => {
  const { config } = createPreviewConfig({
    source: { main: '.open-next/worker.js', vars: { BETTER_AUTH_URL: 'https://skills.n3wth.com', MAGIC_LINK_OUTBOX: '1' } },
    sourcePath: '/repo/apps/skills/wrangler.jsonc',
    root: '/repo',
    app: 'skills',
    pr: 23,
    accountId,
  })
  assert.equal(config.vars.MAGIC_LINK_OUTBOX, undefined)
  assert.equal(config.vars.BETTER_AUTH_URL, 'https://skills-pr-23.preview.n3wth.com')
})

test('delete drops only the per-PR database and tolerates absence', () => {
  const calls = []
  const run = (...args) => {
    calls.push(args[1].slice(1))
    return { status: 0, stdout: 'deleted' }
  }
  const deleted = deleteSkillsPreviewDatabase({ pr: 31, run, env, log: () => {} })
  assert.deepEqual(deleted, { databaseName: 'n3wth-skills-pr-31', missing: false })
  assert.ok(calls[0].includes('delete') && calls[0].includes('n3wth-skills-pr-31') && calls[0].includes('-y'))
  const missing = deleteSkillsPreviewDatabase({
    pr: 32,
    run: () => ({ status: 1, stdout: '', stderr: 'ERROR: database not found' }),
    env,
    log: () => {},
  })
  assert.equal(missing.missing, true)
  assert.throws(() => deleteSkillsPreviewDatabase({ pr: 'x', run, env, log: () => {} }))
})

test('workflow sets up per-PR D1, checks auth config, and cleans up on close', () => {
  const workflow = readFileSync(fileURLToPath(new URL('../.github/workflows/cloudflare-preview.yml', import.meta.url)), 'utf8')
  assert.match(workflow, /Setup Skills preview D1/, 'setup step exists')
  assert.match(workflow, /cloudflare-preview-skills-d1\.mjs setup --pr/, 'setup runs before deploy')
  assert.match(workflow, /cloudflare-preview-skills-d1\.mjs check --pr/, 'post-deploy auth check exists')
  assert.match(workflow, /cloudflare-preview-skills-d1\.mjs delete-db --pr/, 'close drops the per-PR database')
  assert.doesNotMatch(workflow, /n3wth-skills-preview/, 'no shared preview database binding remains')
  assert.doesNotMatch(workflow, new RegExp(SKILLS_PROD_DB_ID), 'production database id never appears in the preview workflow')
  assert.match(workflow, /scripts\/cloudflare-preview-skills-d1\.test\.mjs/, 'lifecycle gate runs the new tests')
})
