import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// The public sites deployed to Cloudflare, in a stable order. Every deployment
// surface reads this one list: the preview config, the pull request preview
// workflow and the production release workflow. Keep the app slug equal to the
// directory under apps/ so wrangler config paths resolve as apps/<app>/wrangler.jsonc.
export const DEPLOY_APPS = [
  { workspace: '@n3wth/portfolio', app: 'portfolio' },
  { workspace: '@n3wth/garden', app: 'garden' },
  { workspace: '@n3wth/skills', app: 'skills' },
]

export const DEPLOY_APP_SLUGS = DEPLOY_APPS.map(entry => entry.app)

export function deployAppForWorkspace(workspace) {
  return DEPLOY_APPS.find(entry => entry.workspace === workspace)?.app
}

// Production hosts mirror the case list in .github/workflows/cloudflare-production.yml.
// Keep both in sync so release records point at the same URL the readiness gate checks.
export const PRODUCTION_HOSTS = {
  portfolio: 'n3wth.com',
  garden: 'garden.n3wth.com',
  skills: 'skills.n3wth.com',
}

export function productionUrlForApp(app) {
  const host = PRODUCTION_HOSTS[app]
  return host ? `https://${host}/` : undefined
}

// One release record per deployed app: the source commit, the Worker version
// reported by `wrangler deploy` ('unknown' when the log has none), the
// environment, the production URL, and the readiness gate result.
export function buildReleaseRecord({ app, sha, version = 'unknown', env = 'production', url = productionUrlForApp(app), readiness = 'unknown' }) {
  if (!DEPLOY_APP_SLUGS.includes(app)) throw new Error(`Unknown production app: ${app}`)
  if (!sha) throw new Error('buildReleaseRecord requires a commit SHA.')
  return { app, sha, version, env, url, readiness, recordedAt: new Date().toISOString() }
}

export function formatReleaseSummary(records) {
  const rows = records
    .map(record => `| ${record.app} | \`${record.sha.slice(0, 12)}\` | ${record.version} | ${record.env} | ${record.url} | ${record.readiness} |`)
    .join('\n')
  return `| app | commit | worker version | env | url | readiness |\n| --- | --- | --- | --- | --- | --- |\n${rows}`
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(process.argv.includes('--slugs') ? DEPLOY_APP_SLUGS.join(' ') : JSON.stringify(DEPLOY_APPS))
}
