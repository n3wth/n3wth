// Skills preview D1 setup: preflight, idempotent migrations, and auth checks.
//
// Isolation choice: every PR gets its own D1 database named
// `n3wth-skills-pr-<N>`. The previous shared `n3wth-skills-preview` database
// meant concurrent Skills previews read and wrote the same auth tables, so a
// magic-link test in one PR could consume tokens or pollute sessions in
// another. Per-PR databases are cheap, created idempotently, migrated from the
// committed `apps/skills/migrations/` files, bound dynamically at deploy time,
// and dropped when the PR closes.
//
// Safety rules enforced here:
// - Preview targets must be preview-shaped (`n3wth-skills-pr-<N>`). The
//   production database name/id is refused before any mutation.
// - Secret checks use names only (`wrangler secret list`). Values are never
//   read, printed, or overwritten: routine deploys preserve the existing
//   BETTER_AUTH_SECRET, and rotation is a separate documented action.
// - Migration apply is idempotent (Wrangler's d1_migrations journal; reruns
//   apply only what is pending). Recovery never deletes user data.
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { previewIdentity, previewPaths } from './cloudflare-preview-config.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const WRANGLER_ENTRYPOINT = resolve(ROOT, 'node_modules', 'wrangler', 'bin', 'wrangler.js')

export const SKILLS_APP = 'skills'
export const SKILLS_PROD_DB_NAME = 'n3wth-skills'
export const SKILLS_PROD_DB_ID = '2f4ee3ca-a435-4b70-b621-4d2ad9192176'
export const SKILLS_PREVIEW_DB_PREFIX = 'n3wth-skills-pr-'
export const SKILLS_DB_BINDING = 'DB'
export const SKILLS_REQUIRED_SECRETS = ['BETTER_AUTH_SECRET']
export const SKILLS_AUTH_URL_VAR = 'BETTER_AUTH_URL'
export const SKILLS_OUTBOX_VAR = 'MAGIC_LINK_OUTBOX'
export const SKILLS_MIGRATIONS_DIR = join(ROOT, 'apps', 'skills', 'migrations')
const PROD_HOSTS = new Set(['skills.n3wth.com'])

export function parsePr(value) {
  const pr = Number(value)
  if (!Number.isSafeInteger(pr) || pr < 1) throw new Error('PR must be a positive safe integer.')
  return pr
}

export function previewSkillsDbName(pr) {
  return `${SKILLS_PREVIEW_DB_PREFIX}${parsePr(pr)}`
}

export function isPreviewSkillsDbName(name) {
  return new RegExp(`^${SKILLS_PREVIEW_DB_PREFIX}[1-9]\\d*$`).test(name || '')
}

// Refuse production (or otherwise non-preview) targets before any mutation.
export function assertPreviewSkillsTarget({ databaseName, databaseId }) {
  if (databaseName === SKILLS_PROD_DB_NAME || databaseId === SKILLS_PROD_DB_ID) {
    throw new Error(`Refusing to touch production Skills database ${databaseName || databaseId}: preview setup only manages ${SKILLS_PREVIEW_DB_PREFIX}<PR>.`)
  }
  if (!isPreviewSkillsDbName(databaseName)) {
    throw new Error(`Refusing to manage database ${databaseName || '(unknown)'}: expected a per-PR preview name like ${SKILLS_PREVIEW_DB_PREFIX}42.`)
  }
}

export function accountIdFromEnv(env = process.env) {
  const accountId = env.CLOUDFLARE_ACCOUNT_ID
  if (!/^[a-f0-9]{32}$/i.test(accountId || '')) {
    throw new Error('CLOUDFLARE_ACCOUNT_ID must be a 32-character hexadecimal ID.')
  }
  return accountId
}

export function listCommittedMigrations(migrationsDir = SKILLS_MIGRATIONS_DIR) {
  if (!existsSync(migrationsDir)) throw new Error(`Missing Skills migrations directory: ${migrationsDir}`)
  return readdirSync(migrationsDir).filter(name => name.endsWith('.sql')).sort()
}

// Compare committed migration files against applied journal rows. Missing rows
// are normal (apply catches up); extra rows mean the database has migrations
// the tree does not, which apply will not undo.
export function diffMigrationHistory({ committed, applied }) {
  const appliedSet = new Set((applied || []).map(name => name.replace(/\.sql$/, '')))
  const committedSet = new Set((committed || []).map(name => name.replace(/\.sql$/, '')))
  return {
    missing: (committed || []).filter(name => !appliedSet.has(name.replace(/\.sql$/, ''))),
    extra: (applied || []).filter(name => !committedSet.has(name.replace(/\.sql$/, ''))),
  }
}

