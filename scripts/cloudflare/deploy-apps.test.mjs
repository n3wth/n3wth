import assert from 'node:assert/strict'
import test from 'node:test'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { DEPLOY_APPS, DEPLOY_APP_SLUGS, deployAppForWorkspace } from './deploy-apps.mjs'
import { readWorkspaces } from '../workspace/affected.mjs'
import { PREVIEW_APPS } from './cloudflare-preview-config.mjs'

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
})
