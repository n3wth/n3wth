import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export function deployPortfolio(env = process.env, run = spawnSync) {
  const { RESEND_API_KEY, RESEND_UNSUBSCRIBE_SECRET } = env
  if (!RESEND_API_KEY || !RESEND_UNSUBSCRIBE_SECRET) throw new Error('Both Resend secrets are required')
  const directory = mkdtempSync(join(env.RUNNER_TEMP || tmpdir(), 'portfolio-secrets-'))
  try {
    const path = join(directory, 'secrets.json')
    writeFileSync(path, JSON.stringify({ RESEND_API_KEY, RESEND_UNSUBSCRIBE_SECRET }), { mode: 0o600 })
    const result = run('npm', ['exec', '--', 'wrangler', 'deploy', '--config', 'apps/portfolio/wrangler.jsonc', '--secrets-file', path], { env, stdio: 'inherit' })
    if (result.error) throw result.error
    if (result.status !== 0) throw new Error(`Portfolio deploy failed (${result.status})`)
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) deployPortfolio()
