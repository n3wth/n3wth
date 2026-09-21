import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// The public sites deployed to Cloudflare, in a stable order. Every deployment
// surface reads this one list: the preview config, the pull request preview
// workflow and the production release workflow. Keep the app slug equal to the
// directory under apps/ so wrangler config paths resolve as apps/<app>/wrangler.jsonc.
export const DEPLOY_APPS = [
  { workspace: '@n3wth/ui-docs', app: 'ui-docs' },
  { workspace: '@n3wth/portfolio', app: 'portfolio' },
  { workspace: '@n3wth/garden', app: 'garden' },
  { workspace: '@n3wth/skills', app: 'skills' },
]

export const DEPLOY_APP_SLUGS = DEPLOY_APPS.map(entry => entry.app)

export function deployAppForWorkspace(workspace) {
  return DEPLOY_APPS.find(entry => entry.workspace === workspace)?.app
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(process.argv.includes('--slugs') ? DEPLOY_APP_SLUGS.join(' ') : JSON.stringify(DEPLOY_APPS))
}