export function recoveryStepsForDrift({ databaseName, missing, extra }) {
  const lines = [
    `Skills preview database ${databaseName} needs attention. No data was deleted.`,
    ...missing.map(name => `Pending migration (safe to apply, rerun setup): ${name}`),
    ...extra.map(name => `Applied migration not in this tree (left untouched): ${name}. If the branch is behind main, merge main and rerun setup.`),
    'If apply failed midway, rerun setup: the journal resumes where it stopped.',
    'If the schema predates the journal (tables exist, journal empty), rerun setup: every committed migration uses CREATE TABLE IF NOT EXISTS, so apply backfills the journal without touching existing rows.',
    'Never delete the database or its tables to recover; restore from the automatic pre-apply backup instead.',
  ]
  return lines.join('\n')
}

// Names-only secret check. `present` must be an array of secret names;
// values are never accepted here so they cannot leak into logs.
export function checkSecretNames({ present, required = SKILLS_REQUIRED_SECRETS }) {
  const seen = new Set(present || [])
  const missing = required.filter(name => !seen.has(name))
  if (missing.length > 0) {
    throw new Error(
      `Skills preview is missing required secrets (names only): ${missing.join(', ')}. ` +
      `Set each once with: wrangler secret put <NAME> --name <preview-worker>. ` +
      'Routine deploys never overwrite secrets; rotation is a separate manual step.',
    )
  }
  return { checked: [...required] }
}

// The auth origin must be exactly this preview's host, never production.
export function checkAuthOrigin({ betterAuthUrl, host }) {
  let origin
  try {
    origin = new URL(betterAuthUrl || '').origin
  } catch {
    throw new Error(`${SKILLS_AUTH_URL_VAR} is not a valid URL for preview host ${host}.`)
  }
  if (origin !== `https://${host}`) {
    throw new Error(`${SKILLS_AUTH_URL_VAR} origin ${origin} does not match preview host https://${host}.`)
  }
  if (PROD_HOSTS.has(new URL(origin).hostname)) {
    throw new Error(`${SKILLS_AUTH_URL_VAR} must never point at production in a preview.`)
  }
  return { origin }
}

export function previewSkillsBinding({ databaseName, databaseId }) {
  assertPreviewSkillsTarget({ databaseName, databaseId })
  return { d1_databases: [{ binding: SKILLS_DB_BINDING, database_name: databaseName, database_id: databaseId }] }
}

export function runWranglerSkills(args, { cwd = ROOT, env = process.env, run = spawnSync } = {}) {
  return run(process.execPath, [WRANGLER_ENTRYPOINT, ...args], { cwd, env, encoding: 'utf8', stdio: 'pipe' })
}

function assertWranglerSucceeded(result, action) {
  if (result.error) throw new Error(`${action} failed: ${result.error.message}`)
  if (result.status !== 0) {
    const detail = `${result.stderr || ''}\n${result.stdout || ''}`.trim().slice(0, 2000)
    throw new Error(`${action} failed: ${detail || `exit ${result.status}`}`)
  }
  return `${result.stdout || ''}`
}

function parseJsonOutput(text, action) {
  try {
    return JSON.parse(text)
  } catch {
    throw new Error(`${action} returned invalid JSON.`)
  }
}

