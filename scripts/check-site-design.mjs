import { readFileSync, realpathSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const version = JSON.parse(readFileSync(resolve(root, 'packages/ui/package.json'), 'utf8')).version
const canonical = realpathSync(resolve(root, 'packages/ui/dist/site.css'))
const sites = new Set(['garden', 'kit', 'portfolio', 'r3-web', 'skills', 'ui-docs'])
for (const entry of readdirSync(resolve(root, 'apps'), { withFileTypes: true })) {
  if (!entry.isDirectory()) continue
  const manifest = resolve(root, 'apps', entry.name, 'package.json')
  const app = JSON.parse(readFileSync(manifest, 'utf8'))
  if (!app.dependencies?.['@n3wth/ui']) {
    if (sites.has(entry.name)) throw new Error(`${app.name} is missing the shared UI dependency`)
    continue
  }
  if (app.dependencies['@n3wth/ui'] !== version) throw new Error(`${app.name} must use workspace UI ${version}`)
  const resolved = realpathSync(createRequire(manifest).resolve('@n3wth/ui/site.css'))
  if (resolved !== canonical) throw new Error(`${app.name} resolves a separate UI package: ${resolved}`)
  console.log(`${app.name}: shared site foundation verified`)
}
