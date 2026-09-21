// Single-app Cloudflare rollback: restore a known-good Worker version for one
// app without rebuilding a different commit, then run the same live readiness
// check as a normal deployment.
//
// Usage:
//   node scripts/cloudflare-rollback.mjs --app garden --version <version-id> \
//     --sha <source-commit> --acknowledge-d1 [--url https://...] [--out record.json]
//   node scripts/cloudflare-rollback.mjs --app garden --version <version-id> --dry-run
//
// Code rollback does not restore D1 data. The command refuses to run against a
// live target unless --acknowledge-d1 confirms schema compatibility was checked.
// Demonstrate the procedure in a non-production (preview) environment first by
// passing --url for the preview host; see docs/workspace/deployment.md.
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DEPLOY_APP_SLUGS, productionUrlForApp } from './deploy-apps.mjs'

export function parseRollbackArgs(argv) {
  const args = {}
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i]
    if (!flag.startsWith('--')) throw new Error(`Unexpected argument: ${flag}`)
    const key = flag.slice(2)
    if (key === 'dry-run' || key === 'acknowledge-d1') {
      args[key] = true
    } else {
      const value = argv[i + 1]
      if (!value || value.startsWith('--')) throw new Error(`Missing value for ${flag}.`)
      args[key] = value
      i += 1
    }
  }
  return args
}

// Pure plan construction so tests cover validation without touching wrangler.
export function buildRollbackPlan({ app, version, sha = 'unknown', url, env = 'production', out } = {}) {
  if (!DEPLOY_APP_SLUGS.includes(app)) {
    throw new Error(`Unknown production app: ${app}. Expected one of: ${DEPLOY_APP_SLUGS.join(', ')}.`)
  }
  if (!version) throw new Error('buildRollbackPlan requires a Worker --version id from the release record.')
  const config = `apps/${app}/wrangler.jsonc`
  return {
    app,
    version,
    sha,
    env,
    config,
    url: url || productionUrlForApp(app),
    commands: [
      ['wrangler', 'versions', 'view', version, '--config', config],
      ['wrangler', 'rollback', version, '--config', config],
    ],
    out,
  }
}

export async function checkReadinessOnce(url, fetchFn = fetch) {
  const response = await fetchFn(url, { redirect: 'follow' })
  return { ok: response.status === 200, status: response.status }
}

export async function runRollback(plan, { dryRun = false, exec = execFileSync, fetchFn = fetch, log = console.log } = {}) {
  for (const [cmd, ...rest] of plan.commands) {
    log(`${dryRun ? '[dry-run] ' : ''}${[cmd, ...rest].join(' ')}`)
    if (!dryRun) exec(cmd, rest, { stdio: 'inherit' })
  }
  let readiness = 'skipped'
  if (!dryRun) {
    try {
      const result = await checkReadinessOnce(plan.url, fetchFn)
      readiness = result.ok ? `pass (HTTP ${result.status})` : `fail (HTTP ${result.status})`
    } catch (error) {
      readiness = `fail (${error.message})`
    }
    log(`Readiness check for ${plan.url}: ${readiness}`)
  }
  const record = {
    app: plan.app,
    sha: plan.sha,
    version: plan.version,
    env: plan.env,
    url: plan.url,
    readiness,
    result: dryRun ? 'dry-run' : readiness.startsWith('pass') ? 'rolled-back' : 'rollback-unverified',
    recordedAt: new Date().toISOString(),
  }
  log(JSON.stringify(record, null, 2))
  if (plan.out && !dryRun) writeFileSync(plan.out, `${JSON.stringify(record, null, 2)}\n`)
  if (!dryRun && !readiness.startsWith('pass')) {
    throw new Error(`Rollback applied but readiness check failed: ${readiness}`)
  }
  return record
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = parseRollbackArgs(process.argv.slice(2))
  const dryRun = Boolean(args['dry-run'])
  if (!dryRun && !args['acknowledge-d1']) {
    console.error('Refusing to roll back: code rollback does not restore D1 data. Re-run with --acknowledge-d1 after checking database/schema compatibility.')
    process.exit(1)
  }
  const plan = buildRollbackPlan({ app: args.app, version: args.version, sha: args.sha, url: args.url, env: args.env, out: args.out })
  console.error('Code rollback does not restore D1 data; only the Worker bundle is restored. Other apps, domains and bindings are untouched.')
  await runRollback(plan, { dryRun })
}