// Minimal setup config: carries the account and the per-PR database entry so
// every D1 command resolves the preview database without reading production
// bindings. Written under .cloudflare next to the generated preview config.
export function writeSkillsSetupConfig({ root = ROOT, pr, databaseName, databaseId, accountId, migrationsDir = SKILLS_MIGRATIONS_DIR }) {
  assertPreviewSkillsTarget({ databaseName, databaseId })
  const paths = previewPaths({ root, app: SKILLS_APP, pr })
  const configPath = join(paths.directory, 'd1-setup.json')
  mkdirSync(paths.directory, { recursive: true })
  const config = {
    account_id: accountId,
    d1_databases: [{ binding: SKILLS_DB_BINDING, database_name: databaseName, database_id: databaseId, migrations_dir: migrationsDir }],
  }
  writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`)
  return configPath
}

// Read-only permission probe and database lookup. A successful list proves the
// token can reach the account and read D1 before anything is mutated.
export function listSkillsPreviewDatabases({ run = spawnSync, env = process.env, cwd = ROOT, configPath } = {}) {
  const output = assertWranglerSucceeded(
    runWranglerSkills(['d1', 'list', '--json', ...(configPath ? ['--config', configPath] : [])], { run, env, cwd }),
    'List preview D1 databases',
  )
  const databases = parseJsonOutput(output, 'List preview D1 databases')
  if (!Array.isArray(databases)) throw new Error('List preview D1 databases returned an unexpected shape.')
  return databases
}

export function findSkillsPreviewDatabase(databases, databaseName) {
  return (databases || []).find(database => database.name === databaseName)
}

export function ensureSkillsPreviewDatabase({ pr, run = spawnSync, env = process.env, cwd = ROOT, log = console.log } = {}) {
  const databaseName = previewSkillsDbName(pr)
  assertPreviewSkillsTarget({ databaseName })
  const accountId = accountIdFromEnv(env)
  const probePath = writeSkillsSetupConfig({ pr, databaseName, databaseId: '00000000-0000-0000-0000-000000000000', accountId })
  const existing = findSkillsPreviewDatabase(listSkillsPreviewDatabases({ run, env, cwd, configPath: probePath }), databaseName)
  if (existing) {
    assertPreviewSkillsTarget({ databaseName, databaseId: existing.uuid })
    log(`Reusing Skills preview database ${databaseName}.`)
    return { databaseName, databaseId: existing.uuid, created: false }
  }
  log(`Creating Skills preview database ${databaseName}.`)
  assertWranglerSucceeded(
    runWranglerSkills(['d1', 'create', databaseName, '--config', probePath], { run, env, cwd }),
    `Create Skills preview database ${databaseName}`,
  )
  const created = findSkillsPreviewDatabase(listSkillsPreviewDatabases({ run, env, cwd, configPath: probePath }), databaseName)
  if (!created?.uuid) throw new Error(`Created ${databaseName} but it is missing from the account database list.`)
  assertPreviewSkillsTarget({ databaseName, databaseId: created.uuid })
  return { databaseName, databaseId: created.uuid, created: true }
}

export function readAppliedMigrations({ configPath, run = spawnSync, env = process.env, cwd = ROOT } = {}) {
  const output = assertWranglerSucceeded(
    runWranglerSkills(['d1', 'execute', SKILLS_DB_BINDING, '--remote', '--json', '--command', 'SELECT name FROM d1_migrations ORDER BY name', '--config', configPath], { run, env, cwd }),
    'Read applied Skills migrations',
  )
  const parsed = parseJsonOutput(output, 'Read applied Skills migrations')
  const batches = Array.isArray(parsed) ? parsed : [parsed]
  const rows = batches.flatMap(batch => batch?.results || [])
  return rows.map(row => row.name).filter(Boolean)
}

// Idempotent: Wrangler applies only unapplied migrations and records them in
// the d1_migrations journal, so rerunning setup after a partial failure or a
// new committed migration is safe.
export function applySkillsPreviewMigrations({ databaseName, databaseId, configPath, run = spawnSync, env = process.env, cwd = ROOT, log = console.log } = {}) {
  assertPreviewSkillsTarget({ databaseName, databaseId })
  const output = assertWranglerSucceeded(
    runWranglerSkills(['d1', 'migrations', 'apply', SKILLS_DB_BINDING, '--remote', '--config', configPath], { run, env, cwd }),
    `Apply Skills preview migrations to ${databaseName}`,
  )
  log(output.split('\n').filter(Boolean).slice(-5).join('\n') || `Migrations applied to ${databaseName}.`)
  return { databaseName, applied: true }
}

export function setupSkillsPreview({ pr, run = spawnSync, env = process.env, cwd = ROOT, log = console.log, migrationsDir = SKILLS_MIGRATIONS_DIR } = {}) {
  const accountId = accountIdFromEnv(env)
  const { databaseName, databaseId, created } = ensureSkillsPreviewDatabase({ pr, run, env, cwd, log })
  const configPath = writeSkillsSetupConfig({ pr, databaseName, databaseId, accountId, migrationsDir })
  const committed = listCommittedMigrations(migrationsDir)
  let applied = []
  try {
    applied = readAppliedMigrations({ configPath, run, env, cwd })
  } catch (error) {
    log(`No readable migration journal yet (${error.message}); treating ${databaseName} as fresh.`)
  }
  const drift = diffMigrationHistory({ committed, applied: applied.map(name => (name.endsWith('.sql') ? name : `${name}.sql`)) })
  if (drift.extra.length > 0 || drift.missing.length > 0) log(recoveryStepsForDrift({ databaseName, missing: drift.missing, extra: drift.extra }))
  try {
    applySkillsPreviewMigrations({ databaseName, databaseId, configPath, run, env, cwd, log })
  } catch (error) {
    throw new Error(`${error.message}\n${recoveryStepsForDrift({ databaseName, missing: drift.missing, extra: drift.extra })}`)
  }
  const binding = previewSkillsBinding({ databaseName, databaseId })
  return { databaseName, databaseId, created, configPath, binding, drift }
}

export function checkSkillsPreviewSecrets({ workerName, configPath, run = spawnSync, env = process.env, cwd = ROOT } = {}) {
  const output = assertWranglerSucceeded(
    runWranglerSkills(['secret', 'list', '--name', workerName, '--format', 'json', ...(configPath ? ['--config', configPath] : [])], { run, env, cwd }),
    `List Skills preview secrets for ${workerName}`,
  )
  const secrets = parseJsonOutput(output, `List Skills preview secrets for ${workerName}`)
  const names = (Array.isArray(secrets) ? secrets : []).map(secret => secret?.name).filter(Boolean)
  return checkSecretNames({ present: names })
}

// Post-deploy check: required secret names exist (values untouched), the auth
// origin is exactly this preview host, and the dev outbox is not enabled.
export function checkSkillsPreview({ pr, root = ROOT, run = spawnSync, env = process.env, cwd = ROOT, log = console.log } = {}) {
  const identity = previewIdentity(SKILLS_APP, parsePr(pr))
  const paths = previewPaths({ root, app: SKILLS_APP, pr: parsePr(pr) })
  if (!existsSync(paths.configPath)) throw new Error(`Missing generated preview config: ${paths.configPath}. Deploy the preview before checking auth config.`)
  const config = JSON.parse(readFileSync(paths.configPath, 'utf8'))
  const secrets = checkSkillsPreviewSecrets({ workerName: identity.workerName, configPath: paths.configPath, run, env, cwd })
  log(`Skills preview secrets present (names only): ${secrets.checked.join(', ')}.`)
  const { origin } = checkAuthOrigin({ betterAuthUrl: config.vars?.[SKILLS_AUTH_URL_VAR], host: identity.host })
  log(`${SKILLS_AUTH_URL_VAR} origin matches preview host: ${origin}.`)
  if (config.vars?.[SKILLS_OUTBOX_VAR] !== undefined) {
    throw new Error(`Refusing preview with ${SKILLS_OUTBOX_VAR} set: the development in-memory email outbox must stay local-only.`)
  }
  return { workerName: identity.workerName, host: identity.host, origin, secrets: secrets.checked }
}

export function deleteSkillsPreviewDatabase({ pr, run = spawnSync, env = process.env, cwd = ROOT, log = console.log } = {}) {
  const databaseName = previewSkillsDbName(pr)
  assertPreviewSkillsTarget({ databaseName })
  const accountId = accountIdFromEnv(env)
  const configPath = writeSkillsSetupConfig({ pr, databaseName, databaseId: '00000000-0000-0000-0000-000000000000', accountId })
  const result = runWranglerSkills(['d1', 'delete', databaseName, '-y', '--config', configPath], { run, env, cwd })
  if (result.error) throw new Error(`Delete Skills preview database ${databaseName} failed: ${result.error.message}`)
  if (result.status !== 0) {
    const detail = `${result.stderr || ''}\n${result.stdout || ''}`.toLowerCase()
    if (/not found|does not exist|no such|unknown database/.test(detail)) {
      log(`Skills preview database ${databaseName} was already absent.`)
      return { databaseName, missing: true }
    }
    throw new Error(`Delete Skills preview database ${databaseName} failed: ${`${result.stderr || ''}\n${result.stdout || ''}`.trim().slice(0, 2000)}`)
  }
  log(`Deleted Skills preview database ${databaseName}.`)
  return { databaseName, missing: false }
}

export function parseSkillsCliArgs(args) {
  const [action, ...options] = args
  if (!['setup', 'check', 'delete-db'].includes(action)) throw new Error('Action must be setup, check, or delete-db.')
  const values = {}
  for (let index = 0; index < options.length; index += 1) {
    const option = options[index]
    if (option !== '--pr' && option !== '--migrations-dir') throw new Error(`Unknown option: ${option}`)
    if (values[option] !== undefined) throw new Error(`Duplicate option: ${option}`)
    const value = options[++index]
    if (!value || value.startsWith('--')) throw new Error(`Missing value for ${option}.`)
    values[option] = value
  }
  return { action, pr: parsePr(values['--pr']), ...(values['--migrations-dir'] ? { migrationsDir: values['--migrations-dir'] } : {}) }
}

function writeGithubOutput(name, value) {
  if (!process.env.GITHUB_OUTPUT) return
  writeFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`, { flag: 'a' })
}

export async function main(args = process.argv.slice(2), env = process.env) {
  const input = parseSkillsCliArgs(args)
  if (input.action === 'setup') {
    const result = setupSkillsPreview({ ...input, env })
    const bindingsJson = JSON.stringify(result.binding)
    console.log(bindingsJson)
    writeGithubOutput('skills-bindings', bindingsJson)
  } else if (input.action === 'check') {
    await checkSkillsPreview({ ...input, env })
  } else {
    await deleteSkillsPreviewDatabase({ ...input, env })
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error(error.message)
    process.exitCode = 1
  })
}
